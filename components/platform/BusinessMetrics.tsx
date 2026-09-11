import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { money } from "@/lib/platform/types";
export default async function BusinessMetrics({
  businessId,
  actorId,
  period = "30",
}: {
  businessId: string;
  actorId: string;
  period?: string;
}) {
  const now = new Date(),
    today = new Date(now.getTime() - 5 * 3600000).toISOString().slice(0, 10);
  const [year, month] = today.split("-").map(Number);
  let from = new Date(today + "T00:00:00-05:00"),
    until = now;
  if (period === "month") from = new Date(Date.UTC(year, month - 1, 1, 5));
  else if (period === "previous") {
    from = new Date(Date.UTC(year, month - 2, 1, 5));
    until = new Date(Date.UTC(year, month - 1, 1, 5));
  } else
    from = new Date(
      from.getTime() - ((period === "7" ? 7 : 30) - 1) * 86400000,
    );
  const { data, error } = await getSupabaseAdmin().rpc("rp_business_stats", {
    p_actor: actorId,
    p_business: businessId,
    p_from: from.toISOString(),
    p_until: until.toISOString(),
  });
  if (error) throw new Error("No pudimos calcular las estadísticas.");
  return (
    <section className="rp-stack" aria-label="Estadísticas del comercio">
      <nav className="rp-category-chips" aria-label="Período">
        {[
          ["7", "Últimos 7 días"],
          ["30", "Últimos 30 días"],
          ["month", "Este mes"],
          ["previous", "Mes anterior"],
        ].map(([v, l]) => (
          <Link
            key={v}
            className="rp-button secondary"
            aria-current={period === v ? "page" : undefined}
            href={"/business?period=" + v}
          >
            {l}
          </Link>
        ))}
      </nav>
      <dl className="rp-metrics">
        <div>
          <dt>Beneficios utilizados</dt>
          <dd>{data.uses}</dd>
        </div>
        <div>
          <dt>Conductores únicos</dt>
          <dd>{data.drivers}</dd>
        </div>
        <div>
          <dt>Ahorro registrado</dt>
          <dd>{money(Number(data.savings))}</dd>
        </div>
        <div>
          <dt>Facturación</dt>
          <dd className="rp-muted">Sin datos registrados</dd>
        </div>
      </dl>
      <p className="rp-muted">
        Ahorro conocido en {data.valued_uses} de {data.uses} usos. Los
        descuentos variables sin importe no están incluidos.
      </p>
      <p>
        Más utilizado:{" "}
        <strong>{data.top_benefit || "Todavía no hay usos"}</strong>
      </p>
      {data.daily.length > 0 && (
        <details>
          <summary>Evolución por día</summary>
          <div className="rp-list">
            {data.daily.map((d: { day: string; uses: number }) => (
              <div className="rp-list-row" key={d.day}>
                <span>{d.day.split("-").reverse().join("/")}</span>
                <strong>{d.uses} usos</strong>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
