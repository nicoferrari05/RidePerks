import Link from "next/link";
import { Logo } from "@/components/platform/ui";
import "../platform.css";
export const metadata = { title: "Términos de uso · RidePerks" };
export default function Page() {
  return (
    <div className="rp-app">
      <main className="rp-main rp-stack max-w-3xl">
        <Logo />
        <h1>Términos de uso</h1>
        <p className="rp-muted">
          Última actualización: 10 de septiembre de 2026.
        </p>
        <section className="rp-stack">
          <div>
            <h2>Qué ofrece RidePerks</h2>
            <p className="rp-muted">
              RidePerks es un club de beneficios para conductores en Panamá.
              Permite consultar ofertas de comercios aliados y presentar un
              código para solicitar su aplicación. No ofrece viajes, empleo ni
              servicios de transporte.
            </p>
          </div>
          <div>
            <h2>Tu cuenta</h2>
            <p className="rp-muted">
              Debes ser mayor de edad, proporcionar información correcta y
              trabajar como conductor o repartidor en una plataforma admitida.
              Tu cuenta es personal. Mantén tu contraseña privada y avisa al
              equipo si sospechas un acceso no autorizado.
            </p>
          </div>
          <div>
            <h2>Membresía y pagos</h2>
            <p className="rp-muted">
              El registro es gratuito. La membresía cuesta $15.00 por mes, con
              renovación manual mediante Yappy y sin cargos automáticos. El mes
              comienza cuando se confirma el pago; una renovación anticipada
              añade un mes al vencimiento actual. Mientras el acceso gratuito
              promocional siga activo, la plataforma no solicita pagos. Consulta
              tu vigencia y las condiciones antes de pagar en Mi membresía. Si
              necesitas ayuda con un cobro, utiliza Ayuda y soporte.
            </p>
          </div>
          <div>
            <h2>Verificación y beneficios</h2>
            <p className="rp-muted">
              Para usar beneficios debes verificar tu cuenta. Cada oferta tiene
              sus propias condiciones, fechas y límites, disponibles antes de
              generar el código. Confirma su disponibilidad con el comercio
              antes de consumir. Los códigos vencen y son de un solo uso. El
              comercio es responsable del producto o servicio que vende.
            </p>
          </div>
          <div>
            <h2>Uso responsable</h2>
            <p className="rp-muted">
              No compartas ni vendas códigos, suplantes a otra persona o
              intentes registrar usos inexistentes. Podemos suspender una cuenta
              por uso indebido. Puedes pedir la revisión de tu caso desde Ayuda.
            </p>
          </div>
          <div>
            <h2>Cambios y contacto</h2>
            <p className="rp-muted">
              Los beneficios pueden cambiar o dejar de estar disponibles. Los
              cambios de estas condiciones se publicarán en esta página. Para
              preguntas sobre tu cuenta o un beneficio, utiliza la sección de
              Ayuda de la plataforma.
            </p>
          </div>
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
