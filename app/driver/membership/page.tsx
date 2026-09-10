import Link from "next/link";
import { requireDriver } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { yappyConfig } from "@/lib/payments/yappy";
import { YAPPY_SCRIPT } from "@/lib/payments/yappy-protocol";
import YappyCheckout from "@/components/platform/YappyCheckout";
import { Heading } from "@/components/platform/ui";
export const metadata = { title: "Mi membresía · RidePerks" };
export default async function Page() {
  const profile = await requireDriver();
  const setting = await getSupabaseAdmin()
    .from("rp_settings")
    .select("value")
    .eq("key", "free_access")
    .single();
  if (setting.error) throw new Error("No pudimos consultar el acceso.");
  const free = setting.data.value === true;
  return (
    <div className="rp-stack">
      <Heading title="Tu membresía RidePerks">
        Beneficios para tus paradas de cada día.
      </Heading>
      <section className="rp-panel rp-stack">
        <h2>$15.00 al mes</h2>
        <p>
          Un mes de acceso desde la confirmación del pago. Si renuevas antes del
          vencimiento, el mes se añade al tiempo que te queda.
        </p>
        <p className="rp-muted">
          Renovación manual con Yappy. No hay cargos automáticos. Cada beneficio
          conserva sus condiciones y límites de uso.
        </p>
      </section>
      {free ? (
        <section className="rp-panel">
          <h2>El acceso gratuito sigue activo</h2>
          <p className="rp-muted mt-3">
            Todavía no necesitas pagar. Aquí aparecerá la opción de pago cuando
            comience la membresía mensual.
          </p>
        </section>
      ) : profile.status !== "verified" ? (
        <section className="rp-panel">
          <h2>Primero verifica tu perfil</h2>
          <p className="rp-muted my-3">
            Para pagar y canjear beneficios necesitas la aprobación del equipo
            de RidePerks.
          </p>
          <Link className="rp-text-link" href="/driver/verify">
            Verificar mi perfil →
          </Link>
        </section>
      ) : yappyConfig() ? (
        <YappyCheckout phone={profile.phone || ""} scriptUrl={YAPPY_SCRIPT} />
      ) : (
        <p className="rp-error">
          El pago está temporalmente fuera de servicio. Contacta al equipo desde
          Ayuda.
        </p>
      )}
      <Link className="rp-text-link" href="/driver/help">
        Ayuda con mi membresía →
      </Link>
    </div>
  );
}
