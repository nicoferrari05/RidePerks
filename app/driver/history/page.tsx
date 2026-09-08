import { requireDriver, getRedemptions } from "@/lib/platform/data";
import { money, dateLabel } from "@/lib/platform/types";
import { Heading, Empty } from "@/components/platform/ui";
export const metadata = { title: "Historial · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  const rows = await getRedemptions(p.id);
  const sum = rows.reduce((s, r) => s + Number(r.savings_amount || 0), 0);
  return (
    <div className="rp-stack">
      <Heading title="Tu ahorro, uso por uso">
        Los beneficios que ya disfrutaste, confirmados por cada comercio.
      </Heading>
      {rows.length ? (
        <>
          <div className="rp-panel">
            <h2>{money(sum)} de ahorro registrado</h2>
            <p className="rp-muted">
              En tus últimos {rows.length} usos. Los beneficios sin monto fijo
              no suman al total.
            </p>
          </div>
          <div className="rp-list">
            {rows.map((r) => (
              <div className="rp-list-row" key={r.id}>
                <div>
                  <h3>{r.benefit_title}</h3>
                  <p className="rp-muted">
                    {r.business_name}
                    <br />
                    {dateLabel(r.redeemed_at)}
                  </p>
                </div>
                <span className="rp-amount">
                  {r.savings_amount === null
                    ? "Confirmado"
                    : money(Number(r.savings_amount))}
                </span>
              </div>
            ))}
          </div>
          {rows.length === 500 && (
            <p className="rp-muted">Se muestran los últimos 500 usos.</p>
          )}
        </>
      ) : (
        <Empty
          title="Todavía no tienes usos registrados"
          href="/driver/benefits"
          label="Explorar beneficios"
        >
          <p>
            Genera un código desde un beneficio y preséntalo al comercio. Tu
            ahorro aparecerá aquí cuando lo confirmen.
          </p>
        </Empty>
      )}
    </div>
  );
}
