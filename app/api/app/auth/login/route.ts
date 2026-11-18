import { emailSchema } from "@/lib/platform/validation";
import { authConfigured, createStatelessClient } from "@/lib/platform/supabase";
import { authLimit, passwordSignIn } from "@/lib/platform/login-core";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  AppError,
  appOptions,
  appRoute,
  publicProfile,
  readBody,
} from "@/lib/platform/app-api";
import type { Profile } from "@/lib/platform/types";

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
  await authLimit(email.data).catch((e: unknown) => {
    throw new AppError(e instanceof Error ? e.message : "Intenta más tarde.", 429);
  });
  const result = await passwordSignIn(
    createStatelessClient(),
    email.data,
    password,
    body.audience === "business" ? "business" : "driver",
  );
  if ("error" in result) throw new AppError(result.error, 401);
  const { data, error } = await getSupabaseAdmin()
    .from("rp_profiles")
    .select("*")
    .eq("id", result.userId)
    .single();
  if (error || !data) throw new AppError("No pudimos cargar tu cuenta.", 500);
  const { session } = result;
  return {
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    },
    profile: publicProfile(data as Profile),
  };
});

export const OPTIONS = appOptions;
