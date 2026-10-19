import { requireDriver, getRedemptions } from "@/lib/platform/data";
import { HistoryView } from "@/components/platform/driver/views";
export const metadata = { title: "Actividad · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  return <HistoryView rows={await getRedemptions(p.id)} />;
}
