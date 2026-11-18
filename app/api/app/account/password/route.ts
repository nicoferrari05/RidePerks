import {
  AppError,
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { setOwnPassword } from "@/lib/platform/self-service";

// Contraseña: same rules and messages as the web form.
export const POST = appRoute(async (request) => {
  const p = await requireAppProfile();
  const body = await readBody(request);
  const result = await setOwnPassword(p, body.password, body.confirmation);
  if (result.error) throw new AppError(result.error);
  return { message: result.success };
});

export const OPTIONS = appOptions;
