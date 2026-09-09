import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { authConfigured, createAuthClient } from "./supabase";
import type {
  Profile,
  Benefit,
  Business,
  Redemption,
  Verification,
} from "./types";
export const currentProfile = cache(async (): Promise<Profile | null> => {
  if (!authConfigured()) return null;
  const auth = await createAuthClient();
  const {
    data: { user },
    error,
  } = await auth.auth.getUser();
  if (error || !user) return null;
  const result = await getSupabaseAdmin()
    .from("rp_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (result.error) throw new Error("No pudimos consultar tu cuenta.");
  return result.data as Profile | null;
});
export async function requireDriver() {
  const profile = await currentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "business") redirect("/business");
  return profile;
}
export async function requireBusiness() {
  const profile = await currentProfile();
  if (!profile) redirect("/login?next=/business");
  if (profile.role !== "business") redirect("/driver/dashboard");
  if (profile.status === "suspended") return { profile, business: null };
  const { data, error } = await getSupabaseAdmin()
    .from("rp_businesses")
    .select("*")
    .eq("owner_user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error("No pudimos consultar el comercio.");
  return { profile, business: data as Business | null };
}
export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifySessionToken(token)))
    redirect("/admin/login?next=/admin/platform");
}
export const getBenefits = cache(async (): Promise<Benefit[]> => {
  await requireDriver();
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Panama",
  });
  const { data, error } = await getSupabaseAdmin()
    .from("rp_benefits")
    .select("*, rp_businesses!inner(*)")
    .eq("is_active", true)
    .eq("rp_businesses.is_active", true)
    .or(`valid_from.is.null,valid_from.lte.${today}`)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order("created_at", { ascending: false });
  if (error)
    throw new Error("No pudimos cargar los beneficios. Intenta nuevamente.");
  return data as Benefit[];
});
export async function getRedemptions(driverId: string): Promise<Redemption[]> {
  if ((await requireDriver()).id !== driverId)
    throw new Error("No autorizado.");
  const { data, error } = await getSupabaseAdmin()
    .from("rp_redemptions")
    .select("id,benefit_title,business_name,savings_amount,redeemed_at")
    .eq("driver_id", driverId)
    .order("redeemed_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("No pudimos cargar tu historial.");
  return data as Redemption[];
}
export async function getVerification(
  driverId: string,
): Promise<Verification | null> {
  if ((await requireDriver()).id !== driverId)
    throw new Error("No autorizado.");
  const { data, error } = await getSupabaseAdmin()
    .from("rp_verifications")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("No pudimos cargar tu verificación.");
  return data;
}
export async function rateLimit(key: string, limit = 10, seconds = 600) {
  const { data, error } = await getSupabaseAdmin().rpc("rp_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_seconds: seconds,
  });
  if (error)
    throw new Error("No pudimos procesar la solicitud. Intenta más tarde.");
  if (!data)
    throw new Error(
      "Demasiados intentos. Espera unos minutos y vuelve a intentar.",
    );
}

export async function getMonthlySavings(driverId: string) {
  if ((await requireDriver()).id !== driverId)
    throw new Error("No autorizado.");
  const until = new Date().toISOString();
  const month = new Date(Date.now() - 5 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 7);
  const start = month + "-01T00:00:00-05:00";
  let total = 0,
    count = 0;
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await getSupabaseAdmin()
      .from("rp_redemptions")
      .select("savings_amount")
      .eq("driver_id", driverId)
      .gte("redeemed_at", start)
      .lte("redeemed_at", until)
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error("No pudimos calcular el ahorro del mes.");
    for (const row of data) {
      total += Number(row.savings_amount || 0);
      count++;
    }
    if (data.length < 500) break;
  }
  return { total, count };
}
