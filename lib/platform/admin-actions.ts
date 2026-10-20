"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "./data";
import { firstError, uuidSchema } from "./validation";
import type { ActionState } from "./types";
import { notifyVerification } from "@/lib/email";
import { businessSchema, benefitSchema } from "./catalog-validation";
import { hashPin, pinProblem } from "@/lib/pinAuth";
import { closeAccount, purgeVerificationPhotos } from "./account-closure";

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
  const on = active === "true";
  // Pausing a benefit here also locks it: the merchant can't reactivate it.
  const values =
    table === "rp_benefits"
      ? { is_active: on, admin_paused: !on }
      : { is_active: on };
  const { error } = await getSupabaseAdmin()
    .from(table)
    .update(values)
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
  const approved = parsed.data.approved === "true";
  const request = await getSupabaseAdmin()
    .from("rp_verifications")
    .select("driver_id")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const { error } = await getSupabaseAdmin().rpc("rp_review_verification", {
    p_id: parsed.data.id,
    p_approved: approved,
    p_notes: parsed.data.notes,
  });
  if (error)
    return {
      error:
        error.code === "P0001"
          ? error.message
          : "No pudimos revisar la solicitud.",
    };
  if (request.data) {
    await purgeVerificationPhotos(request.data.driver_id);
    await notifyVerification(
      request.data.driver_id,
      approved,
      parsed.data.notes,
    );
  }
  refresh();
  return { success: "Revisión guardada." };
}
// Closes an account for a privacy/deletion request (see account-closure.ts).
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
  const result = await closeAccount(id.data, reason);
  if ("error" in result) return { error: result.error };
  refresh();
  return {
    success: result.complete
      ? "Cuenta cerrada: se bloqueó el inicio de sesión y se eliminaron sus datos personales, capturas, mensajes y registro de lista de espera."
      : "Cuenta cerrada y bloqueada, pero no se pudo eliminar todo (capturas, mensajes o lista de espera). Revísalo manualmente.",
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
// The PIN is typed by the admin (RidePerks hands it to the business); it is
// never generated here and only its keyed hash is stored. Saving or removing
// it signs out every device that used the previous PIN.
export async function setBusinessPin(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = uuidSchema.safeParse(form.get("id"));
  if (!id.success) return { error: "Comercio inválido." };
  const remove = form.get("remove") === "true";
  const pin = String(form.get("pin") || "").replace(/\s/g, "");
  if (!remove) {
    const problem = pinProblem(pin);
    if (problem) return { error: problem };
  }
  const { error } = await getSupabaseAdmin().rpc("rp_set_business_pin", {
    p_business: id.data,
    p_hash: remove ? null : hashPin(pin),
  });
  if (error)
    return {
      error:
        error.code === "P0001" ? error.message : "No pudimos guardar el PIN.",
    };
  revalidatePath("/admin/platform");
  return {
    success: remove
      ? "PIN eliminado. Los dispositivos que lo usaban ya no pueden registrar canjes."
      : "PIN guardado: " +
        pin +
        ". Por seguridad no lo volveremos a mostrar; compártelo solo con el comercio.",
  };
}
export async function setCatalogLive(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const live = form.get("live") === "true";
  const { error } = await getSupabaseAdmin()
    .from("rp_settings")
    .upsert({ key: "catalog_live", value: live });
  if (error) return { error: "No pudimos cambiar el catálogo." };
  revalidatePath("/driver", "layout");
  revalidatePath("/admin/platform");
  return {
    success: live
      ? "Catálogo visible para los conductores."
      : "Catálogo oculto: los conductores ven «Próximamente».",
  };
}
