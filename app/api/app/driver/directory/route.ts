import { appOptions, appRoute, requireAppProfile } from "@/lib/platform/app-api";
import { directoryData, NO_FILTER } from "@/lib/platform/driver-screens";

// Comercios: every active business, as /driver/directory shows them.
export const GET = appRoute(async () => {
  const p = await requireAppProfile("driver");
  return directoryData(p, NO_FILTER);
});

export const OPTIONS = appOptions;
