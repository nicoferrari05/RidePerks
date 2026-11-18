import { requireDriver } from "@/lib/platform/data";
import { readFilter } from "@/lib/platform/catalog";
import { directoryData } from "@/lib/platform/driver-screens";
import { DirectoryView } from "@/components/platform/driver/views";
export const metadata = { title: "Comercios aliados · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; open?: string; saved?: string }>;
}) {
  const p = await requireDriver();
  const filter = readFilter(await searchParams);
  const { live, businesses } = await directoryData(p, filter);
  return <DirectoryView live={live} businesses={businesses} filter={filter} />;
}
