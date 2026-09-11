import { ResolveSupport } from "@/components/platform/SupportForm";
import Link from "next/link";
import { requireAdmin } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Logo, Heading, Empty } from "@/components/platform/ui";
import {
  BusinessForm,
  BenefitForm,
  ToggleForm,
  ReviewForm,
  DriverStatusForm,
  CloseProfileForm,
} from "@/components/platform/AdminForms";
import {
  type Business,
  type Benefit,
  type Profile,
  type Verification,
  statuses,
  dateLabel,
  platforms,
} from "@/lib/platform/types";
import "../../platform.css";
export const metadata = {
  title: "Administrar plataforma · RidePerks",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    edit?: string;
    page?: string;
    q?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const tab = [
    "benefits",
    "businesses",
    "drivers",
    "verifications",
    "support",
  ].includes(params.tab || "")
    ? params.tab!
    : "verifications";
  const page = Math.max(
    0,
    Math.min(10000, Number.parseInt(params.page || "0") || 0),
  );
  const db = getSupabaseAdmin();
  const table =
    tab === "benefits"
      ? "rp_benefits"
      : tab === "businesses"
        ? "rp_businesses"
        : tab === "drivers"
          ? "rp_profiles"
          : tab === "support"
            ? "rp_support_requests"
            : "rp_verifications";
  let query = db
    .from(table)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * 50, page * 50 + 49);
  if (tab === "verifications") query = query.eq("status", "pending");
  if (tab === "support") query = query.eq("status", "open");
  const search = (params.q || "").trim().slice(0, 100);
  if (tab === "drivers" && search)
    query = /^[0-9a-f-]{36}$/i.test(search)
      ? query.eq("id", search)
      : query.ilike("full_name", "%" + search + "%");
  const result = await query;
  if (result.error)
    throw new Error(
      "No pudimos cargar la plataforma. Comprueba la migración de Supabase.",
    );
  const shops = await db
    .from("rp_businesses")
    .select("id,name")
    .order("name")
    .limit(500);
  if (shops.error) throw new Error("No pudimos cargar los comercios.");
  let edit: Business | Benefit | undefined;
  if (
    params.edit &&
    /^[0-9a-f-]{36}$/i.test(params.edit) &&
    (tab === "benefits" || tab === "businesses")
  ) {
    const row = await db
      .from(table)
      .select("*")
      .eq("id", params.edit)
      .maybeSingle();
    if (row.error) throw new Error("No pudimos cargar el registro.");
    edit = row.data || undefined;
  }
  let accountOptions: {
    id: string;
    full_name: string;
    phone: string;
    role: string;
  }[] = [];
  if (tab === "businesses") {
    const accounts = await db
      .from("rp_profiles")
      .select("id,full_name,phone,role")
      .order("full_name")
      .limit(500);
    if (accounts.error)
      throw new Error("No pudimos cargar las cuentas responsables.");
    accountOptions = accounts.data || [];
    const owner = (edit as Business | undefined)?.owner_user_id;
    if (owner && !accountOptions.some((account) => account.id === owner)) {
      const current = await db
        .from("rp_profiles")
        .select("id,full_name,phone,role")
        .eq("id", owner)
        .maybeSingle();
      if (current.data) accountOptions.push(current.data);
    }
  }
  const rows = result.data || [];
  const verificationRows =
    tab === "verifications"
      ? await Promise.all(
          (rows as Verification[]).map(async (v) => {
            const [signed, p] = await Promise.all([
              db.storage
                .from("rp-verifications")
                .createSignedUrl(v.photo_path, 300),
              db
                .from("rp_profiles")
                .select("full_name,platform")
                .eq("id", v.driver_id)
                .single(),
            ]);
            return {
              ...v,
              name: p.data?.full_name || "Conductor",
              platform: p.data?.platform
                ? platforms[p.data.platform as keyof typeof platforms]
                : "Plataforma no indicada",
              url: signed.data?.signedUrl,
            };
          }),
        )
      : [];
  return (
    <div className="rp-app">
      <header className="rp-page-header">
        <Logo />
        <Link className="rp-text-link" href="/admin">
          Lista de espera →
        </Link>
      </header>
      <main className="rp-main rp-stack">
        <Heading title="Tu plataforma, al día">
          Gestiona los aliados, beneficios y verificaciones de RidePerks.
        </Heading>
        <Link className="rp-text-link" href="/admin/payments">
          Pagos de membresías →
        </Link>
        <div className="rp-actions">
          <Link className="rp-text-link" href="/admin/reviews">
            Revisar propuestas de beneficios →
          </Link>
          <Link className="rp-text-link" href="/admin/access">
            Identidad administrativa →
          </Link>
        </div>
        {tab === "drivers" && (
          <form className="rp-filters">
            <input type="hidden" name="tab" value="drivers" />
            <div className="rp-field">
              <label htmlFor="q">Buscar por nombre o ID de cuenta</label>
              <input name="q" id="q" defaultValue={search} maxLength={100} />
            </div>
            <button className="rp-button dark">Buscar cuenta</button>
          </form>
        )}
        <nav className="rp-subnav" aria-label="Administración">
          {[
            ["verifications", "Verificaciones"],
            ["drivers", "Cuentas"],
            ["businesses", "Comercios"],
            ["benefits", "Beneficios"],
            ["support", "Ayuda"],
          ].map(([v, l]) => (
            <Link
              key={v}
              href={"/admin/platform?tab=" + v}
              aria-current={tab === v ? "page" : undefined}
            >
              {l}
            </Link>
          ))}
        </nav>
        {tab === "verifications" && (
          <section className="rp-panel">
            <h2>Verificación manual de conductores</h2>
            <ol className="rp-steps">
              <li>
                Abre la captura y comprueba que corresponde al perfil de una app
                de conductores.
              </li>
              <li>
                Compara el nombre y la plataforma con la cuenta registrada.
              </li>
              <li>
                Aprueba la solicitud o pide una corrección con un mensaje claro.
              </li>
            </ol>
            <p className="rp-muted">
              Subir una imagen no aprueba la cuenta automáticamente. Solo
              después de tu aprobación podrá generar códigos de beneficio.
            </p>
          </section>
        )}
        <div
          className={
            tab === "benefits" || tab === "businesses"
              ? "rp-admin-grid"
              : "rp-stack"
          }
        >
          <section className="rp-stack">
            {!rows.length && (
              <Empty
                title={
                  tab === "verifications"
                    ? "Sin verificaciones pendientes"
                    : "Todavía no hay registros"
                }
              >
                <p>
                  {tab === "verifications"
                    ? "Las nuevas solicitudes de conductores aparecerán aquí."
                    : "Agrega la información confirmada para publicarla en la plataforma."}
                </p>
              </Empty>
            )}
            {tab === "businesses" &&
              (rows as Business[]).map((b) => (
                <article className="rp-panel" key={b.id}>
                  <h2>{b.name}</h2>
                  <p className="rp-muted mt-2">{b.address}</p>
                  <p className="rp-muted">
                    {b.owner_user_id
                      ? "Cuenta del comercio vinculada"
                      : "Falta vincular la cuenta del comercio"}
                  </p>
                  <div className="rp-actions mt-4">
                    <Link
                      className="rp-text-link"
                      href={"/admin/platform?tab=businesses&edit=" + b.id}
                    >
                      Editar comercio
                    </Link>
                    <ToggleForm
                      table="rp_businesses"
                      id={b.id}
                      active={b.is_active}
                    />
                  </div>
                </article>
              ))}
            {tab === "benefits" &&
              (rows as Benefit[]).map((b) => (
                <article className="rp-panel" key={b.id}>
                  <h2>{b.title}</h2>
                  <p className="rp-muted mt-2">{b.discount_label}</p>
                  <span
                    className={"rp-badge " + (b.is_active ? "good" : "pending")}
                  >
                    {b.is_active ? "Publicado" : "Pausado"}
                  </span>
                  <div className="rp-actions mt-4">
                    <Link
                      className="rp-text-link"
                      href={"/admin/platform?tab=benefits&edit=" + b.id}
                    >
                      Editar beneficio
                    </Link>
                    <ToggleForm
                      table="rp_benefits"
                      id={b.id}
                      active={b.is_active}
                    />
                  </div>
                </article>
              ))}
            {tab === "drivers" &&
              (rows as Profile[]).map((p) => (
                <article className="rp-panel" key={p.id}>
                  <div className="rp-heading">
                    <h2>{p.full_name || "Cuenta sin nombre"}</h2>
                    <span className="rp-badge">
                      {p.closed_at
                        ? "Cuenta cerrada"
                        : p.role === "business"
                          ? "Comercio"
                          : statuses[p.status]}
                    </span>
                  </div>
                  <p className="rp-muted mt-2">
                    {p.phone} · {p.platform}
                  </p>
                  <p className="rp-muted break-all my-3">
                    ID de cuenta: {p.id}
                  </p>
                  {p.role === "driver" && !p.closed_at && (
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
                  {!p.closed_at && <CloseProfileForm id={p.id} />}
                </article>
              ))}
            {tab === "support" &&
              rows.map((r) => (
                <article className="rp-panel" key={r.id}>
                  <h2>
                    {
                      (
                        {
                          benefit: "Beneficio",
                          account: "Cuenta",
                          privacy: "Datos personales",
                          delete: "Solicitud de eliminación",
                        } as Record<string, string>
                      )[r.topic]
                    }
                  </h2>
                  <p className="rp-muted break-all mt-2">
                    Cuenta:{" "}
                    <Link
                      className="rp-text-link"
                      href={"/admin/platform?tab=drivers&q=" + r.driver_id}
                    >
                      {r.driver_id}
                    </Link>
                  </p>
                  <p className="my-4 whitespace-pre-line">{r.message}</p>
                  <p className="rp-muted mb-4">
                    Busca el ID en Cuentas para contactar por WhatsApp. Resolver
                    esta solicitud no elimina datos automáticamente.
                  </p>
                  <ResolveSupport id={r.id} />
                </article>
              ))}
            {verificationRows.map((v) => (
              <article className="rp-panel" key={v.id}>
                <h2>{v.name}</h2>
                <p className="rp-muted mb-3">
                  {v.platform} · Enviada el {dateLabel(v.created_at)}
                </p>
                {v.url && (
                  // The private signed URL must not be cached by the public image optimizer.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.url}
                    alt={"Captura del perfil de " + v.name}
                    className="rp-verification-preview"
                  />
                )}
                {v.url ? (
                  <a
                    className="rp-text-link"
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir imagen privada (enlace válido 5 min) ↗
                  </a>
                ) : (
                  <p className="rp-error">
                    No pudimos abrir la imagen. Recarga la página antes de
                    revisar.
                  </p>
                )}
                {v.url && <ReviewForm id={v.id} />}
              </article>
            ))}
            <div className="rp-actions">
              {page > 0 && (
                <Link
                  className="rp-button secondary"
                  href={"/admin/platform?tab=" + tab + "&page=" + (page - 1)}
                >
                  Anterior
                </Link>
              )}
              {(result.count || 0) > (page + 1) * 50 && (
                <Link
                  className="rp-button secondary"
                  href={"/admin/platform?tab=" + tab + "&page=" + (page + 1)}
                >
                  Siguiente
                </Link>
              )}
            </div>
          </section>
          {(tab === "businesses" || tab === "benefits") && (
            <aside className="rp-panel">
              <h2 className="mb-5">
                {edit ? "Editar" : "Agregar"}{" "}
                {tab === "businesses" ? "comercio" : "beneficio"}
              </h2>
              {edit && (
                <Link
                  className="rp-text-link mb-4"
                  href={"/admin/platform?tab=" + tab}
                >
                  Agregar otro →
                </Link>
              )}
              {tab === "businesses" ? (
                <BusinessForm
                  key={edit?.id || "new"}
                  business={edit as Business | undefined}
                  accounts={accountOptions}
                />
              ) : (
                <BenefitForm
                  key={edit?.id || "new"}
                  businesses={shops.data || []}
                  benefit={edit as Benefit | undefined}
                />
              )}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
