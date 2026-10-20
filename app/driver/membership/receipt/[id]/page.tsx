import { notFound } from "next/navigation";
import { requireDriver } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { emailForUser } from "@/lib/email";
import { SubHeader } from "@/components/platform/ui";
import LogoMark from "@/components/LogoMark";
import { PrintButton } from "@/components/platform/AppForms";
import { dateLabel, money } from "@/lib/platform/types";
export const metadata = { title: "Recibo · RidePerks" };
// A paid membership order as a printable receipt ("Guardar como PDF" from
// the print dialog). Only the driver who paid can open it.
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await requireDriver();
  const { id } = await params;
  if (!/^[a-zA-Z0-9]{1,15}$/.test(id)) notFound();
  const { data: o, error } = await getSupabaseAdmin()
    .from("rp_payment_orders")
    .select("id,amount_cents,paid_at,period_start,period_end,transaction_id")
    .eq("id", id)
    .eq("driver_id", p.id)
    .eq("status", "paid")
    .maybeSingle();
  if (error) throw new Error("No pudimos cargar el recibo.");
  if (!o) notFound();
  const email = await emailForUser(p.id);
  const rows: [string, string][] = [
    ["Referencia", o.id],
    ...(o.transaction_id
      ? [["Transacción Yappy", o.transaction_id] as [string, string]]
      : []),
    ["Fecha de pago", o.paid_at ? dateLabel(o.paid_at) : "—"],
    ["Método", "Yappy"],
    ["Cliente", p.full_name || "Conductor RidePerks"],
    ...(email ? [["Correo", email] as [string, string]] : []),
    [
      "Período",
      o.period_start && o.period_end
        ? dateLabel(o.period_start) + " – " + dateLabel(o.period_end)
        : "1 mes",
    ],
  ];
  return (
    <div className="rp-stack">
      <div className="rp-no-print">
        <SubHeader
          back="/driver/membership"
          backLabel="Volver a Membresía"
          title="Recibo"
        />
      </div>
      <article className="rp-receipt">
        <header>
          <LogoMark variant="text" size="sm" />
          <span className="rp-badge good">Pagado</span>
        </header>
        <h2>Recibo de pago</h2>
        <p className="rp-receipt-total">{money(o.amount_cents / 100)}</p>
        <p className="rp-muted">Membresía RidePerks · 1 mes</p>
        <dl>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="rp-muted rp-receipt-note">
          Renovación manual, sin cargos automáticos. Este recibo confirma tu
          pago en RidePerks; no es una factura fiscal.
        </p>
      </article>
      <div className="rp-no-print">
        <PrintButton />
        <p className="rp-muted mt-3">
          En el teléfono, elige «Guardar como PDF» o «Compartir» en la ventana
          de impresión.
        </p>
      </div>
    </div>
  );
}
