import Link from "next/link";
import { Store, Ticket, MapPin } from "lucide-react";
import { requireBusiness } from "@/lib/platform/data";
import { logout } from "@/lib/platform/auth-actions";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Logo, Heading, Empty } from "@/components/platform/ui";
import BusinessScanner from "@/components/platform/BusinessScanner";
import { dateLabel } from "@/lib/platform/types";
import "../platform.css";
export const metadata = {
  title: "Portal de comercios · RidePerks",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const { business, profile } = await requireBusiness();
  const db = getSupabaseAdmin();
  const [history, benefits] = business
    ? await Promise.all([
        db
          .from("rp_redemptions")
          .select("id,benefit_title,redeemed_at")
          .eq("business_id", business.id)
          .order("redeemed_at", { ascending: false })
          .limit(30),
        db
          .from("rp_benefits")
          .select(
            "id,title,discount_label,terms,is_active,valid_from,valid_until",
          )
          .eq("business_id", business.id)
          .order("created_at", { ascending: false }),
      ])
    : [null, null];
  if (history?.error || benefits?.error)
    throw new Error("No pudimos cargar la información del comercio.");
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Panama",
  });
  const active = (benefit: NonNullable<typeof benefits>["data"][number]) =>
    benefit.is_active &&
    (!benefit.valid_from || benefit.valid_from <= today) &&
    (!benefit.valid_until || benefit.valid_until >= today);
  return (
    <div className="rp-app">
      <header className="rp-business-header">
        <Logo />
        <span className="rp-badge">
          <Store size={14} />
          Comercios
        </span>
        <nav aria-label="Portal del comercio">
          <Link href="/business">Mi comercio</Link>
          {business && <Link href="#beneficios">Beneficios</Link>}
          <Link href="/account/password">Contraseña</Link>
        </nav>
        <form action={logout}>
          <input type="hidden" name="audience" value="business" />
          <button className="rp-text-link">Cerrar sesión</button>
        </form>
      </header>
      <main className="rp-main rp-stack">
        <Heading title={business?.name || "Tu portal de comercio"}>
          Hola, {profile.full_name}. Este es el espacio de tu negocio en
          RidePerks.
        </Heading>
        {business ? (
          <>
            <section
              className="rp-business-overview"
              aria-label="Resumen del comercio"
            >
              <div>
                <span className="rp-badge good">Comercio vinculado</span>
                <p className="rp-muted flex items-center gap-2">
                  <MapPin size={16} aria-hidden="true" />
                  {business.address}
                </p>
              </div>
              <div>
                <strong>
                  {(benefits?.data || []).filter(active).length} beneficios
                  disponibles
                </strong>
                <p className="rp-muted">
                  Solo se pueden validar beneficios de este comercio.
                </p>
              </div>
            </section>
            <div className="rp-detail">
              <section id="validar">
                <BusinessScanner />
              </section>
              <section>
                <h2 className="mb-5">Últimos usos confirmados</h2>
                {history?.data?.length ? (
                  <div className="rp-list">
                    {history.data.map((r) => (
                      <div className="rp-list-row" key={r.id}>
                        <div>
                          <h3>{r.benefit_title}</h3>
                          <p className="rp-muted">{dateLabel(r.redeemed_at)}</p>
                        </div>
                        <span className="rp-badge good">Confirmado</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty title="Sin usos todavía">
                    <p>Cuando confirmes un beneficio, aparecerá aquí.</p>
                  </Empty>
                )}
                <p className="rp-muted mt-4">
                  Se muestran los últimos 30 usos.
                </p>
              </section>
            </div>
            <section id="beneficios" className="scroll-mt-6">
              <h2 className="mb-2">Beneficios de tu comercio</h2>
              <p className="rp-muted mb-5">
                Comprueba las condiciones antes de aplicar un beneficio. El
                equipo de RidePerks gestiona su publicación.
              </p>
              {benefits?.data?.length ? (
                <div className="rp-list">
                  {benefits.data.map((b) => (
                    <article className="rp-list-row" key={b.id}>
                      <div>
                        <h3 className="flex items-center gap-2">
                          <Ticket size={18} aria-hidden="true" />
                          {b.title}
                        </h3>
                        <p className="mt-2">{b.discount_label}</p>
                        <p className="rp-muted mt-2 whitespace-pre-line">
                          {b.terms}
                        </p>
                      </div>
                      <span
                        className={
                          "rp-badge " + (active(b) ? "good" : "pending")
                        }
                      >
                        {active(b) ? "Disponible" : "No disponible"}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <Empty title="Aún no hay beneficios publicados">
                  <p>
                    Coordina con RidePerks las condiciones de tu primer
                    beneficio.
                  </p>
                </Empty>
              )}
            </section>
          </>
        ) : (
          <Empty
            title={
              profile.status === "suspended"
                ? "Tu cuenta está suspendida"
                : "Tu cuenta está lista. Falta vincular el comercio."
            }
          >
            <p>
              {profile.status === "suspended"
                ? "Contacta al equipo de RidePerks para revisar tu cuenta."
                : "El equipo de RidePerks debe seleccionar tu nombre como responsable al crear o editar un comercio. En cuanto lo vincule y active, podrás validar beneficios aquí."}
            </p>
            <p className="rp-muted mt-3">
              Responsable: {profile.full_name} · {profile.phone}
            </p>
          </Empty>
        )}
      </main>
    </div>
  );
}
