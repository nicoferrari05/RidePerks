import { notFound } from "next/navigation";
import { requireDriver } from "@/lib/platform/data";
import { receiptData, receiptRows } from "@/lib/payments/membership";
import { emailForUser } from "@/lib/email";
import { SubHeader } from "@/components/platform/ui";
import LogoMark from "@/components/LogoMark";
import { PrintButton } from "@/components/platform/AppForms";
import { money } from "@/lib/platform/types";
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
  const o = await receiptData(p, id);
  if (!o) notFound();
  const email = await emailForUser(p.id);
  const rows = receiptRows(o, p.full_name, email);
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
        <p className="rp-muted">
          Membresía RidePerks ·{" "}
          {o.plan === "annual" ? "plan anual, 12 meses" : "1 mes"}
        </p>
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
