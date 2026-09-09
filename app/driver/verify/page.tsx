import { requireDriver, getVerification } from "@/lib/platform/data";
import { Heading } from "@/components/platform/ui";
import { VerificationForm } from "@/components/platform/Forms";
import { ShieldCheck } from "lucide-react";
export const metadata = { title: "Verificar cuenta · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  const v = await getVerification(p.id);
  const pending = v?.status === "pending";
  const verified = p.status === "verified";
  const suspended = p.status === "suspended";
  return (
    <div className="rp-stack">
      <Heading title="Verifica tu cuenta">
        Confirma que eres conductor activo para usar los beneficios del club.
      </Heading>
      <div className="rp-detail">
        <section className="rp-panel">
          <ShieldCheck size={28} className="mb-4" />
          <h2>
            {verified
              ? "Tu cuenta está verificada"
              : suspended
                ? "Tu cuenta está suspendida"
                : pending
                  ? "Estamos revisando tu solicitud"
                  : "Una imagen y estás en camino"}
          </h2>
          <p className="rp-muted my-4">
            {verified
              ? "Ya puedes generar códigos para los beneficios disponibles."
              : suspended
                ? "Contacta al equipo desde Ayuda para revisar tu caso."
                : pending
                  ? "Tu imagen se envió correctamente. Cuando el equipo la revise, verás el resultado aquí."
                  : "Sube una captura de tu perfil de Uber, inDrive o PedidosYa donde se vea tu nombre y la plataforma."}
          </p>
          {v?.status === "rejected" && (
            <p className="rp-error mb-5">
              Necesitamos una nueva imagen.{" "}
              {v.admin_notes ||
                "Asegúrate de que tu nombre y la plataforma se vean completos."}
            </p>
          )}
          {!verified && !suspended && !pending && <VerificationForm />}
        </section>
        <aside>
          <h2>Antes de enviarla</h2>
          <ol className="rp-steps">
            <li>
              Abre la app donde trabajas y entra a tu perfil de conductor.
            </li>
            <li>Toma una captura donde se lean tu nombre y la plataforma.</li>
            <li>Oculta datos de pasajeros, pagos y documentos de identidad.</li>
          </ol>
          <p className="rp-muted">
            Tu imagen es privada. Solo el equipo de RidePerks puede revisarla
            para verificar tu cuenta.
          </p>
        </aside>
      </div>
    </div>
  );
}
