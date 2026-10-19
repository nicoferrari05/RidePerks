import type { Metadata } from "next";
import { requireDriver } from "@/lib/platform/data";
import InstallApp from "@/components/platform/InstallApp";
import Navigation from "@/components/platform/Navigation";
import PlatformThemeScript from "@/components/platform/ThemeScript";
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
  await requireDriver();
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <InstallApp />
      <a className="rp-skip" href="#main">
        Saltar al contenido
      </a>
      <main id="main" className="rp-main">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
