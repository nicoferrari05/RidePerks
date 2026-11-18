import { appBearerToken } from "@/lib/platform/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { appOptions, appRoute } from "@/lib/platform/app-api";

// Closes only this phone's session (the web and other phones stay signed
// in). The app forgets its tokens whatever happens here.
export const POST = appRoute(async () => {
  const token = await appBearerToken();
  if (token) await getSupabaseAdmin().auth.admin.signOut(token, "local");
  return { ok: true };
});

export const OPTIONS = appOptions;
