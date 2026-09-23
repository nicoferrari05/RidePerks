import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Transactional email through Resend's HTTP API. Without RESEND_API_KEY and
// EMAIL_FROM this is a no-op: callers never fail because mail isn't set up.
export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
      signal: AbortSignal.timeout(10000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function emailForUser(userId: string) {
  const { data } = await getSupabaseAdmin().auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

const dateFormat = new Intl.DateTimeFormat("es-PA", {
  dateStyle: "long",
  timeZone: "America/Panama",
});
const site = () => process.env.SITE_URL || "https://rideperks.app";

export async function notifyPaymentReceived(orderId: string) {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("rp_payment_orders")
    .select("driver_id,period_end,amount_cents")
    .eq("id", orderId)
    .maybeSingle();
  if (!data?.period_end) return;
  const to = await emailForUser(data.driver_id);
  if (!to) return;
  await sendEmail(
    to,
    "Recibimos tu pago · RidePerks",
    "Recibimos tu pago de $" +
      (data.amount_cents / 100).toFixed(2) +
      ".\n\nTu membresía está activa hasta el " +
      dateFormat.format(new Date(data.period_end)) +
      ".\nReferencia: " +
      orderId +
      "\n\nPuedes ver tu vigencia en " +
      site() +
      "/driver/membership. La renovación es manual: no hacemos cargos automáticos.",
  );
}

export async function notifyMembershipExpiring(
  driverId: string,
  validUntil: string,
) {
  const to = await emailForUser(driverId);
  if (!to) return false;
  return sendEmail(
    to,
    "Tu membresía RidePerks vence pronto",
    "Tu membresía vence el " +
      dateFormat.format(new Date(validUntil)) +
      ".\n\nSi renuevas antes, el mes nuevo se suma al tiempo que te queda: " +
      site() +
      "/driver/membership",
  );
}

export async function notifyVerification(
  driverId: string,
  approved: boolean,
  notes: string,
) {
  const to = await emailForUser(driverId);
  if (!to) return;
  await sendEmail(
    to,
    approved
      ? "Tu cuenta RidePerks fue verificada"
      : "Necesitamos una nueva imagen para verificar tu cuenta",
    approved
      ? "Ya verificamos tu cuenta de conductor. Entra a " +
          site() +
          "/driver/dashboard para ver tu membresía y tus beneficios."
      : "No pudimos aprobar tu verificación todavía.\n\n" +
          (notes ? notes + "\n\n" : "") +
          "Sube una nueva captura en " +
          site() +
          "/driver/verify",
  );
}
