import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import LogoMark from "@/components/LogoMark";
import PillLink from "@/components/landing/PillLink";
import FlutedGlassBackdrop from "@/components/ui/fluted-glass-backdrop";

// The landing's footer, adapted from the 21st.dev "footer-section-5" the
// user supplied: a giant outlined wordmark sinking into a colored panel
// with a fluted-glass shader. Brand version: the panel is the yellow-green
// (#85CB33) with black text, and it also carries the page's last call to
// action (#unete, which MobileCTA watches) and the contact button.

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

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-fg";

export default function FooterSection5({ contactEmail }: { contactEmail: string }) {
  return (
    <footer className="relative w-full overflow-hidden bg-lp-bg antialiased">
      {/* The giant outlined wordmark; its bottom sinks behind the panel. */}
      <div
        aria-hidden="true"
        className="relative z-0 flex w-full items-end justify-center pt-20 sm:pt-28"
      >
        <p className="lp-outline whitespace-nowrap text-[clamp(4.2rem,16vw,16rem)] font-semibold leading-[0.75] tracking-[-0.05em] -mb-[0.08em]">
          RIDEPERKS
        </p>
      </div>

      <div className="relative z-10 w-full bg-lp-accent text-lp-accent-fg">
        <FlutedGlassBackdrop />

        <div
          id="unete"
          className="relative z-10 mx-auto flex max-w-7xl scroll-mt-24 flex-col justify-between gap-14 px-6 pb-10 pt-16 sm:px-10 md:pt-24 lg:flex-row lg:gap-8 lg:px-16"
        >
          {/* Left: the last call to action and how to reach us. */}
          <div className="flex max-w-md flex-col">
            <LogoMark variant="text" size="md" className="self-start" />
            <h2 className="mt-6 text-balance text-[clamp(2.5rem,5.5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.045em]">
              Crea tu cuenta gratis.
            </h2>
            <p className="mt-4 max-w-sm text-pretty text-[17px] text-lp-fg/75">
              Un minuto para entrar. Pagas solo cuando quieras usar los
              beneficios.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PillLink href="/register" variant="dark">
                Crear mi cuenta
              </PillLink>
              <a
                href={"mailto:" + contactEmail}
                className={
                  "inline-flex items-center gap-2 rounded-full border border-lp-fg/25 bg-white/20 px-5 py-3.5 text-[15px] font-semibold transition-[transform,background-color,border-color] duration-[160ms] ease-snappy hover:border-lp-fg/50 hover:bg-white/35 active:scale-[0.97] " +
                  focusRing
                }
              >
                <Mail size={18} strokeWidth={2} aria-hidden="true" />
                Contáctanos
              </a>
            </div>
            <a
              href="https://www.instagram.com/rideperks/"
              target="_blank"
              rel="noreferrer"
              aria-label="RidePerks en Instagram"
              className={
                "mt-10 flex h-11 w-11 items-center justify-center rounded-full border border-lp-fg/25 transition-[transform,background-color,border-color] duration-[160ms] ease-snappy hover:border-lp-fg/50 hover:bg-white/25 active:scale-[0.94] " +
                focusRing
              }
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>

          {/* Right: the site's links. */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 sm:gap-x-16 lg:gap-x-20">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-lg font-semibold tracking-[-0.01em]">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-1">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={
                          "inline-block py-1.5 text-[15px] font-medium text-lp-fg/70 transition-colors duration-150 hover:text-lp-fg " +
                          focusRing
                        }
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

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 border-t border-lp-fg/15 px-6 py-6 sm:flex-row sm:items-center sm:px-10 lg:px-16">
          <p className="font-mono text-xs tracking-wide text-lp-fg/70">
            © 2026 RIDEPERKS · PANAMÁ
          </p>
          <p className="font-mono text-xs tracking-wide text-lp-fg/70">
            HECHO PARA QUIENES MANEJAN
          </p>
        </div>
      </div>
    </footer>
  );
}
