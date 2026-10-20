import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  requireDriver,
  catalogLive,
  getFavorites,
  BUSINESS_PUBLIC,
} from "@/lib/platform/data";
import {
  businessMedia,
  matches,
  openFilter,
  readFilter,
} from "@/lib/platform/catalog";
import { statusLine } from "@/lib/platform/hours";
import type { Business } from "@/lib/platform/types";
import { DirectoryView } from "@/components/platform/driver/views";
export const metadata = { title: "Comercios aliados · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; open?: string; saved?: string }>;
}) {
  const p = await requireDriver();
  const filter = readFilter(await searchParams);
  const live = await catalogLive();
  if (!live)
    return <DirectoryView live={false} businesses={[]} filter={filter} />;
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
  return <DirectoryView live businesses={businesses} filter={filter} />;
}
