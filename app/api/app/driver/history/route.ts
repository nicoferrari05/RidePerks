import { appOptions, appRoute, requireAppProfile } from "@/lib/platform/app-api";
import { getRatedRedemptions } from "@/lib/platform/data";
import { redemptionRow } from "@/lib/platform/app-driver";

// Actividad: every use (up to 500), with whether it can still be rated.
export const GET = appRoute(async () => {
  const p = await requireAppProfile("driver");
  const rows = await getRatedRedemptions(p.id);
  const now = Date.now();
  return { rows: rows.map((r) => redemptionRow(r, now)) };
});

export const OPTIONS = appOptions;
