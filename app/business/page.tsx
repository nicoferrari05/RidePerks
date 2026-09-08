import Link from "next/link";
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
  const history = business
    ? await getSupabaseAdmin()
        .from("rp_redemptions")
        .select("id,benefit_title,redeemed_at")
        .eq("business_id", business.id)
        .order("redeemed_at", { ascending: false })
        .limit(30)
    : null;
  if (history?.error) throw new Error("No pudimos cargar los usos.");
  return (
    <div className="rp-app">
      <header className="rp-mobile-header" style={{ display: "flex" }}>
        <Logo />
        <form action={logout}>
          <button className="rp-text-link">Cerrar sesión</button>
        </form>
      </header>
      <main className="rp-main rp-stack">
        <Heading title={business?.name || "Tu portal de comercio"}>
          Confirma los beneficios que aplicas a los conductores de RidePerks.
        </Heading>
        {business ? (
          <div className="rp-detail">
            <BusinessScanner />
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
                  <p>
                    Cuando confirmes un beneficio, aparecerá aquí. Se muestran
                    los últimos 30 usos.
                  </p>
                </Empty>
              )}
              <Link className="rp-text-link" href="/recover">
                Recuperar contraseña →
              </Link>
            </section>
          </div>
        ) : (
          <Empty
            title={
              profile.status === "suspended"
                ? "Tu cuenta está suspendida"
                : "Falta vincular tu comercio"
            }
          >
            <p>
              El equipo de RidePerks debe vincular esta cuenta a un comercio
              activo.
            </p>
          </Empty>
        )}
      </main>
    </div>
  );
}
