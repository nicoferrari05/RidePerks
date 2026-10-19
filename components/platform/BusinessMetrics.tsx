import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { money } from "@/lib/platform/types";

export type BusinessStats = {
  uses: number;
  drivers: number;
  savings: number;
  valued_uses: number;
  top_benefit: string | null;
  daily: { day: string; uses: number }[];
};

export const periods = [
  ["7", "7 días"],
  ["30", "30 días"],
  ["month", "Este mes"],
  ["previous", "Mes pasado"],
] as const;

// Owner-only statistics for a period (Panama time), via rp_business_stats.
export async function loadBusinessStats(
  businessId: string,
  actorId: string,
  period = "30",
): Promise<BusinessStats> {
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
  return data;
}

export default function BusinessMetrics({
  data,
  period,
}: {
  data: BusinessStats;
  period: string;
}) {
  const drivers = Number(data.drivers) || 0;
  const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
  const nextMilestone =
    milestones.find((m) => m > drivers) ||
    Math.ceil((drivers + 1) / 5000) * 5000;
  const milestonePct = Math.max(0, Math.min(drivers / nextMilestone, 1)) * 100;
  return (
    <section className="rp-stack" aria-label="Estadísticas del comercio">
      <nav className="rp-segmented" aria-label="Período">
        {periods.map(([v, l]) => (
          <Link
            key={v}
            aria-current={period === v ? "page" : undefined}
            href={"/business/activity?period=" + v}
          >
            {l}
          </Link>
        ))}
      </nav>
      <div className="rp-hero">
        <p className="rp-hero-label">Conductores que te trajo RidePerks</p>
        <p className="rp-hero-value">{drivers}</p>
        <div
          className="rp-progress"
          role="progressbar"
          aria-label="Avance hacia la próxima meta"
          aria-valuenow={Math.round(milestonePct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="rp-progress-bar"
            style={{ width: milestonePct + "%" }}
          />
        </div>
        <p className="rp-progress-label">
          Próxima meta: <strong>{nextMilestone}</strong> conductores.
        </p>
      </div>
      <dl className="rp-metrics">
        <div>
          <dt>Usos</dt>
          <dd>{data.uses}</dd>
        </div>
        <div>
          <dt>Ahorro registrado</dt>
          <dd>{money(Number(data.savings))}</dd>
        </div>
      </dl>
      <section className="rp-menu">
        <div className="rp-menu-row">
          <span>Más usado</span>
          <span className="rp-menu-value">
            {data.top_benefit || "Todavía no hay usos"}
          </span>
        </div>
        {data.daily.length > 0 && (
          <details>
            <summary>Usos por día</summary>
            <div className="rp-list">
              {data.daily.map((d) => (
                <div className="rp-list-row" key={d.day}>
                  <span>{d.day.split("-").reverse().join("/")}</span>
                  <strong>{d.uses}</strong>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>
      {data.valued_uses < data.uses && (
        <p className="rp-muted">
          El ahorro incluye {data.valued_uses} de {data.uses} usos: los
          descuentos variables no tienen un importe fijo.
        </p>
      )}
    </section>
  );
}
