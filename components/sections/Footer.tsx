import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import LogoMark from "@/components/LogoMark";

const COLUMNS = [
  {
    title: "Club",
    links: [
      { label: "Beneficios", href: "/#beneficios" },
      { label: "Cómo funciona", href: "/#como-funciona" },
      { label: "La app", href: "/#app" },
      { label: "Planes", href: "/#planes" },
      { label: "Nosotros", href: "/about" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { label: "Crear cuenta", href: "/register" },
      { label: "Iniciar sesión", href: "/login" },
      { label: "Comercios", href: "/business/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos de uso", href: "/terminos" },
      { label: "Privacidad", href: "/privacidad" },
    ],
  },
];

// "Contáctanos" writes to the same support inbox as the platform's Ayuda
// screen (SUPPORT_EMAIL), or the brand address if it isn't set.
const CONTACT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@rideperks.app";

export default function Footer() {
  return (
    <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="mx-auto max-w-[1400px] rounded-[28px] bg-lp-band px-6 pb-8 pt-12 text-lp-band-fg sm:rounded-[32px] sm:px-10 sm:pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 sm:gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <LogoMark variant="text" size="md" />
            <div className="mt-6 flex items-center gap-3">
              <a
                href={"mailto:" + CONTACT_EMAIL}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-lp-pill px-5 text-[15px] font-semibold text-lp-pill-fg transition-transform duration-[160ms] ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-band-fg"
              >
                <Mail size={18} strokeWidth={2} aria-hidden="true" />
                Contáctanos
              </a>
              <a
                href="https://www.instagram.com/rideperks/"
                target="_blank"
                rel="noreferrer"
                aria-label="RidePerks en Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-lp-band-line text-lp-band-fg/80 transition-[color,border-color,transform] duration-[160ms] ease-snappy hover:border-lp-band-fg active:scale-[0.94] hover:text-lp-band-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-band-fg"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="font-mono text-[11px] tracking-[0.14em] text-lp-band-muted">
                  {column.title.toUpperCase()}
                </p>
                <ul className="mt-3 flex flex-col gap-0.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block py-1.5 text-[15px] text-lp-band-fg/70 transition-colors duration-150 hover:text-lp-band-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-band-fg"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-lp-band-line pt-6 sm:mt-14 sm:flex-row sm:items-center">
          <p className="font-mono text-xs tracking-wide text-lp-band-muted">
            © 2026 RIDEPERKS · PANAMÁ
          </p>
          <p className="font-mono text-xs tracking-wide text-lp-band-muted">
            HECHO PARA QUIENES MANEJAN
          </p>
        </div>
      </div>
    </footer>
  );
}
