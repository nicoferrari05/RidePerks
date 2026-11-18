import {
  appOptions,
  appRoute,
  panamaDate,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { membershipPage, paymentSummary } from "@/lib/payments/membership";

// Membresía: what /driver/membership and its Yappy checkout show, in one
// call (the app polls it every few seconds while a payment is pending).
const ORDER_LABELS: Record<string, string> = {
  pending: "Pendiente de confirmación",
  paid: "Pagado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  expired: "Vencido",
};

export const GET = appRoute(async () => {
  const p = await requireAppProfile("driver");
  const [page, summary] = await Promise.all([
    membershipPage(p),
    paymentSummary(p),
  ]);
  const now = Date.now();
  const latest = summary.orders[0];
  return {
    state: { status: page.state.status, lifetime: page.state.lifetime },
    free: page.free,
    verified: page.verified,
    payments_enabled: page.paymentsEnabled,
    phone: (p.phone || "").replace(/^\+?507/, "").replace(/\D/g, ""),
    valid_until_label:
      summary.validUntil && new Date(summary.validUntil).getTime() > now
        ? panamaDate(summary.validUntil, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null,
    // Renewal opens in the last seven days, as on the web.
    renew_open:
      !summary.validUntil ||
      new Date(summary.validUntil).getTime() < now + 7 * 86400000,
    pending:
      latest?.status === "pending" &&
      now - new Date(latest.created_at).getTime() < 600000,
    orders: summary.orders.map((o) => ({
      id: o.id,
      status: o.status,
      title:
        "$" +
        (o.amount_cents / 100).toFixed(2) +
        " · " +
        (o.plan === "annual" ? "Anual · " : "") +
        (ORDER_LABELS[o.status] || o.status),
      detail: panamaDate(o.created_at, {}) + " · Ref. " + o.id,
    })),
    receipts: page.receipts.map((r) => ({
      id: r.id,
      title: "Pago de $" + ((r.amount_cents ?? 1500) / 100).toFixed(2),
      date: r.paid_at
        ? panamaDate(r.paid_at, { day: "numeric", month: "short", year: "numeric" })
        : r.id,
    })),
  };
});

export const OPTIONS = appOptions;
