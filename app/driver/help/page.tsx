import SupportForm from "@/components/platform/SupportForm";
import Link from "next/link";
import { Heading } from "@/components/platform/ui";
export const metadata = { title: "Ayuda · RidePerks" };
export default function Page() {
  const email = process.env.SUPPORT_EMAIL;
  return (
    <div className="rp-stack max-w-2xl">
      <Heading title="Estamos para ayudarte">
        Respuestas para que puedas continuar con tu día.
      </Heading>
      <section className="rp-panel rp-stack">
        <div>
          <h2>¿Cómo uso un beneficio?</h2>
          <p className="rp-muted mt-2">
            Abre el beneficio, revisa sus condiciones y genera un código cuando
            estés en el comercio. El código vence en dos minutos y solo funciona
            una vez. El comercio debe confirmar el canje.
          </p>
        </div>
        <div>
          <h2>¿Por qué no puedo generar un código?</h2>
          <p className="rp-muted mt-2">
            Tu cuenta debe estar verificada. También puede que el beneficio haya
            vencido o que hayas alcanzado el límite de usos del mes.
          </p>
          <Link className="rp-text-link" href="/driver/verify">
            Ver mi verificación →
          </Link>
        </div>
        <div>
          <h2>¿RidePerks tiene algún costo?</h2>
          <p className="rp-muted mt-2">
            El acceso es gratuito durante el lanzamiento. No solicitamos datos
            de pago ni hacemos cargos automáticos.
          </p>
        </div>
        <div>
          <h2>¿No aparece mi ahorro?</h2>
          <p className="rp-muted mt-2">
            El ahorro se registra después de que el comercio confirme el código.
            Los descuentos sin un monto fijo aparecen como usos confirmados y no
            suman un ahorro estimado.
          </p>
        </div>
      </section>
      <section className="rp-panel">
        <h2 className="mb-5">Escríbenos desde tu cuenta</h2>
        <SupportForm />
      </section>
      {email && (
        <section className="rp-panel">
          <h2>Habla con el equipo</h2>
          <a className="rp-text-link" href={"mailto:" + email}>
            {email} ↗
          </a>
        </section>
      )}
    </div>
  );
}
