import { PasswordForm } from "@/components/platform/Forms";
import { SubHeader } from "@/components/platform/ui";
export const metadata = { title: "Contraseña · RidePerks" };
export default function Page() {
  return (
    <div className="rp-stack">
      <SubHeader
        back="/driver/profile"
        backLabel="Volver a Cuenta"
        title="Contraseña"
      />
      <p className="rp-muted">
        Elige una contraseña larga que no uses en otros servicios.
      </p>
      <PasswordForm />
    </div>
  );
}
