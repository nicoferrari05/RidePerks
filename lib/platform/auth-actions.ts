"use server";
import { redirect } from "next/navigation";
import { createAuthClient, authConfigured } from "./supabase";
import { authLimit, passwordSignIn } from "./login-core";
import { checkNewPassword, PASSWORD_CHANGED } from "./self-service";
import { emailSchema, firstError, safeNext } from "./validation";
import { rateLimit } from "./data";
import { createAccount } from "./signup-core";
import { verifyTurnstile } from "@/lib/turnstile";
import type { ActionState } from "./types";
function siteUrl() {
  return process.env.SITE_URL || "https://rideperks.app";
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
    const result = await passwordSignIn(
      await createAuthClient(),
      email.data,
      password,
      form.get("audience") === "business" ? "business" : "driver",
    );
    if ("error" in result) return { error: result.error };
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
// Account rules live in signup-core (shared with the phone app). The web
// adds its Turnstile check and signs the new account in with cookies.
async function registerAccount(
  form: FormData,
  audience: "driver" | "business",
): Promise<ActionState> {
  try {
    const created = await createAccount(
      Object.fromEntries(form),
      audience,
      () => verifyTurnstile(form.get("cf-turnstile-response")),
    );
    if ("error" in created) return { error: created.error };
    const auth = await createAuthClient();
    const signed = await auth.auth.signInWithPassword({
      email: created.email,
      password: created.password,
    });
    if (signed.error)
      return {
        success:
          "Tu cuenta está creada. Ya puedes iniciar sesión con tu correo y contraseña.",
      };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "No pudimos conectar. Intenta nuevamente.",
    };
  }
  redirect(audience === "business" ? "/business" : "/driver/dashboard");
}
export async function signup(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  return registerAccount(form, "driver");
}
export async function signupBusiness(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  return registerAccount(form, "business");
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
  const checked = checkNewPassword(
    form.get("password"),
    form.get("confirmation"),
  );
  if ("error" in checked) return { error: checked.error };
  try {
    const auth = await createAuthClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return { error: "El enlace venció. Solicita uno nuevo." };
    await rateLimit("password:" + user.id, 5);
    const { error } = await auth.auth.updateUser({ password: checked.password });
    if (error)
      return {
        error:
          "No pudimos cambiar la contraseña. Solicita un nuevo enlace de recuperación.",
      };
    return { success: PASSWORD_CHANGED };
  } catch {
    return { error: "No pudimos conectar. Intenta nuevamente." };
  }
}
export async function logout(form: FormData) {
  const auth = await createAuthClient();
  const { error } = await auth.auth.signOut({ scope: "local" });
  if (error)
    throw new Error("No pudimos cerrar la sesión. Intenta nuevamente.");
  redirect(form.get("audience") === "business" ? "/business/login" : "/login");
}
