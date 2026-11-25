import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/platform/ui";
import "../platform.css";

export const metadata = { title: "Privacidad · RidePerks" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rp-stack" style={{ gap: 10 }}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="rp-muted flex list-disc flex-col gap-2 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <div className="rp-app">
      <main className="rp-main rp-stack max-w-3xl">
        <Logo />
        <h1>Tu privacidad en RidePerks</h1>
        <p className="rp-muted">Última actualización: 25 de noviembre de 2026.</p>
        <p className="rp-muted">
          Esta política explica qué datos personales trata RidePerks, para qué, con quién los compartimos, dónde se
          guardan y por cuánto tiempo. Aplica a la web rideperks.app y a la app de RidePerks para iPhone y Android.
          Tratamos tus datos conforme a la Ley 81 de 2019 de Protección de Datos Personales de la República de Panamá.
        </p>

        <section className="rp-stack">
          <Section title="Quién es responsable">
            <p className="rp-muted">
              RidePerks, el club de beneficios para conductores en Panamá, es responsable del tratamiento de los datos
              descritos aquí. Puedes escribirnos a soporte@rideperks.app o desde la sección de Ayuda de tu cuenta.
            </p>
          </Section>

          <Section title="Qué datos recopilamos">
            <List
              items={[
                <>
                  <strong>Cuenta de conductor:</strong> nombre, correo, WhatsApp y la plataforma en la que trabajas. Tu
                  contraseña se guarda cifrada por nuestro proveedor de inicio de sesión; nadie en RidePerks puede verla.
                </>,
                <>
                  <strong>Verificación:</strong> la captura de tu perfil de conductor que subes para verificar tu
                  cuenta. Es privada y se elimina en cuanto el equipo aprueba o rechaza la revisión.
                </>,
                <>
                  <strong>Uso del club:</strong> los beneficios que usas (comercio, beneficio, fecha y monto ahorrado),
                  los códigos que generas, tus favoritos, tus calificaciones y comentarios, tus notificaciones y las
                  solicitudes de ayuda que envías.
                </>,
                <>
                  <strong>Pagos:</strong> el plan, el monto, la fecha y el estado de cada orden pagada con Yappy. No
                  recibimos ni guardamos datos de tarjetas ni de cuentas bancarias: el pago ocurre dentro de Yappy.
                </>,
                <>
                  <strong>Comercios:</strong> nombre del negocio, datos de contacto de la persona responsable, dirección
                  y ubicación en el mapa, horario, logo y fotos, las cuentas de su personal y el PIN del comercio. El
                  nombre, la dirección, el horario, la ubicación, el logo y las fotos se muestran a los conductores.
                </>,
                <>
                  <strong>Datos técnicos:</strong> las cookies de sesión y la información que tu navegador o teléfono
                  envía al usar el servicio (como la dirección IP y el tipo de dispositivo), que nuestros proveedores
                  registran por seguridad y funcionamiento.
                </>,
              ]}
            />
            <p className="rp-muted">
              No recopilamos tu ubicación ni tus contactos, y no pedimos documentos de identidad. No incluyas datos de
              pasajeros ni documentos en tus capturas o mensajes.
            </p>
          </Section>

          <Section title="Para qué los usamos">
            <List
              items={[
                "Crear y mantener tu cuenta, e iniciar tu sesión.",
                "Verificar que eres conductor o repartidor activo.",
                "Mostrarte beneficios, generar tus códigos y registrar cada uso confirmado.",
                "Procesar tu membresía, mostrar tu vigencia y enviarte el recibo de cada pago.",
                "Enviarte avisos de tu cuenta: resultado de la verificación, pago recibido, membresía por vencer y cambio de contraseña.",
                "Contactarte por correo o WhatsApp sobre tu cuenta, tu verificación o una solicitud de ayuda.",
                "Prevenir fraude, abusos y usos duplicados, y proteger la plataforma.",
                "Mostrar a cada comercio cuántos usos y ahorros generó, sin datos de contacto de los conductores.",
              ]}
            />
            <p className="rp-muted">
              Usamos tus datos para prestarte el servicio que pediste, cumplir obligaciones legales y contables, y
              proteger el club. No vendemos ni alquilamos tus datos, no mostramos publicidad y no usamos herramientas
              de analítica ni de rastreo de terceros.
            </p>
          </Section>

          <Section title="Qué ve el comercio">
            <p className="rp-muted">
              Al confirmar tu código, el comercio ve tu nombre y el beneficio a aplicar. No ve tu correo, tu teléfono,
              tu contraseña ni tu captura de verificación. Sus reportes y descargas muestran los usos y los montos sin
              nombres de conductores, y las calificaciones solo como promedio, sin tus comentarios.
            </p>
          </Section>

          <Section title="Proveedores que tratan datos por nosotros">
            <p className="rp-muted">
              Para funcionar usamos estos servicios. Cada uno trata solo lo necesario para su tarea, bajo sus propias
              políticas de privacidad y seguridad:
            </p>
            <List
              items={[
                <>
                  <strong>Supabase:</strong> base de datos, inicio de sesión y almacenamiento de archivos (capturas de
                  verificación, logos y fotos de comercios). Guarda los datos de tu cuenta y de tu uso del club.
                </>,
                <>
                  <strong>Vercel:</strong> aloja la web y sus servidores. Registra datos técnicos de cada visita, como la
                  dirección IP, para operar y proteger el servicio.
                </>,
                <>
                  <strong>Resend:</strong> envía los correos de la plataforma. Recibe tu correo y el contenido del
                  mensaje.
                </>,
                <>
                  <strong>Cloudflare Turnstile:</strong> comprueba que quien crea una cuenta no es un programa
                  automático. Analiza datos técnicos de tu navegador o teléfono durante el registro.
                </>,
                <>
                  <strong>Yappy (Banco General):</strong> procesa los pagos de la membresía. Recibe el monto y la
                  referencia de la orden; tus datos de pago los maneja Yappy.
                </>,
                <>
                  <strong>Mapas:</strong> en la web, el mapa de comercios se descarga de OpenFreeMap (con datos de
                  OpenStreetMap); en la app usa Apple Maps en iPhone y Google Maps en Android. Estos servicios reciben tu
                  dirección IP al cargar el mapa, pero no tu ubicación: RidePerks no la pide.
                </>,
                <>
                  <strong>Apple App Store y Google Play:</strong> distribuyen la app y tratan los datos de tu cuenta de
                  tienda según sus propias políticas.
                </>,
              ]}
            />
            <p className="rp-muted">
              Algunos de estos proveedores guardan o procesan datos fuera de Panamá, principalmente en Estados Unidos.
              Elegimos proveedores que aplican medidas de seguridad reconocidas y les damos acceso solo a lo necesario.
            </p>
          </Section>

          <Section title="Cookies y datos en tu dispositivo">
            <List
              items={[
                "Cookies necesarias para mantener tu sesión iniciada (y la del equipo en el panel de administración). No usamos cookies de publicidad ni de analítica.",
                "Tu preferencia de tema (claro u oscuro) se guarda en tu navegador.",
                "La web puede guardar archivos estáticos para cargar más rápido y una página para cuando no hay conexión. No guarda páginas privadas ni códigos.",
                "En la app, tu sesión se guarda en el almacenamiento seguro del teléfono.",
              ]}
            />
          </Section>

          <Section title="Permisos del teléfono">
            <p className="rp-muted">
              La cámara se usa solo cuando la activas: para que un comercio escanee el código de un conductor, o para
              tomar la foto de una captura, un logo o una foto del comercio. El código se lee en el dispositivo; no
              guardamos video ni imágenes de la cámara. El acceso a tus fotos se usa solo para el archivo que eliges
              subir.
            </p>
          </Section>

          <Section title="Cuánto tiempo los conservamos">
            <List
              items={[
                "Los datos de tu cuenta, mientras tu cuenta exista.",
                "La captura de verificación, hasta que el equipo aprueba o rechaza la revisión; después se elimina.",
                "Los códigos de beneficio vencen a los 2 minutos y sirven una sola vez.",
                "Los registros para limitar intentos (por ejemplo, de inicio de sesión) guardan la dirección IP solo como una huella cifrada y se borran en un día.",
                "Los pagos y recibos, el tiempo que exigen las normas contables y fiscales.",
              ]}
            />
            <p className="rp-muted">
              Si cierras tu cuenta, bloqueamos el acceso y borramos tu nombre, teléfono, plataforma, favoritos,
              notificaciones, comentarios de calificaciones, mensajes de ayuda y capturas. Conservamos el registro de
              usos y pagos, ya sin tu nombre, porque lo necesitamos para la contabilidad, las estadísticas de los
              comercios y la prevención de fraude. El correo de acceso queda asociado a la cuenta cerrada para que nadie
              pueda volver a usarla.
            </p>
          </Section>

          <Section title="Tus derechos">
            <p className="rp-muted">
              Puedes pedir acceso a tus datos, su rectificación, su cancelación, oponerte a un tratamiento y pedir una
              copia para llevarla a otro servicio (portabilidad). Para hacerlo:
            </p>
            <List
              items={[
                "Corrige tu nombre, WhatsApp y plataforma desde Mi cuenta.",
                "Cierra tu cuenta desde Cuenta → Eliminar cuenta, en la web o en la app.",
                "Para cualquier otra solicitud, escribe desde Ayuda o a soporte@rideperks.app.",
              ]}
            />
            <p className="rp-muted">
              Respondemos dentro de los plazos que establece la ley. Si no estás de acuerdo con nuestra respuesta,
              puedes acudir a la Autoridad Nacional de Transparencia y Acceso a la Información (ANTAI).
            </p>
          </Section>

          <Section title="Seguridad">
            <p className="rp-muted">
              Todo el tráfico va cifrado (HTTPS). Las contraseñas se guardan cifradas. Las capturas de verificación
              están en un almacenamiento privado y el equipo las abre con enlaces temporales que vencen en minutos. El
              acceso del equipo a los datos se limita a lo necesario para operar el club y sus acciones quedan
              registradas.
            </p>
          </Section>

          <Section title="Menores de edad">
            <p className="rp-muted">RidePerks es solo para personas mayores de edad.</p>
          </Section>

          <Section title="Cambios a esta política">
            <p className="rp-muted">
              Publicaremos cualquier cambio en esta página, con su fecha. Si el cambio es importante, también te
              avisaremos en la plataforma o por correo.
            </p>
          </Section>
        </section>
        <Link className="rp-text-link" href="/terminos">
          Términos de uso →
        </Link>
        <Link className="rp-text-link" href="/">
          Volver al inicio →
        </Link>
      </main>
    </div>
  );
}
