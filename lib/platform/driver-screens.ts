import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  BUSINESS_PUBLIC,
  catalogLive,
  getBenefits,
  getFavorites,
  getMonthlySavings,
  getRedemptions,
  getTotalSavings,
  getVerification,
  unreadNotifications,
} from "./data";
import {
  businessMedia,
  decorateBenefit,
  matches,
  openFilter,
} from "./catalog";
import { statusLine } from "./hours";
import { uuidSchema } from "./validation";
import type { Business, Profile } from "./types";
import type { CatalogFilter } from "@/components/platform/driver/views";

// What each driver screen shows, loaded once for both the web pages
// (app/driver/*) and the phone app (/api/app/driver/*), so the two always
// show the same data under the same rules.

export const NO_FILTER: CatalogFilter = {
  q: "",
  category: "",
  open: false,
  saved: false,
};

export async function dashboardData(p: Profile) {
  const [history, monthly, total, live, access, unread, verification] =
    await Promise.all([
      getRedemptions(p.id),
      getMonthlySavings(p.id),
      getTotalSavings(p.id),
      catalogLive(),
      getSupabaseAdmin().rpc("rp_has_access", { p_driver: p.id }),
      unreadNotifications(p.id),
      p.status === "verified" ? null : getVerification(p.id),
    ]);
  if (access.error) throw new Error("No pudimos consultar tu membresía.");
  const featured = live
    ? (await getBenefits()).slice(0, 6).map((b) => decorateBenefit(b))
    : [];
  return {
    history,
    monthly,
    total,
    live,
    featured,
    hasAccess: Boolean(access.data),
    verificationPending: verification?.status === "pending",
    unread,
  };
}

export async function benefitsData(p: Profile, filter: CatalogFilter) {
  const live = await catalogLive();
  if (!live) return { live, benefits: [], favorites: new Set<string>() };
  const [benefits, favorites] = await Promise.all([
    getBenefits(),
    getFavorites(p.id),
  ]);
  const now = new Date();
  const visible = benefits
    .filter(
      (b) =>
        (!filter.category || b.category === filter.category) &&
        (!filter.saved || favorites.benefits.has(b.id)) &&
        openFilter(filter.open, b.rp_businesses.hours, now) &&
        matches(
          filter.q,
          b.title,
          b.discount_label,
          b.description,
          b.rp_businesses.name,
        ),
    )
    .map((b) => decorateBenefit(b, now));
  return { live, benefits: visible, favorites: favorites.benefits };
}

/** null when the benefit doesn't exist, is paused, or the catalog is off. */
export async function benefitDetailData(p: Profile, id: string) {
  if (!uuidSchema.safeParse(id).success || !(await catalogLive())) return null;
  const [benefits, favorites] = await Promise.all([
    getBenefits(),
    getFavorites(p.id),
  ]);
  const b = benefits.find((b) => b.id === id);
  if (!b) return null;
  const media = businessMedia(b.rp_businesses);
  return {
    benefit: b,
    verified: p.status === "verified",
    saved: favorites.benefits.has(b.id),
    logo: media.logo,
    photos: media.photos,
    hours: media.hours,
    status: statusLine(b.rp_businesses.hours),
  };
}

export async function directoryData(p: Profile, filter: CatalogFilter) {
  const live = await catalogLive();
  if (!live) return { live, businesses: [] };
  const [result, favorites] = await Promise.all([
    getSupabaseAdmin()
      .from("rp_businesses")
      .select(BUSINESS_PUBLIC)
      .eq("is_active", true)
      .order("name"),
    getFavorites(p.id),
  ]);
  if (result.error) throw new Error("No pudimos cargar los comercios.");
  const now = new Date();
  const businesses = (result.data as unknown as Business[])
    .filter(
      (b) =>
        (!filter.saved || favorites.businesses.has(b.id)) &&
        openFilter(filter.open, b.hours, now) &&
        matches(filter.q, b.name, b.description, b.address),
    )
    .map((b) => {
      const media = businessMedia(b);
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        category: b.category,
        address: b.address,
        phone: b.phone,
        logo: media.logo,
        photos: media.photos,
        status: statusLine(b.hours, now),
        saved: favorites.businesses.has(b.id),
      };
    });
  return { live, businesses };
}

/** The Membresía value on Cuenta. */
export async function membershipLabel(p: Profile) {
  const access = await getSupabaseAdmin().rpc("rp_access_state", {
    p_driver: p.id,
  });
  if (access.error) throw new Error("No pudimos consultar tu membresía.");
  const state = access.data as {
    status: string;
    lifetime: boolean;
    has_access: boolean;
  };
  return state.status !== "enabled"
    ? "Bloqueada"
    : state.lifetime
      ? "Permanente"
      : state.has_access
        ? "Activa"
        : "Inactiva";
}
