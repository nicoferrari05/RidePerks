import type { Metadata } from "next";
import Link from "next/link";
import { requireDriver } from "@/lib/platform/data";
import { Logo } from "@/components/platform/ui";
import InstallApp from "@/components/platform/InstallApp";
import Navigation from "@/components/platform/Navigation";
import { statuses, initials } from "@/lib/platform/types";
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
          <span
            className={
              "rp-badge " + (profile.status === "verified" ? "good" : "pending")
            }
          >
            {statuses[profile.status]}
          </span>
        </header>
        <header className="rp-topbar">
          <span>Tu club de beneficios en Panamá</span>
          <Link href="/driver/profile" className="flex items-center gap-3">
            <span>{profile.full_name}</span>
            <div className="rp-avatar">{initials(profile.full_name)}</div>
          </Link>
        </header>
        <main id="main" className="rp-main">
          {children}
        </main>
      </div>
      <Navigation mobile />
    </div>
  );
}
