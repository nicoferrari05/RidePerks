import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import SavingsCard from "@/components/platform/SavingsCard";
import BenefitCode from "@/components/platform/BenefitCode";
import { ThemeSetting } from "@/components/platform/theme";
import {
  BenefitCard,
  CategoryIcon,
  Empty,
  MenuLink,
  SubHeader,
  type CatalogBenefit,
} from "@/components/platform/ui";
import { logout } from "@/lib/platform/auth-actions";
import {
  categories,
  dateLabel,
  initials,
  money,
  platforms,
  statuses,
  type Benefit,
  type Business,
  type Profile,
  type Redemption,
} from "@/lib/platform/types";

// Presentational screens for the driver side. Pages fetch, these render, so
// the same markup can be previewed with sample data.

type Savings = { total: number; count: number };

const comingSoon = (
  <Empty title="Próximamente">
    <p>
      Estamos cerrando los últimos detalles con los comercios aliados. Muy
      pronto vas a encontrar aquí descuentos en combustible, comida y taller.
    </p>
  </Empty>
);

function UseRow({ r }: { r: Redemption }) {
  return (
    <div className="rp-list-row">
      <div>
        <h3>{r.benefit_title}</h3>
        <p>
          {r.business_name} · {dateLabel(r.redeemed_at)}
        </p>
      </div>
      <span className="rp-amount">
        {r.savings_amount === null ? "Usado" : money(Number(r.savings_amount))}
      </span>
    </div>
  );
}

// Only the most urgent step shows, with a single action.
function NextStep({
  profile: p,
  hasAccess,
}: {
  profile: Profile;
  hasAccess: boolean;
}) {
  const step =
    p.status === "suspended"
      ? {
          title: "Tu cuenta necesita atención",
          text: "Escríbenos para revisar el estado de tu cuenta.",
          href: "/driver/help",
          label: "Obtener ayuda",
        }
      : p.status !== "verified"
        ? {
            title: "Verifica tu cuenta",
            text: "Sube una captura de tu perfil de conductor para empezar a usar beneficios.",
            href: "/driver/verify",
            label: "Verificar ahora",
          }
        : !hasAccess
          ? {
              title: "Activa tu membresía",
              text: "$15 al mes, con Yappy. Sin cargos automáticos.",
              href: "/driver/membership",
              label: "Activar",
            }
          : null;
  if (!step) return null;
  return (
    <section className="rp-callout">
      <h2>{step.title}</h2>
      <p>{step.text}</p>
      <Link
        href={step.href}
        className={buttonVariants({ variant: "default", size: "lg" })}
      >
        {step.label}
      </Link>
    </section>
  );
}

export function DashboardView({
  profile: p,
  monthly,
  total,
  history,
  featured,
  live,
  hasAccess,
}: {
  profile: Profile;
  monthly: Savings;
  total: Savings;
  history: Redemption[];
  featured: CatalogBenefit[];
  live: boolean;
  hasAccess: boolean;
}) {
  return (
    <div className="rp-stack">
      <header className="rp-hello">
        <Link
          href="/driver/profile"
          className="rp-avatar"
          aria-label="Tu cuenta"
        >
          {initials(p.full_name)}
        </Link>
        <div>
          <h1>Hola, {p.full_name.split(" ")[0] || "conductor"}</h1>
          <span>
            {new Intl.DateTimeFormat("es-PA", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "America/Panama",
            }).format(new Date())}
          </span>
        </div>
      </header>
      <NextStep profile={p} hasAccess={hasAccess} />
      <SavingsCard monthly={monthly} total={total} />
      <section>
        <div className="rp-section-head">
          <h2>Para tu próxima parada</h2>
          {live && featured.length > 0 && (
            <Link className="rp-text-link" href="/driver/benefits">
              Ver todos
            </Link>
          )}
        </div>
        {live && featured.length ? (
          <div className="rp-rail">
            {featured.map((b) => (
              <BenefitCard key={b.id} benefit={b} />
            ))}
          </div>
        ) : (
          comingSoon
        )}
      </section>
      <section>
        <div className="rp-section-head">
          <h2>Últimos usos</h2>
          {history.length > 0 && (
            <Link className="rp-text-link" href="/driver/history">
              Ver todo
            </Link>
          )}
        </div>
        {history.length ? (
          <div className="rp-list">
            {history.slice(0, 3).map((r) => (
              <UseRow key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <Empty title="Tu primer ahorro está por venir">
            <p>Cuando un comercio confirme tu código, aparecerá aquí.</p>
          </Empty>
        )}
      </section>
    </div>
  );
}

function CatalogTabs({ current }: { current: "benefits" | "directory" }) {
  return (
    <nav className="rp-segmented" aria-label="Catálogo">
      <Link
        href="/driver/benefits"
        aria-current={current === "benefits" ? "page" : undefined}
      >
        Beneficios
      </Link>
      <Link
        href="/driver/directory"
        aria-current={current === "directory" ? "page" : undefined}
      >
        Comercios
      </Link>
    </nav>
  );
}

export function BenefitsView({
  live,
  benefits,
  selected,
}: {
  live: boolean;
  benefits: CatalogBenefit[];
  selected: string;
}) {
  const visible = selected
    ? benefits.filter((b) => b.category === selected)
    : benefits;
  return (
    <div className="rp-stack">
      <h1>Beneficios</h1>
      <CatalogTabs current="benefits" />
      {live ? (
        <>
          <nav className="rp-category-chips" aria-label="Categoría">
            {[["", "Todos"], ...Object.entries(categories)].map(([v, l]) => (
              <Link
                key={v || "all"}
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
            <Empty title="Nada en esta categoría todavía">
              <p>Seguimos sumando comercios aliados.</p>
            </Empty>
          )}
        </>
      ) : (
        comingSoon
      )}
    </div>
  );
}

function mapsLink(name: string, address: string) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(name + " " + address + " Panamá")
  );
}

export function DirectoryView({
  live,
  businesses,
}: {
  live: boolean;
  businesses: Pick<
    Business,
    "id" | "name" | "description" | "category" | "address" | "phone"
  >[];
}) {
  return (
    <div className="rp-stack">
      <h1>Beneficios</h1>
      <CatalogTabs current="directory" />
      {live && businesses.length ? (
        <div className="rp-grid">
          {businesses.map((b) => (
            <article className="rp-panel rp-stack tight" key={b.id}>
              <div className="rp-hello">
                <CategoryIcon category={b.category} />
                <div>
                  <h2>{b.name}</h2>
                  <p className="rp-muted">{b.address}</p>
                </div>
              </div>
              {b.description && <p className="rp-muted">{b.description}</p>}
              <div className="rp-actions">
                <a
                  className={buttonVariants({ variant: "white", size: "md" })}
                  href={mapsLink(b.name, b.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cómo llegar <ArrowUpRight aria-hidden="true" />
                </a>
                {b.phone && (
                  <a
                    className={buttonVariants({ variant: "white", size: "md" })}
                    href={"tel:" + b.phone.replace(/[^+0-9]/g, "")}
                  >
                    <Phone aria-hidden="true" /> Llamar
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        comingSoon
      )}
    </div>
  );
}

export function BenefitDetailView({
  benefit: b,
  verified,
}: {
  benefit: Benefit;
  verified: boolean;
}) {
  return (
    <div className="rp-stack">
      <SubHeader
        back="/driver/benefits"
        backLabel="Volver a beneficios"
        title={b.rp_businesses.name}
      />
      <section className="rp-detail-hero">
        <CategoryIcon category={b.category} />
        <h2 className="rp-title">{b.discount_label}</h2>
        <p className="rp-muted">
          {b.title} · {b.rp_businesses.name}
        </p>
      </section>
      <BenefitCode benefitId={b.id} verified={verified} />
      {b.description && <p>{b.description}</p>}
      <section className="rp-panel rp-stack tight">
        <h2>Condiciones</h2>
        <p className="rp-muted whitespace-pre-line">{b.terms}</p>
        <p className="rp-muted">
          {b.monthly_limit
            ? b.monthly_limit + " usos por conductor al mes."
            : "Sin límite mensual de usos."}
          {b.valid_until &&
            " Disponible hasta el " +
              b.valid_until.split("-").reverse().join("/") +
              "."}
        </p>
      </section>
      <section className="rp-menu">
        <a
          href={mapsLink(b.rp_businesses.name, b.rp_businesses.address)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Cómo llegar</span>
          <span className="rp-menu-value">{b.rp_businesses.address}</span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}

export function HistoryView({ rows }: { rows: Redemption[] }) {
  const sum = rows.reduce((s, r) => s + Number(r.savings_amount || 0), 0);
  return (
    <div className="rp-stack">
      <h1>Actividad</h1>
      {rows.length ? (
        <>
          <section className="rp-stat">
            <span className="rp-muted">Ahorro registrado</span>
            <strong>{money(sum)}</strong>
            <span className="rp-muted">
              En {rows.length} {rows.length === 1 ? "uso" : "usos"}. Los
              descuentos sin monto fijo no suman al total.
            </span>
          </section>
          <div className="rp-list">
            {rows.map((r) => (
              <UseRow key={r.id} r={r} />
            ))}
          </div>
          {rows.length === 500 && (
            <p className="rp-muted">Se muestran los últimos 500 usos.</p>
          )}
        </>
      ) : (
        <Empty
          title="Todavía no tienes usos"
          href="/driver/benefits"
          label="Explorar beneficios"
        >
          <p>
            Genera un código desde un beneficio y muéstralo en el comercio. Tu
            ahorro aparecerá aquí cuando lo confirmen.
          </p>
        </Empty>
      )}
    </div>
  );
}

export function AccountView({
  profile: p,
  membership,
}: {
  profile: Profile;
  membership: string;
}) {
  return (
    <div className="rp-stack">
      <h1>Cuenta</h1>
      <section className="rp-profile-card">
        <div className="rp-avatar large">{initials(p.full_name)}</div>
        <div>
          <h2>{p.full_name || "Tu cuenta"}</h2>
          <p className="rp-muted">
            {platforms[p.platform || ""] || "Conductor RidePerks"}
          </p>
          <span
            className={
              "rp-badge " + (p.status === "verified" ? "good" : "pending")
            }
          >
            {statuses[p.status]}
          </span>
        </div>
      </section>
      <section className="rp-menu">
        <MenuLink href="/driver/profile/edit" label="Datos personales" />
        <MenuLink
          href="/driver/membership"
          label="Membresía"
          value={membership}
        />
        <MenuLink
          href="/driver/verify"
          label="Verificación"
          value={p.status === "verified" ? "Verificada" : "Pendiente"}
        />
      </section>
      <section>
        <h2 className="rp-menu-title">Ajustes</h2>
        <div className="rp-menu">
          <div className="rp-menu-row">
            <span>Apariencia</span>
            <ThemeSetting />
          </div>
          <MenuLink href="/driver/password" label="Contraseña" />
        </div>
      </section>
      <section>
        <h2 className="rp-menu-title">Ayuda</h2>
        <div className="rp-menu">
          <MenuLink href="/driver/help" label="Ayuda y soporte" />
          <MenuLink href="/privacidad" label="Privacidad" />
          <MenuLink href="/terminos" label="Términos de uso" />
        </div>
      </section>
      <form action={logout}>
        <Button type="submit" variant="secondary" size="lg" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
