import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { ResolveSupport } from "@/components/platform/SupportForm";
import { Empty } from "@/components/platform/ui";
import {
  BusinessForm,
  BenefitForm,
  ToggleForm,
  ReviewForm,
  DriverStatusForm,
  CloseProfileForm,
  BusinessPinForm,
} from "@/components/platform/AdminForms";
import {
  type Business,
  type Benefit,
  type Profile,
  statuses,
  dateLabel,
  platforms,
} from "@/lib/platform/types";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

// Admin → Plataforma. Presentational: app/admin/platform/page.tsx loads the
// data. The tiles at the top are the navigation and show what needs work.

export const PLATFORM_TABS = [
  "verifications",
  "support",
  "drivers",
  "businesses",
  "benefits",
] as const;
export type PlatformTab = (typeof PLATFORM_TABS)[number];

const TAB_META: Record<
  PlatformTab,
  { label: string; hint: string; attention?: boolean }
> = {
  verifications: { label: "Verificaciones", hint: "por revisar", attention: true },
  support: { label: "Ayuda", hint: "abiertas", attention: true },
  drivers: { label: "Cuentas", hint: "registradas" },
  businesses: { label: "Comercios", hint: "registrados" },
  benefits: { label: "Beneficios", hint: "en total" },
};

export type VerificationRow = {
  id: string;
  name: string;
  phone: string | null;
  platform: string;
  created_at: string;
  url?: string;
};
export type SupportRow = {
  id: string;
  topic: string;
  message: string;
  driver_id: string;
  created_at: string;
  contact?: { full_name: string; phone: string | null };
};
type AccountOption = {
  id: string;
  full_name: string;
  phone: string;
  role: string;
};

const TOPICS: Record<string, string> = {
  benefit: "Beneficio",
  account: "Cuenta",
  privacy: "Datos personales",
  delete: "Solicitud de eliminación",
};

function whatsapp(phone: string | null | undefined, text: string) {
  return phone
    ? "https://wa.me/" +
        phone.replace(/\D/g, "") +
        "?text=" +
        encodeURIComponent(text)
    : null;
}

export function AdminPlatformView({
  tab,
  counts,
  page,
  total,
  search,
  businesses = [],
  benefits = [],
  drivers = [],
  support = [],
  verifications = [],
  edit,
  accounts = [],
  shops = [],
}: {
  tab: PlatformTab;
  counts: Record<PlatformTab, number>;
  page: number;
  /** Rows in the current tab (for paging). */
  total: number;
  search: string;
  businesses?: Business[];
  benefits?: Benefit[];
  drivers?: Profile[];
  support?: SupportRow[];
  verifications?: VerificationRow[];
  edit?: Business | Benefit;
  accounts?: AccountOption[];
  shops?: Pick<Business, "id" | "name">[];
}) {
  const meta = TAB_META[tab];
  const editable = tab === "businesses" || tab === "benefits";
  const noun = tab === "businesses" ? "comercio" : "beneficio";
  const empty =
    (tab === "businesses" && !businesses.length) ||
    (tab === "benefits" && !benefits.length) ||
    (tab === "drivers" && !drivers.length) ||
    (tab === "support" && !support.length) ||
    (tab === "verifications" && !verifications.length);
  return (
    <>
      <header className="rp-admin-head">
        <h1>Plataforma</h1>
        <p className="rp-muted">
          Lo pendiente primero. Toca un recuadro para ver su lista.
        </p>
      </header>

      <nav className="rp-admin-tiles" aria-label="Secciones de la plataforma">
        {PLATFORM_TABS.map((t) => {
          const m = TAB_META[t];
          const alert = m.attention && counts[t] > 0;
          return (
            <Link
              key={t}
              href={"/admin/platform?tab=" + t}
              aria-current={tab === t ? "page" : undefined}
              data-alert={alert ? "" : undefined}
              className="rp-admin-tile"
            >
              <span className="rp-admin-tile-label">
                {alert && <i aria-hidden="true" />}
                {m.label}
              </span>
              <strong>{counts[t]}</strong>
              <span className="rp-admin-tile-hint">{m.hint}</span>
            </Link>
          );
        })}
      </nav>

      <div className={editable ? "rp-admin-grid" : "rp-stack"}>
        <section className="rp-stack tight" aria-labelledby="list-title">
          <div className="rp-admin-section-head">
            <h2 id="list-title">
              {meta.label}
              <span className="rp-muted"> · {total}</span>
            </h2>
            {editable && (
              <a
                href="#editor"
                className={buttonVariants({ variant: "default", size: "md" })}
              >
                <Plus size={16} aria-hidden="true" />
                Agregar {noun}
              </a>
            )}
          </div>

          {tab === "drivers" && (
            <form className="rp-admin-search" role="search">
              <input type="hidden" name="tab" value="drivers" />
              <Search size={18} aria-hidden="true" />
              <label htmlFor="q" className="sr-only">
                Buscar por nombre o ID de cuenta
              </label>
              <input
                name="q"
                id="q"
                defaultValue={search}
                maxLength={100}
                placeholder="Buscar por nombre o ID de cuenta"
              />
              <Button type="submit" size="sm" variant="secondary">
                Buscar
              </Button>
            </form>
          )}

          {tab === "verifications" && (
            <details className="rp-admin-help">
              <summary>
                Cómo revisar una verificación
              </summary>
              <ol className="rp-steps">
                <li>
                  Abre la captura y comprueba que corresponde al perfil de una
                  app de conductores.
                </li>
                <li>
                  Compara el nombre y la plataforma con la cuenta registrada.
                </li>
                <li>
                  Aprueba la solicitud o pide una corrección con un mensaje
                  claro.
                </li>
              </ol>
              <p className="rp-muted">
                Subir una imagen no aprueba la cuenta. Solo después de tu
                aprobación podrá generar códigos de beneficio.
              </p>
            </details>
          )}

          {empty && (
            <Empty
              title={
                tab === "verifications"
                  ? "Sin verificaciones pendientes"
                  : tab === "support"
                    ? "Sin solicitudes de ayuda abiertas"
                    : search
                      ? "Sin resultados"
                      : "Todavía no hay registros"
              }
            >
              <p>
                {tab === "verifications"
                  ? "Las nuevas solicitudes de conductores aparecerán aquí."
                  : tab === "support"
                    ? "Las solicitudes nuevas aparecerán aquí."
                    : search
                      ? "Prueba con otro nombre o pega el ID completo."
                      : "Agrega la información confirmada para publicarla en la plataforma."}
              </p>
            </Empty>
          )}

          {tab === "verifications" &&
            verifications.map((v) => {
              const chat = whatsapp(
                v.phone,
                "Hola " +
                  v.name.split(" ")[0] +
                  ", te escribimos de RidePerks sobre la verificación de tu cuenta.",
              );
              return (
                <article className="rp-admin-card" key={v.id}>
                  <div className="rp-admin-card-head">
                    <div>
                      <h3>{v.name}</h3>
                      <p>
                        {v.platform} · Enviada el {dateLabel(v.created_at)}
                      </p>
                    </div>
                    <span className="rp-badge pending">Por revisar</span>
                  </div>
                  {v.url ? (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rp-verification-link"
                    >
                      {/* Private signed URL: never through the public image optimizer. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.url}
                        alt={"Captura del perfil de " + v.name}
                        className="rp-verification-preview"
                      />
                      <span className="rp-text-link">
                        Abrir imagen (enlace válido 5 min) ↗
                      </span>
                    </a>
                  ) : (
                    <p className="rp-error">
                      No pudimos abrir la imagen. Recarga la página antes de
                      revisar.
                    </p>
                  )}
                  {chat && (
                    <a
                      className="rp-text-link"
                      href={chat}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contactar por WhatsApp ↗
                    </a>
                  )}
                  {v.url && <ReviewForm id={v.id} />}
                </article>
              );
            })}

          {tab === "support" &&
            support.map((r) => {
              const chat = whatsapp(
                r.contact?.phone,
                "Hola " +
                  (r.contact?.full_name.split(" ")[0] || "") +
                  ", te escribimos de RidePerks sobre tu solicitud de ayuda.",
              );
              return (
                <article className="rp-admin-card" key={r.id}>
                  <div className="rp-admin-card-head">
                    <div>
                      <h3>{r.contact?.full_name || "Cuenta sin nombre"}</h3>
                      <p>
                        {r.contact?.phone ? r.contact.phone + " · " : ""}
                        {dateLabel(r.created_at)}
                      </p>
                    </div>
                    <span className="rp-badge">
                      {TOPICS[r.topic] || r.topic}
                    </span>
                  </div>
                  <p className="rp-admin-message">{r.message}</p>
                  <div className="rp-actions">
                    {chat && (
                      <a
                        className="rp-text-link"
                        href={chat}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Escribir por WhatsApp ↗
                      </a>
                    )}
                    <Link
                      className="rp-text-link"
                      href={"/admin/platform?tab=drivers&q=" + r.driver_id}
                    >
                      Ver cuenta
                    </Link>
                  </div>
                  <p className="rp-muted">
                    Resolver esta solicitud no elimina datos automáticamente.
                  </p>
                  <ResolveSupport id={r.id} />
                </article>
              );
            })}

          {tab === "drivers" && drivers.length > 0 && (
            <div className="rp-admin-rows">
              {drivers.map((p) => (
                <article className="rp-admin-row" key={p.id}>
                  <div className="rp-admin-row-main">
                    <div>
                      <h3>{p.full_name || "Cuenta sin nombre"}</h3>
                      <p>
                        {[
                          p.phone,
                          p.platform
                            ? platforms[p.platform] || p.platform
                            : null,
                          "Desde " + dateLabel(p.created_at),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span
                      className={
                        "rp-badge " +
                        (p.closed_at || p.role === "business"
                          ? ""
                          : p.status === "verified"
                            ? "good"
                            : p.status === "pending"
                              ? "pending"
                              : "")
                      }
                    >
                      {p.closed_at
                        ? "Cerrada"
                        : p.role === "business"
                          ? "Comercio"
                          : statuses[p.status]}
                    </span>
                  </div>
                  {!p.closed_at && (
                    <details className="rp-admin-more">
                      <summary>
                        Acciones
                      </summary>
                      <div className="rp-stack tight">
                        <p className="rp-muted rp-admin-id">ID: {p.id}</p>
                        {p.role === "driver" && (
                          <>
                            <Link
                              className="rp-text-link"
                              href={"/admin/access?driver=" + p.id}
                            >
                              Administrar membresía y acceso →
                            </Link>
                            <DriverStatusForm
                              id={p.id}
                              suspended={p.status === "suspended"}
                            />
                          </>
                        )}
                        <CloseProfileForm id={p.id} />
                      </div>
                    </details>
                  )}
                </article>
              ))}
            </div>
          )}

          {tab === "businesses" && businesses.length > 0 && (
            <div className="rp-admin-rows">
              {businesses.map((b) => (
                <article
                  className="rp-admin-row"
                  key={b.id}
                  data-editing={edit?.id === b.id ? "" : undefined}
                >
                  <div className="rp-admin-row-main">
                    <div>
                      <h3>{b.name}</h3>
                      <p>{b.address}</p>
                    </div>
                    <span className={"rp-badge " + (b.is_active ? "good" : "")}>
                      {b.is_active ? "Activo" : "Pausado"}
                    </span>
                  </div>
                  <ul className="rp-admin-facts">
                    <li data-ok={b.owner_user_id ? "" : undefined}>
                      {b.owner_user_id ? "Cuenta vinculada" : "Sin cuenta vinculada"}
                    </li>
                    <li data-ok={b.pin_set_at ? "" : undefined}>
                      {b.pin_set_at ? "PIN configurado" : "Sin PIN"}
                    </li>
                  </ul>
                  <div className="rp-actions">
                    <Link
                      className="rp-text-link"
                      href={
                        "/admin/platform?tab=businesses&edit=" + b.id + "#editor"
                      }
                    >
                      Editar
                    </Link>
                    <ToggleForm
                      table="rp_businesses"
                      id={b.id}
                      active={b.is_active}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === "benefits" && benefits.length > 0 && (
            <div className="rp-admin-rows">
              {benefits.map((b) => (
                <article
                  className="rp-admin-row"
                  key={b.id}
                  data-editing={edit?.id === b.id ? "" : undefined}
                >
                  <div className="rp-admin-row-main">
                    <div>
                      <h3>{b.title}</h3>
                      <p>
                        {b.discount_label}
                        {shops.find((s) => s.id === b.business_id)
                          ? " · " +
                            shops.find((s) => s.id === b.business_id)!.name
                          : ""}
                      </p>
                    </div>
                    <span className={"rp-badge " + (b.is_active ? "good" : "")}>
                      {b.is_active ? "Publicado" : "Pausado"}
                    </span>
                  </div>
                  <div className="rp-actions">
                    <Link
                      className="rp-text-link"
                      href={"/admin/platform?tab=benefits&edit=" + b.id + "#editor"}
                    >
                      Editar
                    </Link>
                    <ToggleForm
                      table="rp_benefits"
                      id={b.id}
                      active={b.is_active}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}

          {(page > 0 || total > (page + 1) * 50) && (
            <div className="rp-actions">
              {page > 0 && (
                <Link
                  className={buttonVariants({ variant: "secondary", size: "md" })}
                  href={
                    "/admin/platform?tab=" +
                    tab +
                    "&page=" +
                    (page - 1) +
                    (search ? "&q=" + encodeURIComponent(search) : "")
                  }
                >
                  Anterior
                </Link>
              )}
              {total > (page + 1) * 50 && (
                <Link
                  className={buttonVariants({ variant: "secondary", size: "md" })}
                  href={
                    "/admin/platform?tab=" +
                    tab +
                    "&page=" +
                    (page + 1) +
                    (search ? "&q=" + encodeURIComponent(search) : "")
                  }
                >
                  Siguiente
                </Link>
              )}
            </div>
          )}
        </section>

        {editable && (
          <aside
            id="editor"
            className="rp-panel rp-admin-editor"
            data-editing={edit ? "" : undefined}
          >
            <div className="rp-admin-section-head">
              <h2>
                {edit ? "Editar" : "Agregar"} {noun}
              </h2>
              {edit && (
                <Link className="rp-text-link" href={"/admin/platform?tab=" + tab}>
                  Cancelar
                </Link>
              )}
            </div>
            {tab === "businesses" ? (
              <>
                <BusinessForm
                  key={edit?.id || "new"}
                  business={edit as Business | undefined}
                  accounts={accounts}
                />
                {edit ? (
                  <div className="mt-8">
                    <BusinessPinForm
                      key={edit.id}
                      id={edit.id}
                      pinSetAt={(edit as Business).pin_set_at || null}
                    />
                  </div>
                ) : (
                  <p className="rp-muted mt-6">
                    Guarda el comercio y ábrelo con «Editar» para asignarle un
                    PIN de escaneo.
                  </p>
                )}
              </>
            ) : (
              <BenefitForm
                key={edit?.id || "new"}
                businesses={shops}
                benefit={edit as Benefit | undefined}
              />
            )}
          </aside>
        )}
      </div>
    </>
  );
}
