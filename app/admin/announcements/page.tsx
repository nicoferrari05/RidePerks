import Link from "next/link";
import { requireAdmin } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import AdminShell from "@/components/platform/AdminShell";
import { AnnouncementForm } from "@/components/platform/AppForms";
import { Heading } from "@/components/platform/ui";
import { dateLabel } from "@/lib/platform/types";
export const metadata = {
  title: "Anuncios · RidePerks Admin",
  robots: { index: false, follow: false },
};
const audiences: Record<string, string> = {
  drivers: "Conductores",
  businesses: "Comercios",
  all: "Todos",
};
export default async function Page() {
  await requireAdmin();
  const { data, error } = await getSupabaseAdmin()
    .from("rp_announcements")
    .select(
      "id,title,body,audience,recipients,created_at,rp_admin_users(rp_profiles(full_name))",
    )
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error("No pudimos cargar los anuncios.");
  return (
    <AdminShell>
      <Heading title="Anuncios">
        Llegan a las notificaciones de cada persona. Úsalos para novedades
        importantes: nuevos aliados, cambios de precio o mantenimiento.
      </Heading>
      <Link href="/admin/access" className="rp-text-link">
        Requiere tu identidad administrativa vinculada →
      </Link>
      <section className="rp-panel">
        <AnnouncementForm />
      </section>
      <h2>Enviados</h2>
      {data.length ? (
        <div className="rp-list">
          {data.map((a) => (
            <div className="rp-list-row" key={a.id}>
              <div>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
                <p>
                  {audiences[a.audience]} · {a.recipients}{" "}
                  {a.recipients === 1 ? "persona" : "personas"} ·{" "}
                  {dateLabel(a.created_at)} ·{" "}
                  {(
                    a.rp_admin_users as unknown as {
                      rp_profiles: { full_name: string } | null;
                    } | null
                  )?.rp_profiles?.full_name || "Administrador"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rp-muted">Todavía no has enviado anuncios.</p>
      )}
    </AdminShell>
  );
}
