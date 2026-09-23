import Link from "next/link";
import { Empty, Heading, BenefitCard } from "@/components/platform/ui";
import { catalogLive, getBenefits } from "@/lib/platform/data";
import { categories } from "@/lib/platform/types";
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
  const visible = selected
    ? benefits.filter((b) => b.category === selected)
    : benefits;
  return (
    <div className="rp-stack">
      <Heading title="Beneficios para tu día">
        Encuentra tu próxima parada y revisa las condiciones antes de ir.
      </Heading>
      {live ? (
        <>
          <nav className="rp-category-chips" aria-label="Categoría">
            {[["", "Todos"], ...Object.entries(categories)].map(([v, l]) => (
              <Link
                key={v || "all"}
                className="rp-button secondary"
                aria-current={selected === v ? "page" : undefined}
                href={v ? "/driver/benefits?category=" + v : "/driver/benefits"}
              >
                {l}
              </Link>
            ))}
          </nav>
          {visible.length ? (
            <div className="rp-grid">
              {visible.map((b) => (
                <BenefitCard key={b.id} benefit={b} />
              ))}
            </div>
          ) : (
            <Empty title="Sin beneficios en esta categoría todavía">
              <p>Vuelve pronto: seguimos sumando comercios aliados.</p>
            </Empty>
          )}
        </>
      ) : (
        <Empty title="Próximamente: más beneficios">
          <p>
            Estamos cerrando los últimos detalles con nuestros comercios
            aliados. Muy pronto vas a encontrar aquí descuentos en
            mantenimiento, comida y combustible.
          </p>
        </Empty>
      )}
    </div>
  );
}
