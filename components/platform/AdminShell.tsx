import { ShieldCheck } from "lucide-react";
import { Logo } from "./ui";
import PlatformThemeScript from "./ThemeScript";
import { PlatformThemeToggle } from "./theme";
import { AdminNav, AdminLogout } from "./AdminNav";
import "@/app/platform.css";

// Shared frame for every signed-in /admin page: the same glass header as the
// business portal (logo, theme, section nav, logout) above a platform main.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <a className="rp-skip" href="#main">
        Saltar al contenido
      </a>
      <header className="rp-business-header">
        <Logo />
        <span className="rp-badge">
          <ShieldCheck size={14} aria-hidden="true" />
          Admin
        </span>
        <PlatformThemeToggle />
        <AdminNav />
        <AdminLogout />
      </header>
      <main id="main" className="rp-main rp-stack">
        {children}
      </main>
    </div>
  );
}
