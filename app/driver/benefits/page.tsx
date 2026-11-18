import { requireDriver } from "@/lib/platform/data";
import { readFilter } from "@/lib/platform/catalog";
import { benefitsData } from "@/lib/platform/driver-screens";
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
  const { live, benefits } = await benefitsData(p, filter);
  return <BenefitsView live={live} benefits={benefits} filter={filter} />;
}
