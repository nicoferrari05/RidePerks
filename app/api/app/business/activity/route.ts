import {
  AppError,
  appOptions,
  appRoute,
  panamaDate,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { requireBusiness } from "@/lib/platform/data";
import {
  businessActivityData,
  nextMilestone,
  readPeriod,
} from "@/lib/platform/business-screens";
import { dayBars } from "@/components/platform/BarChart";
import { money } from "@/lib/platform/types";

// Actividad (owners only), as /business/activity shows it: drivers, uses,
// savings, the columns of the chart already grouped, ratings, last uses.
export const GET = appRoute(async (request) => {
  await requireAppProfile("business");
  const { business, profile, role } = await requireBusiness();
  if (!business || role !== "owner")
    throw new AppError("Esta sección es solo para el responsable del comercio.", 403);
  const period = readPeriod(new URL(request.url).searchParams.get("period"));
  const { stats, recent, feedback } = await businessActivityData(business.id, profile.id, period);
  const drivers = Number(stats.drivers) || 0;
  const bars = dayBars(
    stats.daily.map((d) => ({ day: d.day, value: d.uses })),
    stats.from_day,
    stats.to_day,
    period !== "7",
  );
  return {
    period,
    drivers,
    next_milestone: nextMilestone(drivers),
    uses: Number(stats.uses) || 0,
    savings: money(Number(stats.savings)),
    valued_uses: Number(stats.valued_uses) || 0,
    top_benefit: stats.top_benefit,
    chart: {
      title: period === "7" ? "Usos por día" : "Usos por semana",
      bars,
    },
    feedback,
    recent: recent.map((r) => ({
      id: r.id,
      benefit_title: r.benefit_title,
      date_label: panamaDate(r.redeemed_at, { day: "numeric", month: "short", year: "numeric" }),
      via_pin: r.redeemed_via === "pin",
    })),
  };
});

export const OPTIONS = appOptions;
