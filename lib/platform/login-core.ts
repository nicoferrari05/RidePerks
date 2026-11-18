import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "./data";

// Sign-in rules shared by the web (auth-actions, cookie session) and the
// phone app (/api/app/auth/login, token session). Kept out of the
// "use server" files on purpose: an export there becomes a public action.

export type Audience = "driver" | "business";

export async function authLimit(email: string) {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  await rateLimit(
    "auth-ip:" + createHash("sha256").update(ip).digest("hex"),
    30,
  );
  await rateLimit(
    "auth-email:" +
      createHash("sha256").update(email.toLowerCase()).digest("hex"),
    10,
  );
}

/**
 * Signs in with email and password and checks the account type matches the
 * tab the person chose (Conductor / Comercio). On any mismatch the new
 * session is closed again, so nothing is left signed in.
 */
export async function passwordSignIn(
  auth: SupabaseClient,
  email: string,
  password: string,
  audience: Audience,
): Promise<{ error: string } | { session: Session; userId: string }> {
  const { data, error } = await auth.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session || !data.user)
    return {
      error: "No pudimos iniciar sesión. Revisa tu correo y contraseña.",
    };
  const profile = await getSupabaseAdmin()
    .from("rp_profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (!profile.data || profile.error) {
    await auth.auth.signOut({ scope: "local" });
    return { error: "No pudimos cargar tu cuenta. Intenta nuevamente." };
  }
  if (profile.data.role !== audience) {
    await auth.auth.signOut({ scope: "local" });
    return {
      error:
        profile.data.role === "business"
          ? "Esta cuenta es de comercio. Selecciona Comercio para entrar."
          : "Esta cuenta es de conductor. Selecciona Conductor para entrar.",
    };
  }
  return { session: data.session, userId: data.user.id };
}
