import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/platform/data";
import { SubHeader } from "@/components/platform/ui";
import { PasswordForm } from "@/components/platform/Forms";
import PlatformThemeScript from "@/components/platform/ThemeScript";
import "../../platform.css";
export const metadata = {
  title: "Contraseña · RidePerks",
  robots: { index: false, follow: false },
};
// Reached from the recovery email and from the business account screen.
export default async function Page() {
  const profile = await currentProfile();
  if (!profile) redirect("/recover");
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <main className="rp-main rp-stack">
        <SubHeader
          back={
            profile.role === "business"
              ? "/business/account"
              : "/driver/profile"
          }
          backLabel="Volver a tu cuenta"
          title="Contraseña"
        />
        <h2 className="rp-title">Elige tu nueva contraseña</h2>
        <p className="rp-muted">
          Usa al menos 10 caracteres y una contraseña que no repitas en otros
          servicios.
        </p>
        <PasswordForm />
      </main>
    </div>
  );
}
