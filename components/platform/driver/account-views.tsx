import { Empty, SubHeader } from "@/components/platform/ui";
import type { Profile } from "@/lib/platform/types";

// Sub-screens of Cuenta (membership, verification, help). Presentational:
// the pages fetch and pass the interactive pieces in.

export function MembershipView({
  state,
  free,
  verified,
  checkout,
}: {
  state: { status: string; lifetime: boolean };
  free: boolean;
  verified: boolean;
  /** The Yappy checkout, or null when payments are switched off. */
  checkout: React.ReactNode;
}) {
  const blocked = state.status !== "enabled";
  return (
    <div className="rp-stack">
      <SubHeader
        back="/driver/profile"
        backLabel="Volver a Cuenta"
        title="Membresía"
      />
      <section className="rp-hero">
        <p className="rp-hero-label">Membresía RidePerks</p>
        <p className="rp-hero-value">$15</p>
        <p className="rp-hero-label">
          al mes · un mes desde que confirmas el pago. Renovación manual con
          Yappy, sin cargos automáticos.
        </p>
      </section>
      {blocked ? (
        <Empty
          title={
            state.status === "suspended"
              ? "Tu acceso está suspendido"
              : "Tu acceso está cancelado"
          }
          href="/driver/help"
          label="Hablar con el equipo"
        >
          <p>Un pago no retira este bloqueo. Escríbenos para revisarlo.</p>
        </Empty>
      ) : state.lifetime ? (
        <Empty title="Tienes acceso permanente">
          <p>No necesitas pagar una membresía mensual.</p>
        </Empty>
      ) : free ? (
        <Empty title="El acceso gratuito sigue activo">
          <p>Todavía no necesitas pagar. Aquí verás el pago cuando empiece.</p>
        </Empty>
      ) : !verified ? (
        <Empty
          title="Primero verifica tu cuenta"
          href="/driver/verify"
          label="Verificar ahora"
        >
          <p>Para pagar y usar beneficios necesitamos aprobar tu perfil.</p>
        </Empty>
      ) : (
        checkout || (
          <p className="rp-error">
            El pago está fuera de servicio por un momento. Escríbenos desde
            Ayuda.
          </p>
        )
      )}
      <p className="rp-muted">
        Si renuevas antes del vencimiento, el mes nuevo se suma al tiempo que te
        queda. Cada beneficio mantiene sus condiciones y límites.
      </p>
    </div>
  );
}

export function VerifyView({
  status,
  pending,
  rejectedNote,
  form,
}: {
  status: Profile["status"];
  pending: boolean;
  /** Admin note when the last request was rejected (or a default). */
  rejectedNote: string | null;
  form: React.ReactNode;
}) {
  const verified = status === "verified",
    suspended = status === "suspended";
  return (
    <div className="rp-stack">
      <SubHeader
        back="/driver/profile"
        backLabel="Volver a Cuenta"
        title="Verificación"
      />
      <section className="rp-detail-hero">
        <span className={"rp-badge " + (verified ? "good" : "pending")}>
          {verified
            ? "Verificada"
            : suspended
              ? "Suspendida"
              : pending
                ? "En revisión"
                : "Sin verificar"}
        </span>
        <h2 className="rp-title">
          {verified
            ? "Tu cuenta está verificada"
            : suspended
              ? "Tu cuenta está suspendida"
              : pending
                ? "Estamos revisando tu captura"
                : "Verifica que eres conductor"}
        </h2>
        <p className="rp-muted">
          {verified
            ? "Ya puedes generar códigos en los beneficios disponibles."
            : suspended
              ? "Escríbenos desde Ayuda para revisar tu caso."
              : pending
                ? "El equipo revisa tu nombre y plataforma a mano. Te avisaremos por correo."
                : "Sube una captura de tu perfil en Uber, inDrive o PedidosYa donde se vean tu nombre y la plataforma."}
        </p>
      </section>
      {rejectedNote && (
        <p className="rp-error">Necesitamos una nueva imagen. {rejectedNote}</p>
      )}
      {!verified && !suspended && !pending && (
        <>
          <ol className="rp-steps">
            <li>Abre la app donde trabajas y entra a tu perfil.</li>
            <li>Toma una captura donde se lean tu nombre y la plataforma.</li>
            <li>Oculta datos de pasajeros, pagos y documentos.</li>
          </ol>
          {form}
          <p className="rp-muted">
            Tu imagen es privada y se borra después de la revisión.
          </p>
        </>
      )}
    </div>
  );
}

const faq = [
  [
    "¿Cómo uso un beneficio?",
    "Abre el beneficio y genera tu código cuando estés en el comercio. Vence en dos minutos y sirve una sola vez. El comercio lo escanea para confirmarlo.",
  ],
  [
    "¿Por qué no puedo generar un código?",
    "Tu cuenta debe estar verificada y tu membresía activa. También puede que el beneficio haya vencido o que llegaras al límite del mes.",
  ],
  [
    "¿Cuánto cuesta RidePerks?",
    "El registro es gratis y la membresía cuesta $15 al mes. Cada renovación se confirma con Yappy, sin cargos automáticos.",
  ],
  [
    "¿No aparece mi ahorro?",
    "Se registra cuando el comercio confirma tu código. Los descuentos sin monto fijo aparecen como usos, sin sumar un ahorro estimado.",
  ],
];

export function HelpView({
  form,
  email,
  back = "/driver/profile",
}: {
  form: React.ReactNode;
  email?: string;
  back?: string;
}) {
  return (
    <div className="rp-stack">
      <SubHeader back={back} backLabel="Volver a Cuenta" title="Ayuda" />
      <section>
        <h2 className="rp-menu-title">Preguntas frecuentes</h2>
        {faq.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p className="rp-muted">{a}</p>
          </details>
        ))}
      </section>
      <section className="rp-stack tight">
        <h2>Escríbenos</h2>
        {form}
      </section>
      {email && (
        <a className="rp-text-link" href={"mailto:" + email}>
          {email}
        </a>
      )}
    </div>
  );
}
