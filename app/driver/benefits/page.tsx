import { getBenefits, requireDriver } from "@/lib/platform/data";
import { categories } from "@/lib/platform/types";
import { Heading, BenefitCard, Empty } from "@/components/platform/ui";
export const metadata = { title: "Beneficios · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  await requireDriver();
  const params = await searchParams;
  const q = (params.q || "").slice(0, 100);
  const category = params.category || "";
  const all = await getBenefits();
  const benefits = all.filter(
    (b) =>
      (!category || b.category === category) &&
      (!q ||
        (b.title + " " + b.rp_businesses.name + " " + b.description)
          .toLocaleLowerCase("es")
          .includes(q.toLocaleLowerCase("es"))),
  );
  return (
    <div className="rp-stack">
      <Heading title="Beneficios para tu día">
        Encuentra tu próxima parada y revisa las condiciones antes de ir.
      </Heading>
      <form className="rp-filters">
        <div className="rp-field">
          <label htmlFor="q">Buscar beneficio o comercio</label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Gasolina, almuerzo, taller…"
            defaultValue={q}
            maxLength={100}
          />
        </div>
        <div className="rp-field">
          <label htmlFor="category">Categoría</label>
          <select id="category" name="category" defaultValue={category}>
            <option value="">Todas las categorías</option>
            {Object.entries(categories).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <button className="rp-button dark">Buscar</button>
      </form>
      <p className="rp-muted">
        {benefits.length}{" "}
        {benefits.length === 1
          ? "beneficio disponible"
          : "beneficios disponibles"}
      </p>
      {benefits.length ? (
        <div className="rp-grid">
          {benefits.map((b) => (
            <BenefitCard key={b.id} benefit={b} />
          ))}
        </div>
      ) : (
        <Empty
          title={
            all.length
              ? "No encontramos coincidencias"
              : "Los próximos beneficios estarán aquí"
          }
          href={all.length ? "/driver/benefits" : undefined}
          label="Ver todos los beneficios"
        >
          <p>
            {all.length
              ? "Prueba con otra palabra o categoría."
              : "Estamos incorporando comercios aliados. Verás descuentos confirmados y sus condiciones cuando estén disponibles."}
          </p>
        </Empty>
      )}
    </div>
  );
}
