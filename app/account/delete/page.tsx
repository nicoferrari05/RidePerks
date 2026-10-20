import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/platform/data";
import { SubHeader } from "@/components/platform/ui";
import { DeleteAccountForm } from "@/components/platform/AppForms";
import PlatformThemeScript from "@/components/platform/ThemeScript";
import "../../platform.css";
export const metadata = {
  title: "Eliminar cuenta · RidePerks",
  robots: { index: false, follow: false },
};
// Reached from Cuenta (driver and business). The account is closed right
// away: login blocked, personal data erased, history kept anonymous.
export default async function Page() {
  const profile = await currentProfile();
  if (!profile) redirect("/login");
  const business = profile.role === "business";
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <main className="rp-main rp-stack">
        <SubHeader
          back={business ? "/business/account" : "/driver/profile"}
          backLabel="Volver a tu cuenta"
          title="Eliminar cuenta"
        />
        <h2 className="rp-title">¿Seguro que quieres irte?</h2>
        <div className="rp-panel rp-stack tight">
          <h3>Qué pasa al eliminarla</h3>
          <ul className="rp-bullets">
            <li>No podrás volver a iniciar sesión con este correo.</li>
            <li>
              Borramos tu nombre, teléfono, capturas de verificación,
              favoritos, notificaciones y mensajes de ayuda.
            </li>
            <li>
              Los usos y pagos ya registrados se conservan sin tus datos
              personales, porque son parte del registro de los comercios y de
              la contabilidad.
            </li>
            {business ? (
              <li>
                Si administras un comercio, sigue publicado hasta que RidePerks
                lo pause. Escríbenos si quieres darlo de baja.
              </li>
            ) : (
              <li>Una membresía activa no se reembolsa.</li>
            )}
          </ul>
        </div>
        <DeleteAccountForm business={business} />
      </main>
    </div>
  );
}
