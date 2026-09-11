"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { currentProfile, requireAdmin } from "./data";
import type { ActionState } from "./types";
async function actor() {
  await requireAdmin();
  const profile = await currentProfile();
  if (!profile)
    throw new Error(
      "Inicia sesión con tu cuenta personal y vincúlala en Identidad administrativa.",
    );
  const { data, error } = await getSupabaseAdmin()
    .from("rp_admin_users")
    .select("user_id")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data)
    throw new Error("Vincula tu identidad administrativa antes de continuar.");
  return profile.id;
}
export async function enrollAdmin(_: ActionState): Promise<ActionState> {
  void _;
  await requireAdmin();
  const profile = await currentProfile();
  if (!profile)
    return {
      error:
        "Inicia sesión con tu cuenta personal en otra pestaña y vuelve aquí.",
    };
  const db = getSupabaseAdmin();
  const existing = await db
    .from("rp_admin_users")
    .select("is_active")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (existing.error) return { error: "No pudimos consultar la identidad." };
  if (existing.data?.is_active === false)
    return {
      error: "Esta identidad fue desactivada. Contacta al administrador.",
    };
  const { error } = await db
    .from("rp_admin_users")
    .upsert(
      { user_id: profile.id },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (error) return { error: "No pudimos vincular la identidad." };
  revalidatePath("/admin/access");
  return { success: "Identidad vinculada: " + profile.full_name };
}
export async function manageAccess(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const id = await actor();
    const parsed = z
      .object({
        driver_id: z.uuid(),
        action: z.enum(["grant", "suspend", "cancel", "resume"]),
        kind: z.enum(["trial", "courtesy", "extension", "lifetime"]),
        reason: z.string().trim().min(3).max(1000),
        end: z.string(),
        days: z.coerce.number().int().min(0).max(3660),
        months: z.coerce.number().int().min(0).max(120),
      })
      .safeParse(Object.fromEntries(form));
    if (!parsed.success)
      return { error: "Revisa el conductor, motivo y período." };
    const v = parsed.data;
    const end = v.end ? new Date(v.end + "T23:59:59-05:00") : null;
    if (end && Number.isNaN(end.getTime())) return { error: "Fecha inválida." };
    const { error } = await getSupabaseAdmin().rpc("rp_manage_access", {
      p_admin: id,
      p_driver: v.driver_id,
      p_action: v.action,
      p_kind: v.kind,
      p_end: end?.toISOString() || null,
      p_days: v.days,
      p_months: v.months,
      p_reason: v.reason,
    });
    if (error)
      return {
        error:
          error.code === "P0001"
            ? error.message
            : "No pudimos actualizar el acceso.",
      };
    revalidatePath("/admin/access");
    revalidatePath("/driver", "layout");
    return { success: "Acceso actualizado y cambio registrado." };
  } catch (e) {
    return {
      error:
        e instanceof Error ? e.message : "No pudimos actualizar el acceso.",
    };
  }
}
export async function reviewBenefit(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const id = await actor();
    const parsed = z
      .object({
        id: z.uuid(),
        decision: z.enum(["approve", "return"]),
        notes: z.string().trim().max(1000),
      })
      .safeParse(Object.fromEntries(form));
    if (!parsed.success) return { error: "Solicitud inválida." };
    const { error } = await getSupabaseAdmin().rpc("rp_review_benefit", {
      p_admin: id,
      p_revision: parsed.data.id,
      p_approve: parsed.data.decision === "approve",
      p_notes: parsed.data.notes,
    });
    if (error)
      return {
        error:
          error.code === "P0001"
            ? error.message
            : "No pudimos revisar la propuesta.",
      };
    revalidatePath("/admin/reviews");
    revalidatePath("/business");
    revalidatePath("/driver", "layout");
    return { success: "Revisión guardada." };
  } catch (e) {
    return {
      error:
        e instanceof Error ? e.message : "No pudimos revisar la propuesta.",
    };
  }
}
