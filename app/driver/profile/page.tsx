import Link from "next/link";
import { requireDriver } from "@/lib/platform/data";
import { logout } from "@/lib/platform/auth-actions";
import { ProfileForm } from "@/components/platform/Forms";
import { Heading } from "@/components/platform/ui";
import { statuses } from "@/lib/platform/types";
export const metadata = { title: "Mi cuenta · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  return (
    <div className="rp-stack">
      <Heading title="Mi cuenta">
        Mantén tus datos al día para que podamos ayudarte.
      </Heading>
      <div className="rp-detail">
        <section className="rp-panel">
          <h2 className="mb-5">Tus datos</h2>
          <ProfileForm profile={p} />
        </section>
        <div className="rp-stack">
          <section className="rp-panel">
            <h2>Tu acceso a RidePerks</h2>
            <p className="rp-muted my-3">
              Consulta tu membresía, su vigencia y tus pagos. Las renovaciones
              se confirman con Yappy y no generan cargos automáticos.
            </p>
            <span
              className={
                "rp-badge " + (p.status === "verified" ? "good" : "pending")
              }
            >
              {statuses[p.status]}
            </span>
            <div className="mt-4">
              <Link className="rp-text-link" href="/driver/membership">
                Mi membresía · $15 al mes →
              </Link>
              <br />
              <Link className="rp-text-link" href="/driver/verify">
                Ver estado de verificación →
              </Link>
            </div>
          </section>
          <section className="rp-panel">
            <h2>Seguridad y ayuda</h2>
            <div className="flex flex-col mt-3">
              <Link className="rp-text-link" href="/driver/password">
                Cambiar contraseña →
              </Link>
              <Link className="rp-text-link" href="/driver/help">
                Ayuda y soporte →
              </Link>
              <Link className="rp-text-link" href="/privacidad">
                Privacidad y tus datos →
              </Link>
            </div>
            <form action={logout} className="mt-5">
              <button className="rp-button secondary w-full">
                Cerrar sesión
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
