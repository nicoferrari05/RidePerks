import BusinessScanner from "@/components/platform/BusinessScanner";
import BusinessMetrics, {
  type BusinessStats,
} from "@/components/platform/BusinessMetrics";
import { MerchantInfo } from "@/components/platform/MerchantForms";
import { StaffInvite, RemoveStaff } from "@/components/platform/StaffForms";
import SupportForm from "@/components/platform/SupportForm";
import { ThemeSetting } from "@/components/platform/theme";
import { Empty, MenuLink } from "@/components/platform/ui";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/platform/auth-actions";
import { selectBusiness } from "@/lib/platform/business-actions";
import {
  dateLabel,
  initials,
  type Business,
  type Profile,
} from "@/lib/platform/types";

// Presentational screens of the business portal. Pages fetch, these render.

export function ScanView({
  business,
  profile,
}: {
  business: Pick<Business, "name" | "address"> | null;
  profile: Pick<Profile, "full_name" | "phone" | "status">;
}) {
  if (!business)
    return (
      <div className="rp-stack">
        <h1>Tu comercio</h1>
        <Empty
          title={
            profile.status === "suspended"
              ? "Tu cuenta está suspendida"
              : "Falta vincular tu comercio"
          }
        >
          <p>
            {profile.status === "suspended"
              ? "Escríbenos para revisar tu cuenta."
              : "RidePerks te asignará como responsable de tu comercio. Cuando lo haga, podrás validar beneficios aquí."}
          </p>
          <p className="mt-3">
            {profile.full_name} · {profile.phone}
          </p>
        </Empty>
      </div>
    );
  return (
    <div className="rp-stack">
      <div className="rp-heading">
        <div>
          <h1>{business.name}</h1>
          <p className="rp-muted">{business.address}</p>
        </div>
      </div>
      <BusinessScanner />
    </div>
  );
}

export function ActivityView({
  stats,
  period,
  recent,
}: {
  stats: BusinessStats;
  period: string;
  recent: {
    id: string;
    benefit_title: string;
    redeemed_at: string;
    redeemed_via?: string;
  }[];
}) {
  return (
    <div className="rp-stack">
      <h1>Actividad</h1>
      <BusinessMetrics data={stats} period={period} />
      <section>
        <div className="rp-section-head">
          <h2>Últimos usos</h2>
        </div>
        {recent.length ? (
          <div className="rp-list">
            {recent.map((r) => (
              <div className="rp-list-row" key={r.id}>
                <div>
                  <h3>{r.benefit_title}</h3>
                  <p>{dateLabel(r.redeemed_at)}</p>
                </div>
                <span className="rp-badge good">
                  {r.redeemed_via === "pin" ? "Con PIN" : "Confirmado"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="Sin usos todavía">
            <p>Cuando confirmes un beneficio, aparecerá aquí.</p>
          </Empty>
        )}
      </section>
    </div>
  );
}

export function BusinessAccountView({
  profile,
  business,
  isOwner,
  businesses,
  staff,
  pendingChange,
}: {
  profile: Pick<Profile, "full_name">;
  business: Business | null;
  isOwner: boolean;
  businesses: { id: string; name: string }[];
  staff: { user_id: string; full_name: string }[];
  pendingChange: boolean;
}) {
  return (
    <div className="rp-stack">
      <h1>Cuenta</h1>
      <section className="rp-profile-card">
        <div className="rp-avatar large">
          {initials(business?.name || profile.full_name)}
        </div>
        <div>
          <h2>{business?.name || profile.full_name}</h2>
          <p className="rp-muted">{profile.full_name}</p>
          {business && (
            <span className="rp-badge">
              {isOwner ? "Administrador" : "Personal"}
            </span>
          )}
        </div>
      </section>
      {businesses.length > 1 && (
        <form action={selectBusiness} className="rp-form">
          <div className="rp-field">
            <label htmlFor="business_id">Comercio</label>
            <select
              name="business_id"
              id="business_id"
              defaultValue={business?.id}
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="secondary" size="lg">
            Cambiar de comercio
          </Button>
        </form>
      )}
      {business && isOwner && (
        <section className="rp-menu">
          <details>
            <summary>Información del comercio</summary>
            <MerchantInfo business={business} pendingChange={pendingChange} />
          </details>
          <details>
            <summary>Personal autorizado</summary>
            <div className="rp-stack tight">
              <StaffInvite />
              {staff.length > 0 && (
                <div className="rp-list">
                  {staff.map((member) => (
                    <div className="rp-list-row" key={member.user_id}>
                      <span>{member.full_name || "Personal"}</span>
                      <RemoveStaff id={member.user_id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>
        </section>
      )}
      <section>
        <h2 className="rp-menu-title">Ajustes</h2>
        <div className="rp-menu">
          <div className="rp-menu-row">
            <span>Apariencia</span>
            <ThemeSetting />
          </div>
          <MenuLink href="/account/password" label="Contraseña" />
        </div>
      </section>
      <section>
        <h2 className="rp-menu-title">Ayuda</h2>
        <div className="rp-menu">
          <details>
            <summary>Escríbenos</summary>
            <SupportForm audience="business" />
          </details>
          <MenuLink href="/privacidad" label="Privacidad" />
          <MenuLink href="/terminos" label="Términos de uso" />
        </div>
      </section>
      <form action={logout}>
        <input type="hidden" name="audience" value="business" />
        <Button type="submit" variant="secondary" size="lg" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
