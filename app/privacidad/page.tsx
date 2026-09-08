import Link from "next/link";
import { Logo } from "@/components/platform/ui";
import "../platform.css";
export const metadata = { title: "Privacidad · RidePerks" };
export default function Page() {
  return (
    <div className="rp-app">
      <main className="rp-main rp-stack max-w-3xl">
        <Logo />
        <h1>Tu privacidad en RidePerks</h1>
        <p className="rp-muted">
          Última actualización: 8 de septiembre de 2026.
        </p>
        <section className="rp-stack">
          <div>
            <h2>Datos que utilizamos</h2>
            <p className="rp-muted">
              Al crear una cuenta recibimos tu nombre, correo, teléfono y
              plataforma de trabajo. Si solicitas verificación, recibimos la
              imagen de tu perfil de conductor. También registramos los
              beneficios que utilizas y las solicitudes de ayuda que envías.
            </p>
          </div>
          <div>
            <h2>Para qué los usamos</h2>
            <p className="rp-muted">
              Usamos estos datos para identificar tu cuenta, verificar que eres
              conductor, permitir el uso de beneficios, mostrar tu historial,
              atender consultas y prevenir usos duplicados o indebidos. La
              imagen de verificación no es pública.
            </p>
          </div>
          <div>
            <h2>Quién puede acceder</h2>
            <p className="rp-muted">
              El equipo de RidePerks accede a la información necesaria para
              operar el club. Al confirmar un código, el comercio recibe tu
              nombre y el beneficio a aplicar. No recibe tu contraseña, teléfono
              ni imagen de verificación. Usamos Supabase para autenticación y
              almacenamiento, y Vercel para alojar la aplicación; el
              procesamiento puede realizarse fuera de Panamá.
            </p>
          </div>
          <div>
            <h2>Sesión y cámara</h2>
            <p className="rp-muted">
              Usamos cookies necesarias para mantener tu sesión. El acceso a la
              cámara se solicita al comercio únicamente cuando activa el
              escáner. El código se lee en su dispositivo; no guardamos video de
              la cámara. La app puede guardar archivos estáticos para cargar más
              rápido, pero no guarda páginas privadas ni códigos para usarlos
              sin conexión.
            </p>
          </div>
          <div>
            <h2>Tus opciones</h2>
            <p className="rp-muted">
              Puedes corregir tu perfil desde Mi cuenta y enviar solicitudes de
              acceso, corrección o eliminación desde Ayuda. Conservamos tus
              datos mientras son necesarios para operar tu cuenta, atender
              solicitudes y resolver incidencias; al tramitar una eliminación se
              revisa qué registros deben conservarse y por cuánto tiempo.
            </p>
          </div>
          <div>
            <h2>Contacto</h2>
            <p className="rp-muted">
              Para consultas de privacidad o una solicitud sobre tus datos,
              entra a la sección de Ayuda de tu cuenta. No envíes documentos de
              identidad ni datos de pasajeros en tus imágenes o mensajes.
            </p>
          </div>
        </section>
        <Link className="rp-text-link" href="/driver/help">
          Ir a Ayuda →
        </Link>
        <Link className="rp-text-link" href="/">
          Volver al inicio →
        </Link>
      </main>
    </div>
  );
}
