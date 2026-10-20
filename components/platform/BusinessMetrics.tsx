import Link from "next/link";
import { Download } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { money } from "@/lib/platform/types";
import BarChart, { dayBars } from "./BarChart";

export type BusinessStats = {
  uses: number;
  drivers: number;
  savings: number;
  valued_uses: number;
  top_benefit: string | null;
  daily: { day: string; uses: number }[];
  /** First and last Panama day of the period, for the chart. */
  from_day: string;
  to_day: string;
};

export const periods = [
  ["7", "7 días"],
  ["30", "30 días"],
  ["month", "Este mes"],
  ["previous", "Mes pasado"],
] as const;

const panamaDay = (d: Date) =>
  new Date(d.getTime() - 5 * 3600000).toISOString().slice(0, 10);

/** The instants a period covers, in Panama time (also used by the CSV). */
export function periodRange(period: string, now = new Date()) {
  const today = panamaDay(now);
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
  return {
    from,
    until,
    fromDay: panamaDay(from),
    toDay: panamaDay(new Date(until.getTime() - 1)),
  };
}

// Owner-only statistics for a period (Panama time), via rp_business_stats.
export async function loadBusinessStats(
  businessId: string,
  actorId: string,
  period = "30",
): Promise<BusinessStats> {
  const { from, until, fromDay, toDay } = periodRange(period);
  const { data, error } = await getSupabaseAdmin().rpc("rp_business_stats", {
    p_actor: actorId,
    p_business: businessId,
    p_from: from.toISOString(),
    p_until: until.toISOString(),
  });
  if (error) throw new Error("No pudimos calcular las estadísticas.");
  return { ...data, from_day: fromDay, to_day: toDay };
}

export type FeedbackSummary = {
  avg: number | null;
  count: number;
  notApplied: number;
};

export default function BusinessMetrics({
  data,
  period,
  feedback,
}: {
  data: BusinessStats;
  period: string;
  /** Driver ratings in the same period. */
  feedback?: FeedbackSummary;
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
      <BarChart
        title={period === "7" ? "Usos por día" : "Usos por semana"}
        unit="usos"
        bars={dayBars(
          data.daily.map((d) => ({ day: d.day, value: d.uses })),
          data.from_day,
          data.to_day,
          period !== "7",
        )}
      />
      <section className="rp-menu">
        <div className="rp-menu-row">
          <span>Más usado</span>
          <span className="rp-menu-value">
            {data.top_benefit || "Todavía no hay usos"}
          </span>
        </div>
        {feedback && (
          <div className="rp-menu-row">
            <span>Calificación de conductores</span>
            <span className="rp-menu-value">
              {feedback.count
                ? feedback.avg!.toFixed(1) +
                  " ★ · " +
                  feedback.count +
                  (feedback.count === 1 ? " opinión" : " opiniones")
                : "Sin opiniones todavía"}
            </span>
          </div>
        )}
        {feedback && feedback.notApplied > 0 && (
          <div className="rp-menu-row">
            <span>Dijeron que no se aplicó</span>
            <span className="rp-menu-value">{feedback.notApplied}</span>
          </div>
        )}
        <a href={"/business/activity/export?period=" + period} download>
          <span>Descargar usos (CSV para Excel)</span>
          <Download size={18} aria-hidden="true" />
        </a>
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
