import { redirect } from "next/navigation";
import { requireBusiness } from "@/lib/platform/data";
import {
  businessActivityData,
  readPeriod,
} from "@/lib/platform/business-screens";
import { ActivityView } from "@/components/platform/business/views";
export const metadata = { title: "Actividad · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { business, profile, role } = await requireBusiness();
  if (!business || role !== "owner") redirect("/business");
  const period = readPeriod((await searchParams).period);
  const d = await businessActivityData(business.id, profile.id, period);
  return (
    <ActivityView
      stats={d.stats}
      period={period}
      recent={d.recent}
      feedback={d.feedback}
    />
  );
}
