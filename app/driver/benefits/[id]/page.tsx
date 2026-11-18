import { notFound } from "next/navigation";
import { requireDriver } from "@/lib/platform/data";
import { benefitDetailData } from "@/lib/platform/driver-screens";
import { BenefitDetailView } from "@/components/platform/driver/views";
export const metadata = { title: "Tu beneficio · RidePerks" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await requireDriver();
  const d = await benefitDetailData(p, (await params).id);
  if (!d) notFound();
  return (
    <BenefitDetailView
      benefit={d.benefit}
      verified={d.verified}
      saved={d.saved}
      logo={d.logo}
      photos={d.photos}
      hours={d.hours}
      status={d.status}
    />
  );
}
