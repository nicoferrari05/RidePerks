import { requireDriver, getRatedRedemptions } from "@/lib/platform/data";
import { HistoryView } from "@/components/platform/driver/views";
export const metadata = { title: "Actividad · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  const rows = await getRatedRedemptions(p.id);
  return <HistoryView rows={rows} now={new Date().getTime()} />;
}
