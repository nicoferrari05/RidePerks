"use server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireDriver, rateLimit } from "./data";
import { profileSchema, firstError } from "./validation";
import type { ActionState } from "./types";
import { readImage } from "./images";
export async function saveProfile(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const profile = await requireDriver();
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  try {
    await rateLimit("profile:" + profile.id, 20);
    const { error } = await getSupabaseAdmin()
      .from("rp_profiles")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    if (error)
      return { error: "No pudimos guardar tus datos. Intenta nuevamente." };
    revalidatePath("/driver", "layout");
    return { success: "Tus datos quedaron guardados." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No pudimos guardar." };
  }
}
export async function uploadVerification(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const profile = await requireDriver();
  if (profile.status === "suspended" || profile.status === "verified")
    return { error: "Tu cuenta no admite una nueva verificación." };
  const image = await readImage(form.get("photo"), 5 * 1024 * 1024);
  if (!image)
    return { error: "Selecciona una imagen JPG, PNG o WebP de hasta 5 MB." };
  const { bytes, ext, contentType } = image;
  try {
    await rateLimit("verification:" + profile.id, 5, 3600);
    const db = getSupabaseAdmin();
    const pending = await db
      .from("rp_verifications")
      .select("id")
      .eq("driver_id", profile.id)
      .eq("status", "pending")
      .maybeSingle();
    if (pending.error) return { error: "No pudimos consultar tu solicitud." };
    if (pending.data)
      return { error: "Ya tienes una verificación en revisión." };
    const path = profile.id + "/" + crypto.randomUUID() + "." + ext;
    const uploaded = await db.storage
      .from("rp-verifications")
      .upload(path, bytes, {
        contentType,
        upsert: false,
      });
    if (uploaded.error)
      return { error: "No pudimos subir la imagen. Intenta nuevamente." };
    const result = await db
      .from("rp_verifications")
      .insert({ driver_id: profile.id, photo_path: path });
    if (result.error) {
      await db.storage.from("rp-verifications").remove([path]);
      return {
        error:
          "No pudimos registrar la imagen. Comprueba si ya tienes una solicitud pendiente.",
      };
    }
    revalidatePath("/driver", "layout");
    return {
      success:
        "Recibimos tu imagen. Puedes consultar aquí el estado de la revisión.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No pudimos enviar la imagen.",
    };
  }
}
