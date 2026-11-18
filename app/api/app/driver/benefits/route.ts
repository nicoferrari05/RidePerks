import { appOptions, appRoute, requireAppProfile } from "@/lib/platform/app-api";
import { benefitsData, NO_FILTER } from "@/lib/platform/driver-screens";
import { benefitTile } from "@/lib/platform/app-driver";

// Beneficios: the whole catalog the web shows, plus which ones are saved.
// The app filters it on the phone (search, category, open now, favorites)
// with the same rules, so typing never waits for the network.
export const GET = appRoute(async () => {
  const p = await requireAppProfile("driver");
  const { live, benefits, favorites } = await benefitsData(p, NO_FILTER);
  return {
    live,
    benefits: benefits.map(benefitTile),
    saved: [...favorites],
  };
});

export const OPTIONS = appOptions;
