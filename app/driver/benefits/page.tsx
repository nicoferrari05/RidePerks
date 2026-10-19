import { catalogLive, getBenefits } from "@/lib/platform/data";
import { categories } from "@/lib/platform/types";
import { BenefitsView } from "@/components/platform/driver/views";
export const metadata = { title: "Beneficios · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const live = await catalogLive();
  const { category } = await searchParams;
  const selected = category && category in categories ? category : "";
  const benefits = live ? await getBenefits() : [];
  return <BenefitsView live={live} benefits={benefits} selected={selected} />;
}
