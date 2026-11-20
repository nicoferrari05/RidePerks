import { recover } from "@/lib/platform/auth-actions";
import { appOptions, appRoute, readBody, runAction } from "@/lib/platform/app-api";

// "Olvidé mi contraseña": the same email as the web's /recover. The link
// opens the web, where the person picks the new password.
export const POST = appRoute(async (request) => {
  const body = await readBody(request);
  const result = await runAction(recover, { email: body.email });
  return { message: result.success };
});

export const OPTIONS = appOptions;
