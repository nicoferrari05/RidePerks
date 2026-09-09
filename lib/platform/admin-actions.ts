"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "./data";
import { firstError, uuidSchema } from "./validation";
import type { ActionState } from "./types";
const category = z.enum([
  "combustible",
  "comida",
  "mantenimiento",
  "salud",
  "otros",
]);
const optionalId = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || uuidSchema.safeParse(v).success,
    "Selecciona una cuenta responsable válida de la lista.",
  );
const businessSchema = z.object({
  id: optionalId,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  address: z.string().trim().min(3).max(250),
  phone: z
    .string()
    .trim()
    .max(24)
    .regex(/^[+0-9 ()-]*$/),
  category,
  owner_user_id: optionalId,
});
const benefitSchema = z
  .object({
    id: optionalId,
    business_id: z.uuid(),
    title: z.string().trim().min(2).max(140),
    description: z.string().trim().min(5).max(3000),
    discount_label: z.string().trim().min(2).max(100),
    terms: z.string().trim().min(5).max(3000),
    category,
    savings_amount: z.union([
      z.literal(""),
      z.coerce.number().min(0).max(999999),
    ]),
    monthly_limit: z.union([
      z.literal(""),
      z.coerce.number().int().min(1).max(1000),
    ]),
    valid_from: z.union([z.literal(""), z.iso.date()]),
    valid_until: z.union([z.literal(""), z.iso.date()]),
  })
  .refine(
    (v) => !v.valid_from || !v.valid_until || v.valid_until >= v.valid_from,
    { message: "La fecha final debe ser posterior a la inicial." },
  );
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
