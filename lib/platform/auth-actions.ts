"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import { createAuthClient, authConfigured } from "./supabase";
import {
  signupSchema,
  emailSchema,
  passwordSchema,
  firstError,
  safeNext,
} from "./validation";
import { rateLimit } from "./data";
import type { ActionState } from "./types";
function siteUrl() {
  return process.env.SITE_URL || "https://rideperks.app";
}
async function authLimit(email: string) {
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
export async function login(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const email = emailSchema.safeParse(form.get("email"));
  const password = form.get("password");
  if (!email.success || typeof password !== "string" || password.length > 128)
    return { error: "Revisa tu correo y contraseña." };
  if (!authConfigured())
    return { error: "El acceso aún no está habilitado. Intenta más tarde." };
  try {
    await authLimit(email.data);
    const auth = await createAuthClient();
    const { error } = await auth.auth.signInWithPassword({
      email: email.data,
      password,
    });
    if (error)
      return {
        error:
          "No pudimos iniciar sesión. Revisa tus datos y confirma tu correo.",
      };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "No pudimos conectar. Intenta nuevamente.",
    };
  }
  redirect(safeNext(form.get("next")));
}
export async function signup(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (!authConfigured())
    return { error: "El registro aún no está habilitado. Intenta más tarde." };
  try {
    await authLimit(parsed.data.email);
    const auth = await createAuthClient();
    const { email, password, full_name, phone, platform } = parsed.data;
    const { data, error } = await auth.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone, platform },
        emailRedirectTo: siteUrl() + "/auth/callback",
      },
    });
    if (error)
      return {
        error:
          "No pudimos crear la cuenta. Intenta más tarde o recupera tu contraseña si ya estás registrado.",
      };
    if (!data.session)
      return {
        success:
          "Revisa tu correo para confirmar tu cuenta. Si ya tienes una cuenta, inicia sesión o recupera tu contraseña.",
      };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No pudimos conectar." };
  }
  redirect("/driver/dashboard");
}
export async function recover(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = emailSchema.safeParse(form.get("email"));
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (!authConfigured()) return { error: "El acceso aún no está habilitado." };
  try {
    await authLimit(parsed.data);
    const auth = await createAuthClient();
    const { error } = await auth.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: siteUrl() + "/auth/callback?next=/account/password",
    });
    if (error && error.status !== 400)
      return { error: "No pudimos enviar el enlace. Intenta más tarde." };
    return {
      success:
        "Si el correo tiene una cuenta, recibirás un enlace para cambiar tu contraseña.",
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No pudimos conectar." };
  }
}
export async function changePassword(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = passwordSchema.safeParse(form.get("password"));
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (parsed.data !== form.get("confirmation"))
    return { error: "Las contraseñas no coinciden." };
  try {
    const auth = await createAuthClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return { error: "El enlace venció. Solicita uno nuevo." };
    await rateLimit("password:" + user.id, 5);
    const { error } = await auth.auth.updateUser({ password: parsed.data });
    if (error)
      return {
        error:
          "No pudimos cambiar la contraseña. Solicita un nuevo enlace de recuperación.",
      };
    return {
      success: "Contraseña actualizada. Ya puedes usarla para iniciar sesión.",
    };
  } catch {
    return { error: "No pudimos conectar. Intenta nuevamente." };
  }
}
export async function logout() {
  const auth = await createAuthClient();
  const { error } = await auth.auth.signOut({ scope: "local" });
  if (error)
    throw new Error("No pudimos cerrar la sesión. Intenta nuevamente.");
  redirect("/login");
}
