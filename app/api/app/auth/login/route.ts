import { emailSchema } from "@/lib/platform/validation";
import { authConfigured, createStatelessClient } from "@/lib/platform/supabase";
import { authLimit, passwordSignIn } from "@/lib/platform/login-core";
import {
  AppError,
  appOptions,
  appRoute,
  appSession,
  readBody,
  tooMany,
} from "@/lib/platform/app-api";

// The app's sign-in: same checks as the web form (rate limits, account
// type), but the session goes back to the phone as tokens instead of
// cookies. The phone keeps them in its secure storage and refreshes them
// directly with Supabase Auth.
export const POST = appRoute(async (request) => {
  const body = await readBody(request);
  const email = emailSchema.safeParse(body.email);
  const password = body.password;
  if (!email.success || typeof password !== "string" || !password || password.length > 128)
    throw new AppError("Revisa tu correo y contraseña.");
  if (!authConfigured())
    throw new AppError("El acceso aún no está habilitado. Intenta más tarde.", 503);
  await authLimit(email.data).catch(tooMany);
  const result = await passwordSignIn(
    createStatelessClient(),
    email.data,
    password,
    body.audience === "business" ? "business" : "driver",
  );
  if ("error" in result) throw new AppError(result.error, 401);
  return appSession(result.userId, result.session);
});

export const OPTIONS = appOptions;
