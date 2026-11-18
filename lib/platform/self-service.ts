import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "./data";
import { passwordSchema, firstError } from "./validation";
import { closeAccount } from "./account-closure";
import { authConfigured, createStatelessClient } from "./supabase";
import type { ActionState, Profile } from "./types";

// Account self-service rules shared by the web forms (auth-actions,
// app-actions) and the phone app (/api/app/account/*).

/** New password checks: length, then both fields equal. */
export function checkNewPassword(password: unknown, confirmation: unknown) {
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (parsed.data !== confirmation)
    return { error: "Las contraseñas no coinciden." };
  return { password: parsed.data };
}

export const PASSWORD_CHANGED =
  "Contraseña actualizada. Ya puedes usarla para iniciar sesión.";

/** The app's Contraseña: the signed-in person sets a new password. */
export async function setOwnPassword(
  profile: Profile,
  password: unknown,
  confirmation: unknown,
): Promise<ActionState> {
  const checked = checkNewPassword(password, confirmation);
  if ("error" in checked) return { error: checked.error };
  try {
    await rateLimit("password:" + profile.id, 5);
    const { error } = await getSupabaseAdmin().auth.admin.updateUserById(
      profile.id,
      { password: checked.password },
    );
    if (error)
      return { error: "No pudimos cambiar la contraseña. Intenta nuevamente." };
    return { success: PASSWORD_CHANGED };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No pudimos conectar. Intenta nuevamente.",
    };
  }
}

/**
 * Self-service account deletion. Asks for the password again so a
 * borrowed, unlocked phone can't delete the account. On success the login
 * is banned and personal data erased (closeAccount).
 */
export async function closeOwnAccount(
  profile: Profile,
  password: unknown,
  confirmed: boolean,
): Promise<ActionState> {
  if (!confirmed)
    return { error: "Confirma que entiendes que no se puede deshacer." };
  if (typeof password !== "string" || !password || password.length > 128)
    return { error: "Escribe tu contraseña." };
  if (!authConfigured())
    return { error: "No pudimos conectar. Intenta más tarde." };
  try {
    await rateLimit(
      "delete-account:" + createHash("sha256").update(profile.id).digest("hex"),
      5,
      3600,
    );
    const user = await getSupabaseAdmin().auth.admin.getUserById(profile.id);
    const email = user.data.user?.email;
    if (!email) return { error: "No pudimos confirmar tu cuenta." };
    // A throwaway client: checking the password must not touch any session.
    const check = createStatelessClient();
    const signed = await check.auth.signInWithPassword({ email, password });
    if (signed.error) return { error: "La contraseña no es correcta." };
    await check.auth.signOut({ scope: "local" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No pudimos conectar." };
  }
  const result = await closeAccount(
    profile.id,
    "Eliminada por la persona desde la app.",
  );
  if ("error" in result) return { error: result.error };
  return { success: "Tu cuenta fue eliminada." };
}
