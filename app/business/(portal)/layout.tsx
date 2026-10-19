import type { Metadata } from "next";
import { requireBusiness } from "@/lib/platform/data";
import BusinessNav from "@/components/platform/BusinessNav";
import InstallApp from "@/components/platform/InstallApp";
import PlatformThemeScript from "@/components/platform/ThemeScript";
import "../../platform.css";
export const metadata: Metadata = {
  title: "Portal de comercios · RidePerks",
  robots: { index: false, follow: false },
};
// /business, /business/activity, /business/benefits, /business/account.
// Sign-in, registration and the staff invite page sit outside this group.
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { business, role } = await requireBusiness();
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
      <BusinessNav isOwner={Boolean(business) && role === "owner"} />
    </div>
  );
}
