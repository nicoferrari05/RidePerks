import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireDriver, catalogLive } from "@/lib/platform/data";
import { Heading, Empty, CategoryIcon } from "@/components/platform/ui";
import { MapPin, Phone, ArrowUpRight } from "lucide-react";
import type { Business } from "@/lib/platform/types";
export const metadata = { title: "Comercios aliados · RidePerks" };
export default async function Page() {
  await requireDriver();
  const live = await catalogLive();
  const { data, error } = await getSupabaseAdmin()
    .from("rp_businesses")
    .select("id,name,description,category,address,phone,is_active")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error("No pudimos cargar los comercios.");
  const rows = live ? (data as Business[]) : [];
  return (
    <div className="rp-stack">
      <Heading title="Tus aliados en el camino">
        Consulta la ubicación de cada comercio y abre la ruta en tu mapa.
      </Heading>
      {rows.length ? (
        <div className="rp-grid">
          {rows.map((b) => (
            <article className="rp-panel" key={b.id}>
              <div className="flex items-center gap-3 mb-5">
                <CategoryIcon category={b.category} />
                <h2>{b.name}</h2>
              </div>
              <p className="rp-muted mb-4">{b.description}</p>
              <p className="rp-muted flex gap-2">
                <MapPin size={18} className="shrink-0 mt-1" />
                {b.address}
              </p>
              <div className="rp-actions mt-4">
                <a
                  className="rp-text-link"
                  href={
                    "https://www.google.com/maps/search/?api=1&query=" +
                    encodeURIComponent(b.name + " " + b.address + " Panamá")
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cómo llegar <ArrowUpRight size={16} />
                </a>
                {b.phone && (
                  <a
                    className="rp-text-link"
                    href={"tel:" + b.phone.replace(/[^+0-9]/g, "")}
                  >
                    <Phone size={16} />
                    Llamar
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="Estamos construyendo la red">
          <p>
            Aquí podrás consultar direcciones y datos de contacto de los
            comercios aliados cuando estén disponibles.
          </p>
        </Empty>
      )}
    </div>
  );
}
