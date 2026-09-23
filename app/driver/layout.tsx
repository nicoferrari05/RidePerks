import type { Metadata } from "next";
import Link from "next/link";
import { requireDriver } from "@/lib/platform/data";
import { Logo } from "@/components/platform/ui";
import InstallApp from "@/components/platform/InstallApp";
import Navigation from "@/components/platform/Navigation";
import { statuses, initials } from "@/lib/platform/types";
import PlatformThemeScript from "@/components/platform/ThemeScript";
import { PlatformThemeToggle } from "@/components/platform/theme";
import "../platform.css";
export const metadata: Metadata = {
  title: "Mi plataforma · RidePerks",
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireDriver();
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <InstallApp />
      <a className="rp-skip" href="#main">
        Saltar al contenido
      </a>
      <aside className="rp-sidebar">
        <Logo />
        <Navigation />
        <div className="rp-sidebar-foot">
          <strong>Tu trabajo rinde más.</strong>El club que te acompaña al
          volante.<Link href="/driver/help">Ayuda y soporte ↗</Link>
        </div>
      </aside>
      <div className="rp-workspace">
        <header className="rp-mobile-header">
          <Logo />
          <div className="rp-mobile-actions">
            <span
              className={
                "rp-badge " +
                (profile.status === "verified" ? "good" : "pending")
              }
            >
              {statuses[profile.status]}
            </span>
            <PlatformThemeToggle />
          </div>
        </header>
        <header className="rp-topbar">
          <span>Tu club de beneficios en Panamá</span>
          <div className="rp-topbar-actions">
            <PlatformThemeToggle />
            <Link href="/driver/profile" className="rp-profile-link">
              <span>{profile.full_name}</span>
              <div className="rp-avatar">{initials(profile.full_name)}</div>
            </Link>
          </div>
        </header>
        <main id="main" className="rp-main">
          {children}
        </main>
      </div>
      <Navigation mobile />
    </div>
  );
}
