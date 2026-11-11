import { requireAdmin } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Heading, Empty } from "@/components/platform/ui";
import AdminShell from "@/components/platform/AdminShell";
import { money, dateLabel } from "@/lib/platform/types";
import { CreditPayment } from "@/components/platform/AccessForms";
export const metadata = {
  title: "Pagos de membresías · RidePerks",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await requireAdmin();
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("rp_payment_orders")
    .select(
      "id,status,amount_cents,plan,created_at,paid_at,period_end,rp_profiles(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("No pudimos cargar los pagos.");
  const labels: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
    expired: "Vencido",
  };
  return (
    <AdminShell>
      <Heading title="Pagos">
        Últimas 100 órdenes. Solo una confirmación válida de Yappy activa la
        membresía.
      </Heading>
      {data.length ? (
        <div className="rp-admin-rows">
          {data.map((o) => (
            <article className="rp-admin-row" key={o.id}>
              <div className="rp-admin-row-main">
                <div>
                  <h3>
                    {(o.rp_profiles as unknown as { full_name: string })
                      ?.full_name || "Conductor"}
                  </h3>
                  <p>
                    {money(o.amount_cents / 100)} ·{" "}
                    {o.plan === "annual" ? "Plan anual" : "Plan mensual"} ·{" "}
                    {dateLabel(o.created_at)}
                  </p>
                  <p>
                    Ref. {o.id}
                    {o.period_end
                      ? " · Vigencia hasta " + dateLabel(o.period_end)
                      : ""}
                  </p>
                </div>
                <span
                  className={
                    "rp-badge " +
                    (o.status === "paid"
                      ? "good"
                      : o.status === "pending"
                        ? "pending"
                        : "")
                  }
                >
                  {labels[o.status]}
                </span>
              </div>
              {o.status !== "paid" && <CreditPayment order={o.id} />}
            </article>
          ))}
        </div>
      ) : (
        <Empty title="Todavía no hay órdenes">
          <p>Los pagos de membresía con Yappy aparecerán aquí.</p>
        </Empty>
      )}
      <p className="rp-muted">
        Para investigar un cobro, compara la referencia con Yappy Comercial.
        Este panel no ejecuta devoluciones. Las órdenes pendientes pasan a
        «Vencido» después de 24 horas; si Yappy confirma un pago que no llegó,
        acredítalo manualmente con su motivo.
      </p>
    </AdminShell>
  );
}
