import Link from "next/link";
import { Store, MapPin } from "lucide-react";
import { requireBusiness } from "@/lib/platform/data";
import { logout } from "@/lib/platform/auth-actions";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Logo, Heading, Empty } from "@/components/platform/ui";
import BusinessScanner from "@/components/platform/BusinessScanner";
import { StaffInvite, RemoveStaff } from "@/components/platform/StaffForms";
import { selectBusiness } from "@/lib/platform/business-actions";
import BusinessBenefits from "@/components/platform/BusinessBenefits";
import { MerchantInfo } from "@/components/platform/MerchantForms";
import SupportForm from "@/components/platform/SupportForm";
import BusinessMetrics from "@/components/platform/BusinessMetrics";
import { dateLabel } from "@/lib/platform/types";
import PlatformThemeScript from "@/components/platform/ThemeScript";
import { PlatformThemeToggle } from "@/components/platform/theme";
import "../platform.css";
export const metadata = {
  title: "Portal de comercios · RidePerks",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { business, profile, role, businesses } = await requireBusiness();
  const { period } = await searchParams;
  const db = getSupabaseAdmin();
  const [history, benefits] =
    business && role === "owner"
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
  const staff =
    business && role === "owner"
      ? await db
          .from("rp_business_members")
          .select("user_id,rp_profiles(full_name)")
          .eq("business_id", business.id)
          .eq("role", "staff")
          .eq("is_active", true)
      : null;
  if (staff?.error) throw new Error("No pudimos consultar el personal.");
  const pendingChange =
    business && role === "owner"
      ? await db
          .from("rp_business_changes")
          .select("id")
          .eq("business_id", business.id)
          .eq("status", "pending")
          .maybeSingle()
      : null;
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Panama",
  });
  const active = (benefit: NonNullable<typeof benefits>["data"][number]) =>
    benefit.is_active &&
    (!benefit.valid_from || benefit.valid_from <= today) &&
    (!benefit.valid_until || benefit.valid_until >= today);
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <header className="rp-business-header">
        <Logo />
        <span className="rp-badge">
          <Store size={14} />
          Comercios
        </span>
        <PlatformThemeToggle />
        <nav aria-label="Portal del comercio">
          <Link href="/business">Mi comercio</Link>
          {business && role === "owner" && (
            <Link href="#beneficios">Beneficios</Link>
          )}
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
        {businesses.length > 1 && (
          <form action={selectBusiness} className="rp-form">
            <label htmlFor="business_id">Comercio</label>
            <select
              name="business_id"
              id="business_id"
              defaultValue={business?.id}
            >
              {businesses.map((row) => (
                <option key={row.business.id} value={row.business.id}>
                  {row.business.name}
                </option>
              ))}
            </select>
            <button className="rp-button secondary">Cambiar comercio</button>
          </form>
        )}
        {business ? (
          <>
            {role === "owner" && (
              <BusinessMetrics
                businessId={business.id}
                actorId={profile.id}
                period={period}
              />
            )}
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
                  {role === "staff"
                    ? "Personal autorizado"
                    : (benefits?.data || []).filter(active).length +
                      " beneficios disponibles"}
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
              {role === "owner" && (
                <section>
                  <h2 className="mb-5">Últimos usos confirmados</h2>
                  {history?.data?.length ? (
                    <div className="rp-list">
                      {history.data.map((r) => (
                        <div className="rp-list-row" key={r.id}>
                          <div>
                            <h3>{r.benefit_title}</h3>
                            <p className="rp-muted">
                              {dateLabel(r.redeemed_at)}
                            </p>
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
              )}
            </div>
            {role === "owner" && (
              <>
                <details>
                  <summary>Información del comercio</summary>
                  <MerchantInfo
                    business={business}
                    pendingChange={Boolean(pendingChange?.data)}
                  />
                </details>
                <BusinessBenefits businessId={business.id} />
                <section className="rp-stack">
                  <h2>Personal autorizado</h2>
                  <StaffInvite />
                  {staff?.data?.map((member) => (
                    <div className="rp-list-row" key={member.user_id}>
                      <span>
                        {(
                          member.rp_profiles as unknown as { full_name: string }
                        )?.full_name || "Personal"}
                      </span>
                      <RemoveStaff id={member.user_id} />
                    </div>
                  ))}
                </section>
              </>
            )}
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
        <details>
          <summary>Ayuda y soporte</summary>
          <div className="rp-panel">
            <SupportForm audience="business" />
          </div>
        </details>
      </main>
    </div>
  );
}
