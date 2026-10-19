import { notFound } from "next/navigation";
import { catalogLive, getBenefits, requireDriver } from "@/lib/platform/data";
import { uuidSchema } from "@/lib/platform/validation";
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
  const b = (await getBenefits()).find((b) => b.id === id);
  if (!b) notFound();
  return <BenefitDetailView benefit={b} verified={p.status === "verified"} />;
}
