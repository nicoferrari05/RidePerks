import { appOptions, appRoute, requireAppProfile } from "@/lib/platform/app-api";
import { markOnboarded } from "@/lib/platform/signup-core";

// The welcome screens were seen (finished or skipped): never show them
// again, on the phone or the web.
export const POST = appRoute(async () => {
  const profile = await requireAppProfile("driver");
  await markOnboarded(profile.id);
  return { ok: true };
});

export const OPTIONS = appOptions;
