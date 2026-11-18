import { authConfigured, createStatelessClient } from "@/lib/platform/supabase";
import {
  AppError,
  appOptions,
  appRoute,
  readBody,
} from "@/lib/platform/app-api";

// Swaps the app's refresh token for a fresh session. Supabase rotates the
// refresh token each time; a closed account's login is banned, so its
// session can't be renewed.
export const POST = appRoute(async (request) => {
  const body = await readBody(request);
  const token = body.refresh_token;
  if (typeof token !== "string" || !token || token.length > 512)
    throw new AppError("Inicia sesión de nuevo.", 401);
  if (!authConfigured())
    throw new AppError("El acceso aún no está habilitado. Intenta más tarde.", 503);
  const { data, error } = await createStatelessClient().auth.refreshSession({
    refresh_token: token,
  });
  if (error || !data.session) throw new AppError("Inicia sesión de nuevo.", 401);
  return {
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  };
});

export const OPTIONS = appOptions;
