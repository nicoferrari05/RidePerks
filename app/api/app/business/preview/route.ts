import { appOptions, appRoute, readBody } from "@/lib/platform/app-api";
import { currentProfile } from "@/lib/platform/data";
import { previewCode } from "@/lib/platform/counter";

// Escanear, step 1: who the code belongs to and what it gives.
export const POST = appRoute(async (request) => {
  const profile = await currentProfile();
  const body = await readBody(request);
  return previewCode(profile, body.token);
});

export const OPTIONS = appOptions;
