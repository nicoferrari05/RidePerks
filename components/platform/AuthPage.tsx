import Link from "next/link";
import {
  Fuel,
  Ticket,
  ShieldCheck,
  Store,
  ScanLine,
  ClipboardList,
  CarFront,
} from "lucide-react";
import { Logo } from "./ui";
import { AuthForm } from "./Forms";
import "@/app/platform.css";
export default function AuthPage({
  mode,
  next,
  error,
  audience = "driver",
}: {
  mode: "login" | "register" | "recover";
  next?: string;
  error?: boolean;
  audience?: "driver" | "business";
}) {
  const business = audience === "business";
  const title =
    mode === "login"
      ? business
        ? "Tu comercio, conectado."
        : "Qué bueno verte de vuelta."
      : mode === "register"
        ? business
          ? "Suma tu comercio a RidePerks."
          : "Tu próximo ahorro empieza aquí."
        : "Recupera tu acceso.";
  const description =
    mode === "login"
      ? business
        ? "Entra para validar los beneficios de tus clientes y consultar los usos de tu comercio."
        : "Entra a tu cuenta y encuentra los beneficios para tu próxima parada."
      : mode === "register"
        ? business
          ? "Crea la cuenta del responsable. El equipo de RidePerks la vinculará a tu comercio."
          : "Crea tu cuenta gratis y entra directamente. Si estabas en la lista de espera, usa el mismo correo."
        : "Te enviaremos un enlace para elegir una nueva contraseña.";
  const loginPath = business ? "/business/login" : "/login";
  return (
    <div className={"rp-app rp-auth" + (business ? " rp-auth-business" : "")}>
      <aside className="rp-auth-story">
        <Logo />
        <div>
          <h2>
            {business
              ? "Más visitas. Un beneficio a la vez."
              : "Lo que ganas, que te rinda más."}
          </h2>
          <p>
            {business
              ? "Un espacio para atender a los conductores que eligen tu negocio."
              : "Un solo lugar para los beneficios que acompañan tu día al volante."}
          </p>
          <ul>
            {business ? (
              <>
                <li>
                  <Store size={20} />
                  Tu comercio, con acceso propio
                </li>
                <li>
                  <ScanLine size={20} />
                  Escanea y confirma cada beneficio
                </li>
                <li>
                  <ClipboardList size={20} />
                  Consulta los usos registrados
                </li>
              </>
            ) : (
              <>
                <li>
                  <Fuel size={20} />
                  Encuentra comercios aliados
                </li>
                <li>
                  <Ticket size={20} />
                  Presenta tu código y usa el beneficio
                </li>
                <li>
                  <ShieldCheck size={20} />
                  Acceso gratuito durante el lanzamiento
                </li>
              </>
            )}
          </ul>
        </div>
        <p>
          {business
            ? "Comercios y conductores, más cerca."
            : "Hecho para quienes mueven Panamá."}
        </p>
      </aside>
      <main className="rp-auth-form">
        <div className="rp-auth-inner">
          <Link className="rp-text-link" href="/">
            ← Volver a RidePerks
          </Link>
          {mode !== "recover" && (
            <nav className="rp-access-switch" aria-label="Tipo de acceso">
              <Link
                href={mode === "register" ? "/register" : "/login"}
                aria-current={!business ? "page" : undefined}
              >
                <CarFront size={18} />
                Conductor
              </Link>
              <Link
                href={
                  mode === "register" ? "/business/register" : "/business/login"
                }
                aria-current={business ? "page" : undefined}
              >
                <Store size={18} />
                Comercio
              </Link>
            </nav>
          )}
          <h1>{title}</h1>
          <p className="rp-muted">{description}</p>
          {error && (
            <p role="alert" className="rp-error mb-5">
              El enlace venció o ya fue utilizado. Inicia sesión o solicita uno
              nuevo.
            </p>
          )}
          <AuthForm
            mode={mode}
            next={next || (business ? "/business" : "/driver/dashboard")}
            audience={audience}
          />
          <div className="rp-auth-footer">
            {mode === "login" ? (
              <>
                <span className="rp-muted">
                  {business
                    ? "¿Tu comercio aún no tiene cuenta?"
                    : "¿Primera vez por aquí?"}
                </span>
                <Link
                  className="rp-text-link"
                  href={business ? "/business/register" : "/register"}
                >
                  {business
                    ? "Registrar responsable →"
                    : "Crear cuenta gratis →"}
                </Link>
              </>
            ) : (
              <Link className="rp-text-link" href={loginPath}>
                Ya tengo una cuenta. Iniciar sesión →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
