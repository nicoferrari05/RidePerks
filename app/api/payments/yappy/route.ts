import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { currentProfile, rateLimit } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { createYappyPayment, yappyConfig } from "@/lib/payments/yappy";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Solicitud no autorizada." },
      { status: 403 },
    );
  const profile = await currentProfile();
  if (!profile || profile.role !== "driver")
    return NextResponse.json(
      { error: "Inicia sesión como conductor." },
      { status: 401 },
    );
  if (profile.status !== "verified")
    return NextResponse.json(
      { error: "Verifica tu perfil antes de pagar." },
      { status: 403 },
    );
  const config = yappyConfig();
  if (!config)
    return NextResponse.json(
      { error: "El pago aún no está habilitado." },
      { status: 503 },
    );
  let phone: string;
  try {
    const body = await request.json();
    if (body.accepted !== true)
      return NextResponse.json(
        { error: "Acepta el precio y las condiciones del pago." },
        { status: 400 },
      );
    phone = String(body.phone || "")
      .replace(/[ ()-]/g, "")
      .replace(/^\+?507/, "");
    if (!/^6\d{7}$/.test(phone)) throw new Error();
  } catch {
    return NextResponse.json(
      { error: "Escribe tu número de Yappy de 8 dígitos." },
      { status: 400 },
    );
  }
  const db = getSupabaseAdmin(),
    orderId = randomBytes(7).toString("hex");
  try {
    await rateLimit("payment:" + profile.id, 5, 600);
    const order = await db.rpc("rp_create_payment", {
      p_driver: profile.id,
      p_order: orderId,
      p_domain: config.domain,
    });
    if (order.error)
      return NextResponse.json(
        {
          error:
            order.error.code === "P0001"
              ? order.error.message
              : "No pudimos preparar el pago.",
        },
        { status: 409 },
      );
    // Never retry this external request automatically: a timeout may still create a payable order.
    const payment = await createYappyPayment(orderId, phone);
    const saved = await db
      .from("rp_payment_orders")
      .update({ transaction_id: payment.transactionId })
      .eq("id", orderId);
    if (saved.error)
      throw new Error(
        "No pudimos guardar la referencia. Revisa tu membresía antes de intentar otro pago.",
      );
    return NextResponse.json(
      { orderId, ...payment },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "No pudimos completar la conexión. Si confirmaste en Yappy, revisa tu membresía. Espera 10 minutos antes de intentar otro pago.",
      },
      { status: 503 },
    );
  }
}
export async function GET() {
  const profile = await currentProfile();
  if (!profile || profile.role !== "driver")
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const db = getSupabaseAdmin();
  const [membership, orders, access] = await Promise.all([
    db
      .from("rp_memberships")
      .select("valid_until")
      .eq("driver_id", profile.id)
      .maybeSingle(),
    db
      .from("rp_payment_orders")
      .select("id,status,created_at,paid_at,amount_cents")
      .eq("driver_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(12),
    db.rpc("rp_access_state", { p_driver: profile.id }),
  ]);
  if (membership.error || orders.error || access.error)
    return NextResponse.json(
      { error: "No pudimos consultar tu membresía." },
      { status: 503 },
    );
  return NextResponse.json(
    {
      validUntil: access.data?.valid_until || null,
      orders: orders.data,
      access: access.data,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
