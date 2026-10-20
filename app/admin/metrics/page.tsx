import Link from "next/link";
import { requireAdmin } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import AdminShell from "@/components/platform/AdminShell";
import BarChart, { type Bar } from "@/components/platform/BarChart";
import { Heading } from "@/components/platform/ui";
import { dateLabel, money } from "@/lib/platform/types";
export const metadata = {
  title: "Métricas · RidePerks Admin",
  robots: { index: false, follow: false },
};
type Metrics = {
  drivers: number;
  verified: number;
  with_access: number;
  pending_verifications: number;
  businesses: number;
  benefits: number;
  open_support: number;
  pending_reviews: number;
  revenue_month: number;
  revenue_prev: number;
  uses_month: number;
  uses_prev: number;
  savings_month: number;
  signups_month: number;
  rating_avg: number | null;
  ratings: number;
  not_applied: number;
  signups_daily: { day: string; value: number }[];
  uses_daily: { day: string; value: number }[];
};
const short = new Intl.DateTimeFormat("es-PA", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
function bars(rows: { day: string; value: number }[]): Bar[] {
  return rows.map((r) => ({
    label: short.format(new Date(r.day + "T00:00:00Z")),
    value: Number(r.value) || 0,
  }));
}
function change(now: number, before: number) {
  if (!before) return null;
  const pct = Math.round(((now - before) / before) * 100);
  return (pct > 0 ? "+" : "") + pct + "% vs. mes pasado";
}
// One screen with how RidePerks is doing, from rp_admin_metrics.
export default async function Page() {
  await requireAdmin();
  const db = getSupabaseAdmin();
  const [result, reports] = await Promise.all([
    db.rpc("rp_admin_metrics"),
    db
      .from("rp_redemption_feedback")
      .select(
        "redemption_id,rating,applied,comment,created_at,rp_businesses(name)",
      )
      .or("applied.eq.false,rating.lte.2")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  if (result.error) throw new Error("No pudimos calcular las métricas.");
  const m = result.data as Metrics;
  const tiles: [string, string, string | null][] = [
    [
      "Ingresos del mes",
      money(m.revenue_month / 100),
      change(m.revenue_month, m.revenue_prev),
    ],
    ["Usos del mes", String(m.uses_month), change(m.uses_month, m.uses_prev)],
    ["Ahorro de conductores", money(Number(m.savings_month)), "Este mes"],
    [
      "Conductores con acceso",
      String(m.with_access),
      m.verified + " verificados de " + m.drivers,
    ],
    ["Registros del mes", String(m.signups_month), null],
    [
      "Comercios activos",
      String(m.businesses),
      m.benefits + " beneficios publicados",
    ],
  ];
  const todo: [string, number, string][] = [
    [
      "Verificaciones pendientes",
      m.pending_verifications,
      "/admin/platform?tab=verifications",
    ],
    ["Propuestas por revisar", m.pending_reviews, "/admin/reviews"],
    ["Solicitudes de ayuda", m.open_support, "/admin/platform?tab=support"],
  ];
  return (
    <AdminShell>
      <Heading title="Métricas">
        Cómo va RidePerks. Meses y días en horario de Panamá.
      </Heading>
      <dl className="rp-metrics rp-kpis">
        {tiles.map(([label, value, note]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
            {note && <dd className="rp-muted">{note}</dd>}
          </div>
        ))}
      </dl>
      <section className="rp-menu">
        {todo.map(([label, count, href]) => (
          <Link key={label} href={href}>
            <span>{label}</span>
            <span className={"rp-menu-value" + (count ? " rp-count" : "")}>
              {count}
            </span>
          </Link>
        ))}
      </section>
      <div className="rp-chart-grid">
        <BarChart
          title="Conductores nuevos por día"
          unit="registros"
          bars={bars(m.signups_daily)}
        />
        <BarChart title="Usos por día" unit="usos" bars={bars(m.uses_daily)} />
      </div>
      <section className="rp-stack tight">
        <h2>Opiniones de conductores</h2>
        <p className="rp-muted">
          {m.ratings
            ? "Promedio " +
              Number(m.rating_avg).toFixed(1) +
              " ★ en " +
              m.ratings +
              " opiniones de los últimos 90 días. " +
              m.not_applied +
              " dijeron que no se aplicó el beneficio."
            : "Todavía no hay opiniones en los últimos 90 días."}
        </p>
        {reports.data && reports.data.length > 0 && (
          <div className="rp-list">
            {reports.data.map((r) => (
              <div className="rp-list-row" key={r.redemption_id}>
                <div>
                  <h3>
                    {(r.rp_businesses as unknown as { name: string } | null)
                      ?.name || "Comercio"}{" "}
                    · {r.rating} ★
                  </h3>
                  <p>
                    {r.applied ? "Sí se aplicó" : "No se aplicó"} ·{" "}
                    {dateLabel(r.created_at)}
                  </p>
                  {r.comment && <p>{r.comment}</p>}
                </div>
                {!r.applied && (
                  <span className="rp-badge pending">Revisar</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
