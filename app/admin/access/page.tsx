import Link from "next/link";
import { requireAdmin, currentProfile } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { AdminIdentity, AccessForm } from "@/components/platform/AccessForms";
import { Heading, Empty } from "@/components/platform/ui";
import AdminShell from "@/components/platform/AdminShell";
import { uuidSchema } from "@/lib/platform/validation";
export const metadata = {
  title: "Acceso de conductores · RidePerks",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ driver?: string }>;
}) {
  await requireAdmin();
  const profile = await currentProfile();
  const { driver } = await searchParams;
  const db = getSupabaseAdmin();
  const valid = uuidSchema.safeParse(driver);
  const p = valid.success
    ? await db
        .from("rp_profiles")
        .select("id,full_name")
        .eq("id", valid.data)
        .eq("role", "driver")
        .maybeSingle()
    : null;
  const access = p?.data
    ? await db.rpc("rp_access_state", { p_driver: p.data.id })
    : null;
  const events = p?.data
    ? await db
        .from("rp_admin_audit")
        .select("id,action,detail,created_at,rp_profiles!actor_id(full_name)")
        .eq("subject_id", p.data.id)
        .like("action", "access.%")
        .order("created_at", { ascending: false })
        .limit(30)
    : null;
  if (p?.error || access?.error || events?.error)
    throw new Error("No pudimos consultar el acceso.");
  return (
    <AdminShell>
      <Heading title="Acceso de conductores">
        Administra membresías y accesos promocionales.
      </Heading>
      <details>
        <summary>
          Identidad administrativa{profile ? ": " + profile.full_name : ""}
        </summary>
        <AdminIdentity />
        <Link href="/login" target="_blank" className="rp-text-link">
          Abrir inicio de sesión personal
        </Link>
      </details>
      {p?.data ? (
        <>
          <section className="rp-panel rp-stack">
            <Link className="rp-text-link" href="/admin/platform?tab=drivers">
              ← Volver a Cuentas
            </Link>
            <h2>{p.data.full_name}</h2>
            <p className="rp-muted">
              Estado:{" "}
              {access?.data.status === "enabled"
                ? "Habilitado"
                : access?.data.status === "suspended"
                  ? "Suspendido"
                  : "Cancelado"}{" "}
              ·{" "}
              {access?.data.lifetime
                ? "Lifetime"
                : access?.data.valid_until
                  ? "Vigencia: " +
                    new Date(access.data.valid_until).toLocaleString("es-PA", {
                      timeZone: "America/Panama",
                    })
                  : "Sin vigencia registrada"}
            </p>
            <AccessForm driverId={p.data.id} />
          </section>
          <h2>Últimos cambios de acceso</h2>
          {events?.data?.length ? (
            <div className="rp-list">
              {events.data.map((e) => (
                <article className="rp-list-row" key={e.id}>
                  <div>
                    <p>{e.detail.reason}</p>
                    <p className="rp-muted">
                      {(e.rp_profiles as unknown as { full_name: string })
                        ?.full_name || "Administrador"}{" "}
                      ·{" "}
                      {new Date(e.created_at).toLocaleString("es-PA", {
                        timeZone: "America/Panama",
                      })}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rp-muted">Todavía no hay cambios registrados.</p>
          )}
        </>
      ) : (
        <Empty
          title="Elige un conductor"
          href="/admin/platform?tab=drivers"
          label="Ir a Cuentas"
        >
          <p>
            Abre «Administrar membresía y acceso» desde una cuenta para ver su
            estado y cambiarlo.
          </p>
        </Empty>
      )}
    </AdminShell>
  );
}
