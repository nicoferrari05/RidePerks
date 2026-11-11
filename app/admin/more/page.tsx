import { requireAdmin, catalogLive } from "@/lib/platform/data";
import AdminShell from "@/components/platform/AdminShell";
import { AdminLogout } from "@/components/platform/AdminNav";
import { CatalogToggle } from "@/components/platform/AdminForms";
import { ThemeSetting } from "@/components/platform/theme";
import { MenuLink } from "@/components/platform/ui";
export const metadata = {
  title: "Más · RidePerks Admin",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await requireAdmin();
  const live = await catalogLive();
  return (
    <AdminShell>
      <h1>Más</h1>
      <section>
        <h2 className="rp-menu-title">Operación</h2>
        <div className="rp-menu">
          <MenuLink href="/admin/metrics" label="Métricas" />
          <MenuLink href="/admin/announcements" label="Anuncios" />
          <MenuLink href="/admin/access" label="Acceso de conductores" />
        </div>
      </section>
      <section>
        <h2 className="rp-menu-title">Catálogo</h2>
        <CatalogToggle live={live} />
      </section>
      <section>
        <h2 className="rp-menu-title">Ajustes</h2>
        <div className="rp-menu">
          <div className="rp-menu-row">
            <span>Apariencia</span>
            <ThemeSetting />
          </div>
        </div>
      </section>
      <div style={{ maxWidth: 420 }}>
        <AdminLogout />
      </div>
    </AdminShell>
  );
}
