import { requireAdmin } from "@/lib/platform/data";
import AdminShell from "@/components/platform/AdminShell";
import { AdminLogout } from "@/components/platform/AdminNav";
import { ThemeSetting } from "@/components/platform/theme";
import { MenuLink } from "@/components/platform/ui";
export const metadata = {
  title: "Más · RidePerks Admin",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await requireAdmin();
  return (
    <AdminShell>
      <h1>Más</h1>
      <section className="rp-menu">
        <MenuLink href="/admin/access" label="Acceso de conductores" />
        <MenuLink href="/admin" label="Lista de espera" />
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
