import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { authConfigured } from "./supabase";
import { authLimit, type Audience } from "./login-core";
import { signupSchema, firstError } from "./validation";

// Account creation shared by the web form (auth-actions, cookie session)
// and the phone app (/api/app/auth/register, token session). Kept out of
// the "use server" files on purpose: an export there becomes a public action.
//
// Launch decision: registration creates confirmed email identities without
// sending email. Driver verification and permission to redeem remain a
// separate manual process.

export type NewAccount = { email: string; password: string; userId: string };

/**
 * Validates the sign-up fields and creates the account. `check` runs after
 * validation and before anything is created (the web passes its Turnstile
 * check; the app passes a stricter rate limit). Throws on rate limits.
 */
export async function createAccount(
  raw: Record<string, unknown>,
  audience: Audience,
  check?: () => Promise<void>,
): Promise<{ error: string } | NewAccount> {
  const parsed = signupSchema.safeParse(
    audience === "business" ? { ...raw, platform: "multiple" } : raw,
  );
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (!authConfigured())
    return { error: "El registro aún no está habilitado. Intenta más tarde." };
  await check?.();
  await authLimit(parsed.data.email);
  const { email, password, full_name, phone, platform } = parsed.data;
  const db = getSupabaseAdmin();
  // createUser rejects duplicates. Never confirm or modify an existing account here.
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone, platform },
  });
  if (error || !data.user)
    return {
      error:
        "No pudimos crear la cuenta. Si ya estás registrado, inicia sesión con tu contraseña.",
    };
  if (audience === "business") {
    const assigned = await db
      .from("rp_profiles")
      .update({ role: "business" })
      .eq("id", data.user.id);
    if (assigned.error) {
      await db.auth.admin.deleteUser(data.user.id);
      return {
        error: "No pudimos crear la cuenta del comercio. Intenta nuevamente.",
      };
    }
  }
  return { email, password, userId: data.user.id };
}

/** Welcome screens: shown once per driver, on the web or in the app. */
export async function markOnboarded(profileId: string) {
  const { error } = await getSupabaseAdmin()
    .from("rp_profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", profileId)
    .is("onboarded_at", null);
  if (error) throw new Error("No pudimos guardar tu avance. Intenta nuevamente.");
}
