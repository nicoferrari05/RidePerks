import Link from "next/link";
import { Fuel, Ticket, ShieldCheck } from "lucide-react";
import { Logo } from "./ui";
import { AuthForm } from "./Forms";
import "@/app/platform.css";
export default function AuthPage({
  mode,
  next,
  error,
}: {
  mode: "login" | "register" | "recover";
  next?: string;
  error?: boolean;
}) {
  const title =
    mode === "login"
      ? "Qué bueno verte de vuelta."
      : mode === "register"
        ? "Tu próximo ahorro empieza aquí."
        : "Recupera tu acceso.";
  const description =
    mode === "login"
      ? "Entra a tu cuenta y encuentra los beneficios para tu próxima parada."
      : mode === "register"
        ? "Crea tu cuenta gratis. Si estabas en la lista de espera, usa el mismo correo."
        : "Te enviaremos un enlace para elegir una nueva contraseña.";
  return (
    <div className="rp-app rp-auth">
      <aside className="rp-auth-story">
        <div>
          <Logo />
        </div>
        <div>
          <h2>Lo que ganas, que te rinda más.</h2>
          <p>
            Un solo lugar para los beneficios que acompañan tu día al volante.
          </p>
          <ul>
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
          </ul>
        </div>
        <p>Hecho para quienes mueven Panamá.</p>
      </aside>
      <main className="rp-auth-form">
        <div className="rp-auth-inner">
          <Link className="rp-text-link" href="/">
            ← Volver a RidePerks
          </Link>
          <h1>{title}</h1>
          <p className="rp-muted">{description}</p>
          {error && (
            <p role="alert" className="rp-error mb-5">
              El enlace venció o ya fue utilizado. Inicia sesión o solicita uno
              nuevo.
            </p>
          )}
          <AuthForm mode={mode} next={next} />
          <div className="rp-auth-footer">
            {mode === "login" ? (
              <>
                <span className="rp-muted">¿Primera vez por aquí?</span>
                <Link className="rp-text-link" href="/register">
                  Crear cuenta gratis →
                </Link>
              </>
            ) : (
              <Link className="rp-text-link" href="/login">
                Ya tengo una cuenta. Iniciar sesión →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
