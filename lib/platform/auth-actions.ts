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
import { getSupabaseAdmin } from "@/lib/supabase-server";
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
        error: "No pudimos iniciar sesión. Revisa tu correo y contraseña.",
      };
    const {
      data: { user },
    } = await auth.auth.getUser();
    const profile = user
      ? await getSupabaseAdmin()
          .from("rp_profiles")
          .select("role")
          .eq("id", user.id)
          .single()
      : null;
    if (!profile?.data || profile.error) {
      await auth.auth.signOut({ scope: "local" });
      return { error: "No pudimos cargar tu cuenta. Intenta nuevamente." };
    }
    const audience =
      form.get("audience") === "business" ? "business" : "driver";
    if (profile.data.role !== audience) {
      await auth.auth.signOut({ scope: "local" });
      return {
        error:
          profile.data.role === "business"
            ? "Esta cuenta es de comercio. Selecciona Comercio para entrar."
            : "Esta cuenta es de conductor. Selecciona Conductor para entrar.",
      };
    }
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
// Launch decision: web registration creates confirmed email identities without sending email.
// Driver verification and permission to redeem remain a separate manual process.
async function registerAccount(
  form: FormData,
  audience: "driver" | "business",
): Promise<ActionState> {
  const raw = Object.fromEntries(form);
  const parsed = signupSchema.safeParse(
    audience === "business" ? { ...raw, platform: "multiple" } : raw,
  );
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (!authConfigured())
    return { error: "El registro aún no está habilitado. Intenta más tarde." };
  try {
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
    const auth = await createAuthClient();
    const signed = await auth.auth.signInWithPassword({ email, password });
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
export async function logout(form: FormData) {
  const auth = await createAuthClient();
  const { error } = await auth.auth.signOut({ scope: "local" });
  if (error)
    throw new Error("No pudimos cerrar la sesión. Intenta nuevamente.");
  redirect(form.get("audience") === "business" ? "/business/login" : "/login");
}
