import PlatformThemeScript from "./ThemeScript";
import { AdminNav } from "./AdminNav";
import "@/app/platform.css";

// Shared frame for every signed-in /admin page: content on the platform's
// white canvas and the black dock (Plataforma, Revisiones, Pagos, Más).
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <a className="rp-skip" href="#main">
        Saltar al contenido
      </a>
      <main id="main" className="rp-main wide rp-stack">
        {children}
      </main>
      <AdminNav />
    </div>
  );
}
