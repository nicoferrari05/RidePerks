import { requireDriver } from "@/lib/platform/data";
import { ProfileForm } from "@/components/platform/Forms";
import { SubHeader } from "@/components/platform/ui";
export const metadata = { title: "Datos personales · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  return (
    <div className="rp-stack">
      <SubHeader
        back="/driver/profile"
        backLabel="Volver a Cuenta"
        title="Datos personales"
      />
      <p className="rp-muted">
        Usamos tu WhatsApp para ayudarte con tu cuenta y tus beneficios.
      </p>
      <ProfileForm profile={p} />
    </div>
  );
}
