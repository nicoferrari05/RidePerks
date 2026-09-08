import Link from "next/link";
import { notFound } from "next/navigation";
import { getBenefits, requireDriver } from "@/lib/platform/data";
import { uuidSchema } from "@/lib/platform/validation";
import { Heading, CategoryIcon } from "@/components/platform/ui";
import BenefitCode from "@/components/platform/BenefitCode";
export const metadata = { title: "Tu beneficio · RidePerks" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await requireDriver();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const b = (await getBenefits()).find((b) => b.id === id);
  if (!b) notFound();
  return (
    <div className="rp-stack">
      <Link href="/driver/benefits" className="rp-text-link">
        ← Todos los beneficios
      </Link>
      <Heading title={b.title}>
        {b.rp_businesses.name} · {b.rp_businesses.address}
      </Heading>
      <div className="rp-detail">
        <div className="rp-stack">
          <section className="rp-panel">
            <div className="flex items-center gap-3 mb-5">
              <CategoryIcon category={b.category} />
              <h2>{b.discount_label}</h2>
            </div>
            <p>{b.description}</p>
          </section>
          <section>
            <h2>Lo que necesitas saber</h2>
            <p className="rp-muted whitespace-pre-line">{b.terms}</p>
            <p className="rp-muted mt-3">
              {b.monthly_limit
                ? b.monthly_limit + " usos por conductor al mes."
                : "Sin límite mensual de usos establecido."}
            </p>
            {b.valid_until && (
              <p className="rp-muted">
                Disponible hasta el{" "}
                {b.valid_until.split("-").reverse().join("/")}.
              </p>
            )}
          </section>
          <section>
            <h2>Cómo aprovecharlo</h2>
            <ol className="rp-steps">
              <li>
                Confirma las condiciones con el comercio antes de consumir.
              </li>
              <li>Genera tu código y muéstralo al personal.</li>
              <li>
                Espera la confirmación del comercio y recibe tu beneficio.
              </li>
            </ol>
            <a
              className="rp-text-link"
              href={
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(
                  b.rp_businesses.name +
                    " " +
                    b.rp_businesses.address +
                    " Panamá",
                )
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver cómo llegar ↗
            </a>
          </section>
        </div>
        <BenefitCode benefitId={b.id} verified={p.status === "verified"} />
      </div>
    </div>
  );
}
