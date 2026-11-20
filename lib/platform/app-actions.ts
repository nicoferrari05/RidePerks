"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { currentProfile, rateLimit, requireDriver } from "./data";
import { createAuthClient } from "./supabase";
import { closeOwnAccount } from "./self-service";
import { markOnboarded } from "./signup-core";
import type { ActionState } from "./types";

// Welcome screens: shown once, then the driver goes to their first step.
export async function finishOnboarding(form: FormData) {
  const profile = await requireDriver();
  await markOnboarded(profile.id);
  revalidatePath("/driver", "layout");
  redirect(
    form.get("next") === "/driver/verify" ? "/driver/verify" : "/driver/dashboard",
  );
}

// Opening the notifications screen marks everything as read.
export async function markNotificationsRead() {
  const profile = await currentProfile();
  if (!profile) return;
  await getSupabaseAdmin()
    .from("rp_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .is("read_at", null);
  revalidatePath("/driver", "layout");
  revalidatePath("/business", "layout");
}

export async function toggleFavorite(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const profile = await requireDriver();
  const parsed = z
    .object({
      kind: z.enum(["benefit", "business"]),
      id: z.uuid(),
      saved: z.enum(["true", "false"]),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Solicitud inválida." };
  const { kind, id, saved } = parsed.data;
  try {
    await rateLimit("favorite:" + profile.id, 120, 600);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Intenta más tarde." };
  }
  const db = getSupabaseAdmin();
  const table =
    kind === "benefit" ? "rp_favorite_benefits" : "rp_favorite_businesses";
  const column = kind === "benefit" ? "benefit_id" : "business_id";
  const { error } =
    saved === "true"
      ? await db
          .from(table)
          .upsert(
            { driver_id: profile.id, [column]: id },
            { ignoreDuplicates: true },
          )
      : await db
          .from(table)
          .delete()
          .eq("driver_id", profile.id)
          .eq(column, id);
  if (error) return { error: "No pudimos guardar tu favorito." };
  revalidatePath("/driver", "layout");
  return { success: saved === "true" ? "Guardado" : "Quitado" };
}

export async function leaveFeedback(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const profile = await requireDriver();
  const parsed = z
    .object({
      id: z.uuid(),
      rating: z.coerce.number().int().min(1).max(5),
      applied: z.enum(["true", "false"]),
      comment: z.string().trim().max(500),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { error: "Elige las estrellas y si te aplicaron el beneficio." };
  try {
    await rateLimit("feedback:" + profile.id, 30, 3600);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Intenta más tarde." };
  }
  const { error } = await getSupabaseAdmin().rpc("rp_leave_feedback", {
    p_driver: profile.id,
    p_redemption: parsed.data.id,
    p_rating: parsed.data.rating,
    p_applied: parsed.data.applied === "true",
    p_comment: parsed.data.comment,
  });
  if (error)
    return {
      error:
        error.code === "P0001" ? error.message : "No pudimos guardar tu opinión.",
    };
  revalidatePath("/driver/history");
  return {
    success:
      parsed.data.applied === "true"
        ? "Gracias por contarnos."
        : "Gracias. Revisaremos con el comercio qué pasó.",
  };
}

// Self-service account deletion (Cuenta → Eliminar cuenta). The rules live
// in self-service.ts, shared with the phone app.
export async function deleteOwnAccount(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const profile = await currentProfile();
  if (!profile) return { error: "Inicia sesión de nuevo para continuar." };
  const result = await closeOwnAccount(
    profile,
    form.get("password"),
    form.get("confirm") === "on",
  );
  if (result.error) return result;
  try {
    await (await createAuthClient()).auth.signOut({ scope: "local" });
  } catch {
    /* The login is already banned; the cookie expires on its own. */
  }
  redirect("/login?deleted=1");
}
