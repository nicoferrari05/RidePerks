"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "./data";
import { firstError, uuidSchema } from "./validation";
import type { ActionState } from "./types";
import { businessSchema, benefitSchema } from "./catalog-validation";

function refresh() {
  revalidatePath("/admin/platform");
  revalidatePath("/driver", "layout");
  revalidatePath("/business");
}
export async function saveBusiness(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = businessSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { id, owner_user_id, ...values } = parsed.data;
  const { error } = await getSupabaseAdmin().rpc("rp_save_business", {
    p_id: id || null,
    p_values: {
      ...values,
      phone: values.phone || null,
      owner_user_id: owner_user_id || null,
    },
  });
  if (error)
    return {
      error:
        error.code === "P0001"
          ? error.message
          : "No pudimos guardar el comercio. Revisa la cuenta vinculada.",
    };
  refresh();
  return { success: "Comercio guardado." };
}
export async function saveBenefit(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = benefitSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { id, ...v } = parsed.data;
  const data = {
    ...v,
    savings_amount: v.savings_amount === "" ? null : v.savings_amount,
    monthly_limit: v.monthly_limit === "" ? null : v.monthly_limit,
    valid_from: v.valid_from || null,
    valid_until: v.valid_until || null,
  };
  const db = getSupabaseAdmin();
  const { error } = id
    ? await db.from("rp_benefits").update(data).eq("id", id)
    : await db.from("rp_benefits").insert(data);
  if (error)
    return { error: "No pudimos guardar el beneficio. Revisa sus datos." };
  refresh();
  return { success: "Beneficio guardado." };
}
export async function toggleRecord(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      id: z.uuid(),
      table: z.enum(["rp_businesses", "rp_benefits"]),
      active: z.enum(["true", "false"]),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Solicitud inválida." };
  const { id, table, active } = parsed.data;
  const { error } = await getSupabaseAdmin()
    .from(table)
    .update({ is_active: active === "true" })
    .eq("id", id);
  if (error) return { error: "No pudimos actualizar el estado." };
  refresh();
  return { success: "Estado actualizado." };
}
export async function reviewVerification(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      id: z.uuid(),
      approved: z.enum(["true", "false"]),
      notes: z.string().trim().max(1000),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Revisa la solicitud." };
  if (parsed.data.approved === "false" && !parsed.data.notes)
    return { error: "Explica al conductor qué necesita corregir." };
  const { error } = await getSupabaseAdmin().rpc("rp_review_verification", {
    p_id: parsed.data.id,
    p_approved: parsed.data.approved === "true",
    p_notes: parsed.data.notes,
  });
  if (error)
    return {
      error:
        error.code === "P0001"
          ? error.message
          : "No pudimos revisar la solicitud.",
    };
  refresh();
  return { success: "Revisión guardada." };
}
// Closes an account for a privacy/deletion request: blocks the login and
// scrubs personal data, but deliberately never touches redemption/payment
// history — a business's stats and RidePerks' own audit trail have to
// survive this. See rp_close_profile in the 202609110003 migration.
export async function closeProfile(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = uuidSchema.safeParse(form.get("id"));
  const reason = String(form.get("reason") || "").trim();
  if (!id.success) return { error: "Cuenta inválida." };
  if (reason.length < 3 || reason.length > 1000)
    return { error: "Escribe el motivo del cierre." };
  const db = getSupabaseAdmin();
  // Block login first: if the profile scrub below fails, the account is
  // merely locked out (recoverable) rather than scrubbed but still usable.
  const ban = await db.auth.admin.updateUserById(id.data, {
    ban_duration: "876000h",
  });
  if (ban.error)
    return { error: "No pudimos bloquear el inicio de sesión de la cuenta." };
  const { error } = await db.rpc("rp_close_profile", {
    p_id: id.data,
    p_reason: reason,
  });
  if (error)
    return {
      error:
        error.code === "P0001" ? error.message : "No pudimos cerrar la cuenta.",
    };
  refresh();
  return {
    success:
      "Cuenta cerrada: se bloqueó el inicio de sesión y se eliminaron sus datos personales.",
  };
}
export async function setDriverStatus(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = uuidSchema.safeParse(form.get("id"));
  const status = form.get("status");
  if (!id.success || !["pending", "suspended"].includes(String(status)))
    return { error: "Estado inválido." };
  const { error } = await getSupabaseAdmin()
    .from("rp_profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id.data)
    .eq("role", "driver");
  if (error) return { error: "No pudimos actualizar la cuenta." };
  refresh();
  return { success: "Cuenta actualizada." };
}
