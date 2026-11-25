import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/platform/ui";
import "../platform.css";

export const metadata = { title: "Términos de uso · RidePerks" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rp-stack" style={{ gap: 10 }}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default function Page() {
  return (
    <div className="rp-app">
      <main className="rp-main rp-stack max-w-3xl">
        <Logo />
        <h1>Términos de uso</h1>
        <p className="rp-muted">Última actualización: 25 de noviembre de 2026.</p>
        <p className="rp-muted">
          Estos términos regulan el uso de RidePerks en la web rideperks.app y en la app para iPhone y Android. Al crear
          una cuenta los aceptas, junto con nuestra{" "}
          <Link href="/privacidad" className="underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </p>

        <section className="rp-stack">
          <Section title="Qué ofrece RidePerks">
            <p className="rp-muted">
              RidePerks es un club de beneficios para conductores y repartidores en Panamá. Permite consultar ofertas de
              comercios aliados y presentar un código para solicitar su aplicación. No ofrece viajes, empleo ni
              servicios de transporte, y no está afiliado a Uber, InDrive, PedidosYa ni a otras plataformas.
            </p>
          </Section>

          <Section title="Tu cuenta">
            <p className="rp-muted">
              Debes ser mayor de edad, proporcionar información correcta y trabajar como conductor o repartidor en una
              plataforma admitida. Tu cuenta es personal. Mantén tu contraseña privada y avisa al equipo si sospechas
              un acceso no autorizado.
            </p>
          </Section>

          <Section title="Membresía y pagos">
            <p className="rp-muted">
              El registro es gratuito. La membresía cuesta $15.00 por mes, o $150.00 por 12 meses en un solo pago (plan
              anual), con renovación manual mediante Yappy y sin cargos automáticos. El período comienza cuando se
              confirma el pago; una renovación anticipada se suma al vencimiento actual. El plan anual no se cobra en
              cuotas ni se renueva solo. Mientras el acceso gratuito promocional siga activo, la plataforma no solicita
              pagos. Consulta tu vigencia y las condiciones antes de pagar en Mi membresía. El pago lo procesa Yappy,
              bajo sus propias condiciones. Si necesitas ayuda con un cobro, utiliza Ayuda y soporte.
            </p>
          </Section>

          <Section title="Verificación y beneficios">
            <p className="rp-muted">
              Para usar beneficios debes verificar tu cuenta. Cada oferta tiene sus propias condiciones, fechas y
              límites, disponibles antes de generar el código. Confirma su disponibilidad con el comercio antes de
              consumir. Los códigos vencen a los 2 minutos y son de un solo uso. El comercio es responsable del producto
              o servicio que vende y de aplicar el beneficio publicado.
            </p>
          </Section>

          <Section title="Para comercios">
            <p className="rp-muted">
              Unirse a RidePerks no tiene costo para el comercio. El comercio propone sus beneficios, condiciones y
              límites; el equipo de RidePerks los revisa antes de publicarlos y puede pedir cambios o retirarlos. Al
              publicar un beneficio, el comercio se compromete a aplicarlo a los miembros que presenten un código
              válido. El comercio es responsable de las cuentas de su personal y de mantener privado su PIN. El nombre,
              la dirección, el horario, la ubicación, el logo y las fotos del comercio se muestran a los conductores.
            </p>
          </Section>

          <Section title="Uso responsable">
            <p className="rp-muted">
              No compartas ni vendas códigos, no suplantes a otra persona ni intentes registrar usos inexistentes o
              alterar la plataforma. Podemos suspender o cerrar una cuenta por uso indebido. Puedes pedir la revisión de
              tu caso desde Ayuda.
            </p>
          </Section>

          <Section title="Cerrar tu cuenta">
            <p className="rp-muted">
              Puedes cerrar tu cuenta cuando quieras desde Cuenta → Eliminar cuenta, en la web o en la app. Al cerrarla
              pierdes el acceso a la plataforma y a la membresía vigente. La política de privacidad explica qué datos
              borramos y cuáles conservamos.
            </p>
          </Section>

          <Section title="Disponibilidad y responsabilidad">
            <p className="rp-muted">
              Trabajamos para que la plataforma esté disponible y funcione bien, pero puede tener interrupciones por
              mantenimiento o por fallas de nuestros proveedores. Los beneficios dependen de cada comercio y pueden
              cambiar o dejar de estar disponibles. RidePerks no es responsable de los productos o servicios que venden
              los comercios.
            </p>
          </Section>

          <Section title="Cambios y ley aplicable">
            <p className="rp-muted">
              Publicaremos cualquier cambio de estos términos en esta página, con su fecha; si es importante, también te
              avisaremos en la plataforma o por correo. Estos términos se rigen por las leyes de la República de Panamá.
              Para preguntas sobre tu cuenta o un beneficio, utiliza Ayuda o escribe a soporte@rideperks.app.
            </p>
          </Section>
        </section>
        <Link className="rp-text-link" href="/login">
          Ir a mi cuenta →
        </Link>
        <Link className="rp-text-link" href="/privacidad">
          Política de privacidad →
        </Link>
      </main>
    </div>
  );
}
