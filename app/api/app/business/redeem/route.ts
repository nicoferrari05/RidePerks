import { appOptions, appRoute, readBody } from "@/lib/platform/app-api";
import { currentProfile } from "@/lib/platform/data";
import { redeemCode } from "@/lib/platform/counter";

// Escanear, step 2: confirm and register the use.
export const POST = appRoute(async (request) => {
  const profile = await currentProfile();
  const body = await readBody(request);
  return redeemCode(profile, body.token);
});

export const OPTIONS = appOptions;
