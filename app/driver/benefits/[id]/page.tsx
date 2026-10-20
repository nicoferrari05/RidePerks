import { notFound } from "next/navigation";
import {
  catalogLive,
  getBenefits,
  getFavorites,
  requireDriver,
} from "@/lib/platform/data";
import { uuidSchema } from "@/lib/platform/validation";
import { businessMedia } from "@/lib/platform/catalog";
import { statusLine } from "@/lib/platform/hours";
import { BenefitDetailView } from "@/components/platform/driver/views";
export const metadata = { title: "Tu beneficio · RidePerks" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await requireDriver();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success || !(await catalogLive())) notFound();
  const [benefits, favorites] = await Promise.all([
    getBenefits(),
    getFavorites(p.id),
  ]);
  const b = benefits.find((b) => b.id === id);
  if (!b) notFound();
  const media = businessMedia(b.rp_businesses);
  return (
    <BenefitDetailView
      benefit={b}
      verified={p.status === "verified"}
      saved={favorites.benefits.has(b.id)}
      logo={media.logo}
      photos={media.photos}
      hours={media.hours}
      status={statusLine(b.rp_businesses.hours)}
    />
  );
}
