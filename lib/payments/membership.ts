import "server-only";
import { randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/platform/data";
import { AppError } from "@/lib/platform/app-api";
import { dateLabel } from "@/lib/platform/types";
import type { Profile } from "@/lib/platform/types";
import { createYappyPayment, yappyConfig } from "./yappy";
import { parsePlan, type PlanId } from "./yappy-protocol";

// The membership rules, shared by the web (/driver/membership,
// /api/payments/yappy) and the phone app (/api/app/driver/membership*).
// Starting a payment asks Yappy to send the request to the driver's Yappy
// app; only the signed IPN marks it paid (see YAPPY.md).

export type AccessState = {
  status: string;
  lifetime: boolean;
  has_access?: boolean;
  valid_until?: string | null;
};

/** What Membresía shows before the checkout: access, free period, receipts. */
export async function membershipPage(profile: Profile) {
  const db = getSupabaseAdmin();
  const [setting, access, receipts] = await Promise.all([
    db.from("rp_settings").select("value").eq("key", "free_access").single(),
    db.rpc("rp_access_state", { p_driver: profile.id }),
    db
      .from("rp_payment_orders")
      .select("id,paid_at,amount_cents")
      .eq("driver_id", profile.id)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(24),
  ]);
  if (setting.error) throw new Error("No pudimos consultar el acceso.");
  if (access.error) throw new Error("No pudimos consultar tu membresía.");
  return {
    state: access.data as AccessState,
    free: setting.data.value === true,
    verified: profile.status === "verified",
    receipts: (receipts.data || []) as {
      id: string;
      paid_at: string | null;
      amount_cents?: number;
    }[],
    paymentsEnabled: Boolean(yappyConfig()),
  };
}

/** Current validity and the last orders, polled while a payment is pending. */
export async function paymentSummary(profile: Profile) {
  const db = getSupabaseAdmin();
  const [membership, orders, access] = await Promise.all([
    db
      .from("rp_memberships")
      .select("valid_until")
      .eq("driver_id", profile.id)
      .maybeSingle(),
    db
      .from("rp_payment_orders")
      .select("id,status,created_at,paid_at,amount_cents,plan")
      .eq("driver_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(12),
    db.rpc("rp_access_state", { p_driver: profile.id }),
  ]);
  if (membership.error || orders.error || access.error)
    throw new AppError("No pudimos consultar tu membresía.", 503);
  return {
    validUntil: (access.data?.valid_until as string | null) || null,
    orders: orders.data as {
      id: string;
      status: string;
      created_at: string;
      paid_at: string | null;
      amount_cents: number;
      plan?: PlanId;
    }[],
    access: access.data as AccessState,
  };
}

/**
 * Creates the order and the Yappy payment request. Same checks for both
 * entrances: verified driver, payments switched on, a plan, consent and an
 * 8-digit Yappy number starting with 6.
 */
export async function startPayment(
  profile: Profile,
  body: Record<string, unknown>,
) {
  if (profile.role !== "driver")
    throw new AppError("Inicia sesión como conductor.", 401);
  if (profile.status !== "verified")
    throw new AppError("Verifica tu perfil antes de pagar.", 403);
  const config = yappyConfig();
  if (!config) throw new AppError("El pago aún no está habilitado.", 503);
  // A client that sends no plan only ever offered the monthly one.
  const plan = body.plan === undefined ? "monthly" : parsePlan(body.plan);
  if (!plan) throw new AppError("Elige un plan.", 400);
  if (body.accepted !== true)
    throw new AppError("Acepta el precio y las condiciones del pago.", 400);
  const phone = String(body.phone || "")
    .replace(/[ ()-]/g, "")
    .replace(/^\+?507/, "");
  if (!/^6\d{7}$/.test(phone))
    throw new AppError("Escribe tu número de Yappy de 8 dígitos.", 400);
  const db = getSupabaseAdmin(),
    orderId = randomBytes(7).toString("hex");
  try {
    await rateLimit("payment:" + profile.id, 5, 600);
    const order = await db.rpc("rp_create_payment", {
      p_driver: profile.id,
      p_order: orderId,
      p_domain: config.domain,
      p_plan: plan,
    });
    if (order.error)
      throw new AppError(
        order.error.code === "P0001"
          ? order.error.message
          : "No pudimos preparar el pago.",
        409,
      );
    // Never retry this external request automatically: a timeout may still create a payable order.
    const payment = await createYappyPayment(orderId, phone, plan);
    const saved = await db
      .from("rp_payment_orders")
      .update({ transaction_id: payment.transactionId })
      .eq("id", orderId);
    if (saved.error)
      throw new Error(
        "No pudimos guardar la referencia. Revisa tu membresía antes de intentar otro pago.",
      );
    return { orderId, ...payment };
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(
      "No pudimos completar la conexión. Si confirmaste en Yappy, revisa tu membresía. Espera 10 minutos antes de intentar otro pago.",
      503,
    );
  }
}

/** A paid order as a receipt; null when it isn't this driver's or not paid. */
export async function receiptData(profile: Profile, id: string) {
  if (!/^[a-zA-Z0-9]{1,15}$/.test(id)) return null;
  const { data: o, error } = await getSupabaseAdmin()
    .from("rp_payment_orders")
    .select("id,amount_cents,plan,paid_at,period_start,period_end,transaction_id")
    .eq("id", id)
    .eq("driver_id", profile.id)
    .eq("status", "paid")
    .maybeSingle();
  if (error) throw new Error("No pudimos cargar el recibo.");
  return o as {
    id: string;
    amount_cents: number;
    plan: PlanId | null;
    paid_at: string | null;
    period_start: string | null;
    period_end: string | null;
    transaction_id: string | null;
  } | null;
}

/** The receipt's rows, in the web's order and wording. */
export function receiptRows(
  o: NonNullable<Awaited<ReturnType<typeof receiptData>>>,
  name: string,
  email: string | null,
): [string, string][] {
  return [
    ["Referencia", o.id],
    ...(o.transaction_id
      ? [["Transacción Yappy", o.transaction_id] as [string, string]]
      : []),
    ["Fecha de pago", o.paid_at ? dateLabel(o.paid_at) : "—"],
    ["Método", "Yappy"],
    ["Cliente", name || "Conductor RidePerks"],
    ...(email ? [["Correo", email] as [string, string]] : []),
    [
      "Período",
      o.period_start && o.period_end
        ? dateLabel(o.period_start) + " – " + dateLabel(o.period_end)
        : o.plan === "annual"
          ? "12 meses"
          : "1 mes",
    ],
  ];
}
