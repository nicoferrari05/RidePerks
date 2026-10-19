import { redirect } from "next/navigation";
import { requireBusiness } from "@/lib/platform/data";
import BusinessBenefits, {
  loadBusinessBenefits,
} from "@/components/platform/BusinessBenefits";
export const metadata = { title: "Beneficios · RidePerks" };
export default async function Page() {
  const { business, role } = await requireBusiness();
  if (!business || role !== "owner") redirect("/business");
  return <BusinessBenefits {...await loadBusinessBenefits(business.id)} />;
}
