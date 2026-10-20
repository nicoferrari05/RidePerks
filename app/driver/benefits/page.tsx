import {
  catalogLive,
  getBenefits,
  getFavorites,
  requireDriver,
} from "@/lib/platform/data";
import {
  decorateBenefit,
  matches,
  openFilter,
  readFilter,
} from "@/lib/platform/catalog";
import { BenefitsView } from "@/components/platform/driver/views";
export const metadata = { title: "Beneficios · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    open?: string;
    saved?: string;
  }>;
}) {
  const p = await requireDriver();
  const filter = readFilter(await searchParams);
  const live = await catalogLive();
  if (!live) return <BenefitsView live={false} benefits={[]} filter={filter} />;
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
  return <BenefitsView live benefits={visible} filter={filter} />;
}
