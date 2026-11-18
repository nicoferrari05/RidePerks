import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { saveProfile } from "@/lib/platform/driver-actions";

// Datos personales: the web's own saveProfile.
export const POST = appRoute(async (request) => {
  await requireAppProfile("driver");
  const body = await readBody(request);
  const result = await runAction(saveProfile, {
    full_name: body.full_name,
    phone: body.phone,
    platform: body.platform,
  });
  return { message: result.success };
});

export const OPTIONS = appOptions;
