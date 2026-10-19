import type { Metadata } from "next";
import Link from "next/link";
import { pinBusiness } from "@/lib/platform/data";
import { leavePin } from "@/lib/platform/pin-actions";
import { AuthShell, PinForm } from "@/components/ui/sign-in";
import { AudienceSwitch } from "@/components/platform/AuthPage";
import { Logo } from "@/components/platform/ui";
import { Button } from "@/components/ui/button";
import BusinessScanner from "@/components/platform/BusinessScanner";
import PlatformThemeScript from "@/components/platform/ThemeScript";
import "../platform.css";
import "../auth.css";
export const metadata: Metadata = {
  title: "Escanear con PIN · RidePerks",
  robots: { index: false, follow: false },
};
// On-site staff (a pump attendant, a mechanic, a waiter) enter the PIN
// RidePerks gave their business and scan driver QR codes without an account.
// Every use is recorded under that business, as if its owner had scanned it.
export default async function Page() {
  const business = await pinBusiness();
  if (!business)
    return (
      <AuthShell heroTagline="Escanea el QR. El canje queda registrado.">
        <div className="flex flex-col gap-5">
          <Link
            href="/"
            className="animate-element text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Volver a RidePerks
          </Link>
          <AudienceSwitch mode="login" active="pin" />
          <h1 className="animate-element animate-delay-200 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Escanea sin iniciar sesión.
          </h1>
          <p className="animate-element animate-delay-300 text-muted-foreground">
            Escribe el PIN que RidePerks le dio a tu comercio. Después se abre
            la cámara para escanear el QR del conductor.
          </p>
          <PinForm />
        </div>
      </AuthShell>
    );
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <header className="rp-pinbar">
        <Logo />
        <form action={leavePin}>
          <Button type="submit" variant="secondary" size="md">
            Salir
          </Button>
        </form>
      </header>
      <main className="rp-main rp-stack">
        <div className="rp-heading">
          <div>
            <span className="rp-badge">Escaneo con PIN</span>
            <h1>{business.name}</h1>
            <p className="rp-muted">{business.address}</p>
          </div>
        </div>
        <BusinessScanner pin />
        <p className="rp-muted">
          Cada canje queda registrado en el portal del comercio. Este acceso
          dura 12 horas en este dispositivo y se cierra si RidePerks cambia el
          PIN.
        </p>
      </main>
    </div>
  );
}
