import { PasswordForm } from "@/components/platform/Forms";
import { Heading } from "@/components/platform/ui";
export const metadata = { title: "Cambiar contraseña · RidePerks" };
export default function Page() {
  return (
    <div className="rp-stack max-w-xl">
      <Heading title="Cambia tu contraseña">
        Elige una contraseña larga que no uses en otros servicios.
      </Heading>
      <section className="rp-panel">
        <PasswordForm />
      </section>
    </div>
  );
}
