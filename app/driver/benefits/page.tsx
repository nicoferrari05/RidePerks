import { getBenefits } from "@/lib/platform/data";
import { categories } from "@/lib/platform/types";
import { Heading } from "@/components/platform/ui";
import BenefitExplorer from "@/components/platform/BenefitExplorer";
export const metadata = { title: "Beneficios · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "" } = await searchParams;
  return (
    <div className="rp-stack">
      <Heading title="Beneficios para tu día">
        Encuentra tu próxima parada y revisa las condiciones antes de ir.
      </Heading>
      <BenefitExplorer
        benefits={await getBenefits()}
        initialCategory={Object.hasOwn(categories, category) ? category : ""}
      />
    </div>
  );
}
