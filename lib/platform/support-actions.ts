"use server";
import { z } from "zod";
import { requireDriver, rateLimit, requireAdmin } from "./data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { firstError } from "./validation";
import type { ActionState } from "./types";
import { revalidatePath } from "next/cache";
export async function requestSupport(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const p = await requireDriver();
  const parsed = z
    .object({
      topic: z.enum(["benefit", "account", "privacy", "delete"]),
      message: z
        .string()
        .trim()
        .min(10, "Cuéntanos un poco más para poder ayudarte.")
        .max(2000),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  try {
    await rateLimit("support:" + p.id, 5, 3600);
    const { error } = await getSupabaseAdmin()
      .from("rp_support_requests")
      .insert({ driver_id: p.id, ...parsed.data });
    if (error)
      return { error: "No pudimos enviar tu solicitud. Intenta nuevamente." };
    return {
      success:
        "Recibimos tu solicitud. El equipo podrá contactarte por el WhatsApp de tu perfil.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No pudimos enviar tu solicitud.",
    };
  }
}
export async function resolveSupport(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { error: "Solicitud inválida." };
  const { error } = await getSupabaseAdmin()
    .from("rp_support_requests")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id.data);
  if (error) return { error: "No pudimos actualizar la solicitud." };
  revalidatePath("/admin/platform");
  return { success: "Solicitud marcada como atendida." };
}
