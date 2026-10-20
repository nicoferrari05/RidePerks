"use server";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  currentProfile,
  requireBusiness,
  rateLimit,
  MEDIA_BUCKET,
} from "./data";
import { uuidSchema } from "./validation";
import { validTime } from "./hours";
import { readImage } from "./images";
import type { ActionState, WeekHours } from "./types";
async function owner() {
  const context = await requireBusiness();
  if (!context.business || context.role !== "owner")
    throw new Error("Solo el administrador puede gestionar el comercio.");
  const check = await getSupabaseAdmin().rpc("rp_business_role", {
    p_user: context.profile.id,
    p_business: context.business.id,
  });
  if (check.error || check.data !== "owner") throw new Error("No autorizado.");
  return { ...context, business: context.business };
}
export async function selectBusiness(form: FormData) {
  const { businesses } = await requireBusiness();
  const id = String(form.get("business_id") || "");
  if (!businesses.some((row) => row.business.id === id))
    throw new Error("No autorizado.");
  (await cookies()).set("rp_business_id", id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/business");
}
export async function createStaffInvite(_: ActionState): Promise<ActionState> {
  void _;
  try {
    const { profile, business } = await owner();
    await rateLimit("staff-invite:" + profile.id, 20, 3600);
    const token = randomBytes(32).toString("hex");
    const { error } = await getSupabaseAdmin()
      .from("rp_business_invites")
      .insert({
        business_id: business.id,
        created_by: profile.id,
        token_hash: createHash("sha256").update(token).digest("hex"),
      });
    if (error) throw new Error("No pudimos crear la invitación.");
    return { success: "/business/join?invite=" + token };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No pudimos crear la invitación.",
    };
  }
}
export async function acceptStaffInvite(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const profile = await currentProfile();
  if (!profile || profile.role !== "business")
    return { error: "Inicia sesión como comercio antes de aceptar." };
  const token = String(form.get("invite") || "");
  if (!/^[a-f0-9]{64}$/.test(token)) return { error: "Invitación inválida." };
  try {
    await rateLimit("invite-accept:" + profile.id, 10);
    const { error, data } = await getSupabaseAdmin().rpc(
      "rp_accept_business_invite",
      {
        p_user: profile.id,
        p_hash: createHash("sha256").update(token).digest("hex"),
      },
    );
    if (error)
      return {
        error:
          error.code === "P0001"
            ? error.message
            : "No pudimos aceptar la invitación.",
      };
    (await cookies()).set("rp_business_id", data, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  } catch {
    return { error: "No pudimos aceptar la invitación. Intenta nuevamente." };
  }
  redirect("/business");
}
export async function removeStaff(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { business } = await owner();
  const id = uuidSchema.safeParse(form.get("user_id"));
  if (!id.success) return { error: "Cuenta inválida." };
  const { error } = await getSupabaseAdmin()
    .from("rp_business_members")
    .update({ is_active: false })
    .eq("business_id", business.id)
    .eq("user_id", id.data)
    .eq("role", "staff");
  if (error) return { error: "No pudimos retirar el acceso." };
  revalidatePath("/business");
  return { success: "Acceso retirado." };
}

export async function saveMerchantInfo(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { profile, business } = await owner();
  const { businessSchema } = await import("./catalog-validation");
  const parsed = businessSchema
    .omit({ id: true, owner_user_id: true })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const db = getSupabaseAdmin();
  const { name, address, category, ...direct } = parsed.data;
  // Description and phone are low risk; name, address and category identify
  // the business to drivers, so changes to them wait for RidePerks review.
  const saved = await db
    .from("rp_businesses")
    .update(direct)
    .eq("id", business.id);
  if (saved.error) return { error: "No pudimos guardar los datos." };
  const sensitive =
    name !== business.name ||
    address !== business.address ||
    category !== business.category;
  let message = "Datos actualizados.";
  if (sensitive) {
    await db
      .from("rp_business_changes")
      .delete()
      .eq("business_id", business.id)
      .eq("status", "pending");
    const request = await db.from("rp_business_changes").insert({
      business_id: business.id,
      payload: { name, address, category },
      created_by: profile.id,
    });
    if (request.error)
      return { error: "No pudimos enviar el cambio a revisión." };
    message =
      "Descripción y teléfono actualizados. El cambio de nombre, dirección o categoría quedó pendiente de aprobación.";
    revalidatePath("/admin/reviews");
  }
  revalidatePath("/business");
  revalidatePath("/driver", "layout");
  return { success: message };
}
export async function saveMerchantBenefit(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { profile, business } = await owner();
  const { benefitSchema } = await import("./catalog-validation");
  const values = Object.fromEntries(form);
  const parsed = benefitSchema.safeParse({
    ...values,
    business_id: business.id,
    id: values.benefit_id || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const db = getSupabaseAdmin();
  const { id, ...payload } = parsed.data;
  if (id) {
    const existing = await db
      .from("rp_benefits")
      .select("id")
      .eq("id", id)
      .eq("business_id", business.id)
      .maybeSingle();
    if (existing.error || !existing.data)
      return { error: "Beneficio inexistente." };
  }
  const revision = String(form.get("revision_id") || "");
  if (revision && !uuidSchema.safeParse(revision).success)
    return { error: "Propuesta inválida." };
  const data = {
    business_id: business.id,
    benefit_id: id || null,
    payload,
    created_by: profile.id,
    status: form.get("submit") === "review" ? "pending" : "draft",
    updated_at: new Date().toISOString(),
  };
  const result = revision
    ? await db
        .from("rp_benefit_revisions")
        .update(data)
        .eq("id", revision)
        .eq("business_id", business.id)
        .in("status", ["draft", "returned"])
        .select("id")
    : await db.from("rp_benefit_revisions").insert(data).select("id");
  if (result.error || !result.data?.length)
    return {
      error:
        "No pudimos guardar. Comprueba si ya existe una propuesta pendiente para este beneficio.",
    };
  revalidatePath("/business");
  revalidatePath("/admin/reviews");
  return {
    revisionId: result.data[0].id,
    submitted: data.status === "pending",
    success:
      data.status === "pending"
        ? "Enviado a RidePerks para aprobación."
        : "Borrador guardado.",
  };
}
export async function toggleMerchantBenefit(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { business } = await owner();
  const id = uuidSchema.safeParse(form.get("id"));
  if (!id.success) return { error: "Beneficio inválido." };
  const { error, data } = await getSupabaseAdmin()
    .from("rp_benefits")
    .update({ is_active: form.get("active") === "true" })
    .eq("id", id.data)
    .eq("business_id", business.id)
    .eq("admin_paused", false)
    .select("id");
  if (error) return { error: "No pudimos cambiar el estado." };
  if (!data?.length)
    return {
      error:
        "Este beneficio fue pausado por RidePerks. Contáctanos para reactivarlo.",
    };
  revalidatePath("/business");
  revalidatePath("/driver", "layout");
  return { success: "Estado actualizado." };
}

// Opening hours, logo and photos are the business's own presentation: they
// publish right away (RidePerks can still pause the business).
export async function saveHours(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { business } = await owner();
  const hours: WeekHours = [];
  for (let day = 0; day < 7; day++) {
    if (form.get("open_" + day) !== "on") {
      hours.push(null);
      continue;
    }
    const from = String(form.get("from_" + day) || "");
    let to = String(form.get("to_" + day) || "");
    if (!validTime(from) || !validTime(to))
      return { error: "Revisa las horas: usa el formato 08:00." };
    // 00:00 to 00:00 means open all day.
    if (from === to) {
      if (from !== "00:00")
        return { error: "La hora de cierre debe ser distinta a la de apertura." };
      to = "24:00";
    }
    hours.push([from, to]);
  }
  const { error } = await getSupabaseAdmin()
    .from("rp_businesses")
    .update({ hours: hours.some(Boolean) ? hours : null })
    .eq("id", business.id);
  if (error) return { error: "No pudimos guardar el horario." };
  revalidatePath("/business", "layout");
  revalidatePath("/driver", "layout");
  return { success: "Horario guardado." };
}

export async function uploadBusinessMedia(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { business, profile } = await owner();
  const kind = form.get("kind") === "logo" ? "logo" : "photo";
  const image = await readImage(form.get("file"), 2 * 1024 * 1024);
  if (!image)
    return { error: "Selecciona una imagen JPG, PNG o WebP de hasta 2 MB." };
  const photos = business.photo_paths || [];
  if (kind === "photo" && photos.length >= 6)
    return { error: "Puedes tener hasta 6 fotos. Quita una para subir otra." };
  try {
    await rateLimit("media:" + profile.id, 30, 3600);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Intenta más tarde." };
  }
  const db = getSupabaseAdmin();
  const path = business.id + "/" + crypto.randomUUID() + "." + image.ext;
  const uploaded = await db.storage
    .from(MEDIA_BUCKET)
    .upload(path, image.bytes, { contentType: image.contentType, upsert: false });
  if (uploaded.error)
    return { error: "No pudimos subir la imagen. Intenta nuevamente." };
  const saved = await db
    .from("rp_businesses")
    .update(
      kind === "logo" ? { logo_path: path } : { photo_paths: [...photos, path] },
    )
    .eq("id", business.id);
  if (saved.error) {
    await db.storage.from(MEDIA_BUCKET).remove([path]);
    return { error: "No pudimos guardar la imagen." };
  }
  if (kind === "logo" && business.logo_path)
    await db.storage.from(MEDIA_BUCKET).remove([business.logo_path]);
  revalidatePath("/business", "layout");
  revalidatePath("/driver", "layout");
  return { success: kind === "logo" ? "Logo actualizado." : "Foto agregada." };
}

export async function removeBusinessMedia(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { business } = await owner();
  const path = String(form.get("path") || "");
  const isLogo = path !== "" && path === business.logo_path;
  const photos = business.photo_paths || [];
  if (!isLogo && !photos.includes(path)) return { error: "Imagen inválida." };
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("rp_businesses")
    .update(
      isLogo
        ? { logo_path: null }
        : { photo_paths: photos.filter((p) => p !== path) },
    )
    .eq("id", business.id);
  if (error) return { error: "No pudimos quitar la imagen." };
  await db.storage.from(MEDIA_BUCKET).remove([path]);
  revalidatePath("/business", "layout");
  revalidatePath("/driver", "layout");
  return { success: "Imagen quitada." };
}
