import Link from "next/link";
import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/platform/data";
import { Logo, Heading } from "@/components/platform/ui";
import { PasswordForm } from "@/components/platform/Forms";
import PlatformThemeScript from "@/components/platform/ThemeScript";
import "../../platform.css";
export const metadata = {
  title: "Actualizar contraseña · RidePerks",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const profile = await currentProfile();
  if (!profile) redirect("/recover");
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <main className="rp-main rp-stack max-w-xl">
        <Logo />
        <Heading title="Elige tu nueva contraseña">
          Usa al menos 10 caracteres y una contraseña que no repitas en otros
          servicios.
        </Heading>
        <section className="rp-panel">
          <PasswordForm />
        </section>
        <Link
          className="rp-text-link"
          href={profile.role === "business" ? "/business" : "/driver/profile"}
        >
          Volver a mi cuenta →
        </Link>
      </main>
    </div>
  );
}
