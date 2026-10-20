import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { PIN_COOKIE_NAME, readPinSession } from "@/lib/pinAuth";
import { authConfigured, createAuthClient } from "./supabase";
import { uuidSchema } from "./validation";
import type {
  Profile,
  Benefit,
  Business,
  Redemption,
  Verification,
  AppNotification,
} from "./types";
// The session JWT is verified locally (asymmetric signing keys), which saves
// a round trip to Supabase Auth on every page and action. A closed account
// counts as signed out right away even while its token is still unexpired;
// its login is also banned, so the token can't be refreshed.
export const currentProfile = cache(async (): Promise<Profile | null> => {
  if (!authConfigured()) return null;
  const auth = await createAuthClient();
  const { data, error } = await auth.auth.getClaims();
  const id = data?.claims?.sub;
  if (error || !id) return null;
  const result = await getSupabaseAdmin()
    .from("rp_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (result.error) throw new Error("No pudimos consultar tu cuenta.");
  const profile = result.data as Profile | null;
  return profile && !profile.closed_at ? profile : null;
});
export async function requireDriver() {
  const profile = await currentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "business") redirect("/business");
  return profile;
}
// Cached per request: the portal layout and each page both need it.
export const requireBusiness = cache(async () => {
  const profile = await currentProfile();
  if (!profile) redirect("/business/login");
  if (profile.role !== "business") redirect("/driver/dashboard");
  if (profile.status === "suspended")
    return { profile, business: null, role: null, businesses: [] };
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("rp_business_members")
    .select(
      "business_id,role,rp_businesses!inner(" + BUSINESS_PUBLIC + ",pin_set_at)",
    )
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .eq("rp_businesses.is_active", true);
  if (error) throw new Error("No pudimos consultar tus comercios.");
  const rows = (data || []) as unknown as {
    role: "owner" | "staff";
    rp_businesses: Business;
  }[];
  const businesses = rows.map((row) => ({
    business: row.rp_businesses,
    role: row.role,
  }));
  const selected = (await cookies()).get("rp_business_id")?.value;
  const current =
    businesses.find((row) => row.business.id === selected) || businesses[0];
  return {
    profile,
    business: current?.business || null,
    role: current?.role || null,
    businesses,
  };
});
export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifySessionToken(token)))
    redirect("/admin/login?next=/admin/platform");
}
// The business behind this device's PIN session, or null when there is no
// session or its PIN was changed/removed or the business paused since.
export const pinBusiness = cache(async () => {
  const session = readPinSession((await cookies()).get(PIN_COOKIE_NAME)?.value);
  if (!session) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("rp_businesses")
    .select("id,name,address")
    .eq("id", session.businessId)
    .eq("is_active", true)
    .eq("pin_version", session.version)
    .not("pin_hash", "is", null)
    .maybeSingle();
  if (error) throw new Error("No pudimos consultar el comercio.");
  return data
    ? {
        ...(data as Pick<Business, "id" | "name" | "address">),
        version: session.version,
      }
    : null;
});
// Accepts either the full token (from the QR/camera) or the six-character
// fallback code a driver can read out loud / type by hand. The redeem
// transactions only ever see a real token uuid — this is a plain, read-only
// lookup ahead of them, not a security boundary.
export async function resolveQrToken(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (uuidSchema.safeParse(raw).success) return raw;
  if (!/^[0-9a-f]{6}$/i.test(raw)) return null;
  const resolved = await getSupabaseAdmin()
    .from("rp_qr_tokens")
    .select("token")
    .eq("short_code", raw.toUpperCase())
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return resolved.data ? (resolved.data.token as string) : null;
}
// Business columns safe to show drivers (never the PIN hash).
export const BUSINESS_PUBLIC =
  "id,name,category,address,phone,description,is_active,owner_user_id,hours,logo_path,photo_paths";
export const MEDIA_BUCKET = "rp-business-media";
/** Public URL of a business logo or photo stored in the media bucket. */
export function mediaUrl(path: string | null | undefined) {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !base) return null;
  return (
    base.replace(/\/$/, "") +
    "/storage/v1/object/public/" +
    MEDIA_BUCKET +
    "/" +
    path.split("/").map(encodeURIComponent).join("/")
  );
}
export const getBenefits = cache(async (): Promise<Benefit[]> => {
  await requireDriver();
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Panama",
  });
  const { data, error } = await getSupabaseAdmin()
    .from("rp_benefits")
    .select("*, rp_businesses!inner(" + BUSINESS_PUBLIC + ")")
    .eq("is_active", true)
    .eq("rp_businesses.is_active", true)
    .or(`valid_from.is.null,valid_from.lte.${today}`)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order("created_at", { ascending: false });
  if (error)
    throw new Error("No pudimos cargar los beneficios. Intenta nuevamente.");
  return data as unknown as Benefit[];
});
/** Ids of the benefits and businesses this driver saved. */
export const getFavorites = cache(async (driverId: string) => {
  const db = getSupabaseAdmin();
  const [benefits, businesses] = await Promise.all([
    db.from("rp_favorite_benefits").select("benefit_id").eq("driver_id", driverId),
    db
      .from("rp_favorite_businesses")
      .select("business_id")
      .eq("driver_id", driverId),
  ]);
  if (benefits.error || businesses.error)
    throw new Error("No pudimos cargar tus favoritos.");
  return {
    benefits: new Set(benefits.data.map((r) => r.benefit_id as string)),
    businesses: new Set(businesses.data.map((r) => r.business_id as string)),
  };
});
export const unreadNotifications = cache(async (userId: string) => {
  const { count, error } = await getSupabaseAdmin()
    .from("rp_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  // The bell is secondary: never break a screen because it failed.
  return error ? 0 : count || 0;
});
export async function getNotifications(
  userId: string,
): Promise<AppNotification[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("rp_notifications")
    .select("id,kind,title,body,href,read_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw new Error("No pudimos cargar tus notificaciones.");
  return data;
}
export const catalogLive = cache(async (): Promise<boolean> => {
  const { data, error } = await getSupabaseAdmin()
    .from("rp_settings")
    .select("value")
    .eq("key", "catalog_live")
    .maybeSingle();
  if (error) throw new Error("No pudimos consultar el catálogo.");
  return data?.value === true;
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
/** History plus whether each recent use was already rated. */
export async function getRatedRedemptions(driverId: string) {
  const rows = await getRedemptions(driverId);
  const { data, error } = await getSupabaseAdmin()
    .from("rp_redemption_feedback")
    .select("redemption_id")
    .eq("driver_id", driverId)
    .gte("created_at", new Date(Date.now() - 60 * 86400000).toISOString());
  if (error) throw new Error("No pudimos cargar tu historial.");
  const rated = new Set(data.map((r) => r.redemption_id as string));
  return rows.map((r) => ({ ...r, rated: rated.has(r.id) }));
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

async function sumSavings(
  driverId: string,
  since: string | null,
  errorMessage: string,
) {
  const until = new Date().toISOString();
  let total = 0,
    count = 0;
  for (let offset = 0; ; offset += 500) {
    let query = getSupabaseAdmin()
      .from("rp_redemptions")
      .select("savings_amount")
      .eq("driver_id", driverId)
      .lte("redeemed_at", until)
      .order("id")
      .range(offset, offset + 499);
    if (since) query = query.gte("redeemed_at", since);
    const { data, error } = await query;
    if (error) throw new Error(errorMessage);
    for (const row of data) {
      total += Number(row.savings_amount || 0);
      count++;
    }
    if (data.length < 500) break;
  }
  return { total, count };
}

export async function getMonthlySavings(driverId: string) {
  if ((await requireDriver()).id !== driverId)
    throw new Error("No autorizado.");
  const month = new Date(Date.now() - 5 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 7);
  const start = month + "-01T00:00:00-05:00";
  return sumSavings(driverId, start, "No pudimos calcular el ahorro del mes.");
}

export async function getTotalSavings(driverId: string) {
  if ((await requireDriver()).id !== driverId)
    throw new Error("No autorizado.");
  return sumSavings(driverId, null, "No pudimos calcular el ahorro total.");
}
