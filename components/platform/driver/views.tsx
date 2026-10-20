import Link from "next/link";
import { ArrowUpRight, Phone, Search, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import SavingsCard from "@/components/platform/SavingsCard";
import BenefitCode from "@/components/platform/BenefitCode";
import MapPreview from "@/components/platform/MapPreview";
import { FavoriteButton, FeedbackForm } from "@/components/platform/AppForms";
import { NotificationBell } from "@/components/platform/notifications";
import { ThemeSetting } from "@/components/platform/theme";
import {
  BenefitCard,
  BusinessMark,
  Empty,
  MenuLink,
  SubHeader,
  type CatalogBenefit,
} from "@/components/platform/ui";
import { logout } from "@/lib/platform/auth-actions";
import { dayLabel, dayNames, todayIndex } from "@/lib/platform/hours";
import {
  categories,
  dateLabel,
  initials,
  money,
  platforms,
  statuses,
  type Benefit,
  type Profile,
  type Redemption,
  type WeekHours,
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

function UseRow({ r, rate = false }: { r: Redemption; rate?: boolean }) {
  return (
    <div className="rp-list-row rp-use">
      <div className="rp-use-main">
        <div>
          <h3>{r.benefit_title}</h3>
          <p>
            {r.business_name} · {dateLabel(r.redeemed_at)}
          </p>
        </div>
        <span
          className={"rp-amount" + (r.savings_amount === null ? " plain" : "")}
        >
          {r.savings_amount === null
            ? "Usado"
            : money(Number(r.savings_amount))}
        </span>
      </div>
      {rate && (
        <details className="rp-rate">
          <summary className="rp-text-link">Calificar este uso</summary>
          <FeedbackForm id={r.id} />
        </details>
      )}
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
  unread = 0,
}: {
  profile: Profile;
  monthly: Savings;
  total: Savings;
  history: Redemption[];
  featured: CatalogBenefit[];
  live: boolean;
  hasAccess: boolean;
  unread?: number;
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
        <NotificationBell href="/driver/notifications" unread={unread} />
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

export type CatalogFilter = {
  q: string;
  category: string;
  open: boolean;
  saved: boolean;
};

function filterHref(base: string, f: CatalogFilter, change: Partial<CatalogFilter>) {
  const next = { ...f, ...change };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.open) params.set("open", "1");
  if (next.saved) params.set("saved", "1");
  const query = params.toString();
  return base + (query ? "?" + query : "");
}

// Search box plus filter chips. Plain links and a GET form: works before the
// page's JavaScript arrives.
function CatalogFilters({
  base,
  filter,
  withCategories,
  label,
}: {
  base: string;
  filter: CatalogFilter;
  withCategories: boolean;
  label: string;
}) {
  return (
    <div className="rp-stack tight">
      <form className="rp-search" action={base} role="search">
        <Search aria-hidden="true" />
        <label htmlFor="q" className="sr-only">
          {label}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filter.q}
          placeholder={label}
          maxLength={60}
          enterKeyHint="search"
        />
        {filter.category && (
          <input type="hidden" name="category" value={filter.category} />
        )}
        {filter.open && <input type="hidden" name="open" value="1" />}
        {filter.saved && <input type="hidden" name="saved" value="1" />}
      </form>
      <nav className="rp-category-chips" aria-label="Filtros">
        <Link
          href={filterHref(base, filter, { open: !filter.open })}
          aria-current={filter.open ? "page" : undefined}
        >
          Abierto ahora
        </Link>
        <Link
          href={filterHref(base, filter, { saved: !filter.saved })}
          aria-current={filter.saved ? "page" : undefined}
        >
          Favoritos
        </Link>
        {withCategories &&
          Object.entries(categories).map(([v, l]) => (
            <Link
              key={v}
              aria-current={filter.category === v ? "page" : undefined}
              href={filterHref(base, filter, {
                category: filter.category === v ? "" : v,
              })}
            >
              {l}
            </Link>
          ))}
      </nav>
    </div>
  );
}

function noMatches(base: string, filter: CatalogFilter) {
  const filtered = filter.q || filter.category || filter.open || filter.saved;
  return (
    <Empty
      title={
        filter.saved && !filter.q && !filter.category && !filter.open
          ? "Todavía no tienes favoritos"
          : "No encontramos resultados"
      }
      href={filtered ? base : undefined}
      label="Quitar filtros"
    >
      <p>
        {filter.saved && !filter.q && !filter.category && !filter.open
          ? "Toca el corazón en un beneficio o comercio para guardarlo aquí."
          : "Prueba con otra palabra o quita algún filtro."}
      </p>
    </Empty>
  );
}

export function BenefitsView({
  live,
  benefits,
  filter,
}: {
  live: boolean;
  benefits: CatalogBenefit[];
  filter: CatalogFilter;
}) {
  return (
    <div className="rp-stack">
      <h1>Beneficios</h1>
      <CatalogTabs current="benefits" />
      {live ? (
        <>
          <CatalogFilters
            base="/driver/benefits"
            filter={filter}
            withCategories
            label="Buscar beneficios o comercios"
          />
          {benefits.length ? (
            <div className="rp-grid">
              {benefits.map((b) => (
                <BenefitCard key={b.id} benefit={b} />
              ))}
            </div>
          ) : (
            noMatches("/driver/benefits", filter)
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

export type DirectoryBusiness = {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string | null;
  logo: string | null;
  photos: string[];
  status: string | null;
  saved: boolean;
};

function OpenStatus({ status }: { status: string | null }) {
  if (!status) return null;
  return (
    <span className={"rp-open" + (status.startsWith("Abierto") ? " on" : "")}>
      {status}
    </span>
  );
}

function Photos({ urls, name }: { urls: string[]; name: string }) {
  if (!urls.length) return null;
  return (
    <div className="rp-photos">
      {urls.map((url, i) => (
        // Public catalog photos from Supabase Storage; sizes are already small.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt={name + ", foto " + (i + 1)}
          loading="lazy"
          decoding="async"
        />
      ))}
    </div>
  );
}

export function DirectoryView({
  live,
  businesses,
  filter,
}: {
  live: boolean;
  businesses: DirectoryBusiness[];
  filter: CatalogFilter;
}) {
  return (
    <div className="rp-stack">
      <h1>Beneficios</h1>
      <CatalogTabs current="directory" />
      <MapPreview />
      {live && (
        <CatalogFilters
          base="/driver/directory"
          filter={filter}
          withCategories={false}
          label="Buscar comercios"
        />
      )}
      {!live ? (
        comingSoon
      ) : businesses.length ? (
        <div className="rp-grid">
          {businesses.map((b) => (
            <article className="rp-panel rp-stack tight" key={b.id}>
              <div className="rp-hello">
                <BusinessMark category={b.category} logo={b.logo} />
                <div>
                  <h2>{b.name}</h2>
                  <p className="rp-muted">{b.address}</p>
                  <OpenStatus status={b.status} />
                </div>
                <FavoriteButton
                  kind="business"
                  id={b.id}
                  saved={b.saved}
                  name={b.name}
                />
              </div>
              {b.description && <p className="rp-muted">{b.description}</p>}
              <Photos urls={b.photos} name={b.name} />
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
        noMatches("/driver/directory", filter)
      )}
    </div>
  );
}

function WeekList({ hours }: { hours: WeekHours }) {
  const today = todayIndex();
  return (
    <dl className="rp-week">
      {[1, 2, 3, 4, 5, 6, 0].map((day) => (
        <div key={day} className={day === today ? "today" : undefined}>
          <dt>{dayNames[day]}</dt>
          <dd>{dayLabel(hours[day])}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BenefitDetailView({
  benefit: b,
  verified,
  saved,
  logo,
  photos,
  hours,
  status,
}: {
  benefit: Benefit;
  verified: boolean;
  saved: boolean;
  logo: string | null;
  photos: string[];
  hours: WeekHours | null;
  status: string | null;
}) {
  return (
    <div className="rp-stack">
      <SubHeader
        back="/driver/benefits"
        backLabel="Volver a beneficios"
        title={b.rp_businesses.name}
        action={
          <FavoriteButton
            kind="benefit"
            id={b.id}
            saved={saved}
            name={b.title}
          />
        }
      />
      <section className="rp-detail-hero">
        <BusinessMark category={b.category} logo={logo} />
        <h2 className="rp-title">{b.discount_label}</h2>
        <p className="rp-muted">
          {b.title} · {b.rp_businesses.name}
        </p>
        <OpenStatus status={status} />
      </section>
      <BenefitCode benefitId={b.id} verified={verified} />
      {b.description && <p>{b.description}</p>}
      <Photos urls={photos} name={b.rp_businesses.name} />
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
        {hours && (
          <details>
            <summary>
              <span>Horario</span>
              <span className="rp-menu-value">
                {dayLabel(hours[todayIndex()])}
              </span>
            </summary>
            <WeekList hours={hours} />
          </details>
        )}
        <a
          href={mapsLink(b.rp_businesses.name, b.rp_businesses.address)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Cómo llegar</span>
          <span className="rp-menu-value">{b.rp_businesses.address}</span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
        {b.rp_businesses.phone && (
          <a href={"tel:" + b.rp_businesses.phone.replace(/[^+0-9]/g, "")}>
            <span>Llamar</span>
            <span className="rp-menu-value">{b.rp_businesses.phone}</span>
            <Phone size={18} aria-hidden="true" />
          </a>
        )}
      </section>
    </div>
  );
}

/** Uses from the last 30 days can be rated once. */
function canRate(r: Redemption, now: number) {
  return (
    r.rated === false &&
    now - new Date(r.redeemed_at).getTime() < 30 * 86400000
  );
}

export function HistoryView({
  rows,
  now,
}: {
  rows: Redemption[];
  /** Render time, passed in so the view stays pure. */
  now: number;
}) {
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
              <UseRow key={r.id} r={r} rate={canRate(r, now)} />
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
  unread = 0,
}: {
  profile: Profile;
  membership: string;
  unread?: number;
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
        <MenuLink
          href="/driver/notifications"
          label="Notificaciones"
          value={unread ? unread + (unread === 1 ? " nueva" : " nuevas") : undefined}
        />
        <MenuLink
          href="/driver/benefits?saved=1"
          label="Favoritos"
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
      <Link href="/account/delete" className="rp-text-link rp-danger-link">
        <Trash2 size={16} aria-hidden="true" /> Eliminar mi cuenta
      </Link>
    </div>
  );
}
