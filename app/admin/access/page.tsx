import Link from "next/link";
import { requireAdmin, currentProfile } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { AdminIdentity, AccessForm } from "@/components/platform/AccessForms";
import { Heading } from "@/components/platform/ui";
import { uuidSchema } from "@/lib/platform/validation";
import "../../platform.css";
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
    <main className="rp-app rp-main rp-stack">
      <Link className="rp-text-link" href="/admin/platform?tab=drivers">
        ← Cuentas
      </Link>
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
          <h2>{p.data.full_name}</h2>
          <p>
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
          <h2>Últimos cambios de acceso</h2>
          {events?.data?.map((e) => (
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
        </>
      ) : (
        <p>Selecciona un conductor desde Cuentas para administrar su acceso.</p>
      )}
    </main>
  );
}
