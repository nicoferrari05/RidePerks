import {
  appOptions,
  appRoute,
  panamaDate,
  publicProfile,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { dashboardData } from "@/lib/platform/driver-screens";
import { driverSetupSteps } from "@/lib/platform/driver-rules";
import { benefitTile, redemptionRow } from "@/lib/platform/app-driver";

// Inicio: the same data as /driver/dashboard.
export const GET = appRoute(async () => {
  const p = await requireAppProfile("driver");
  const d = await dashboardData(p);
  const now = Date.now();
  const steps = driverSetupSteps({
    profile: p,
    hasAccess: d.hasAccess,
    verificationPending: d.verificationPending,
    hasUsedBenefit: d.history.length > 0,
  });
  return {
    profile: publicProfile(p),
    today_label: panamaDate(new Date(), {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    steps: steps.every((s) => s.completed) ? [] : steps,
    monthly: d.monthly,
    total: d.total,
    recent: d.history.slice(0, 3).map((r) => redemptionRow(r, now)),
    has_history: d.history.length > 0,
    live: d.live,
    featured: d.featured.map(benefitTile),
    unread: d.unread,
  };
});

export const OPTIONS = appOptions;
