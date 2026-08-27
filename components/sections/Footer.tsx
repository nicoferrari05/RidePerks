// Stacked, centered footer — same idea as the popular shadcn
// "stacked-circular-footer" community component, ported by hand into this
// project's own tokens/icons (no Radix/shadcn primitives, matching how
// the rest of the site is built — see components/ui/canvas-reveal-effect.tsx
// for the same porting approach). The generic "Subscribe" email field was
// dropped in favor of a link straight into the waitlist section already
// on the page, so there's only one signup flow instead of two.
import Link from "next/link";
import { InstagramIcon } from "@/components/icons";

const FOOTER_LINKS = [
  { label: "Inicio", href: "/#top" },
  { label: "Beneficios", href: "/#beneficios" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Planes", href: "/#planes" },
  { label: "Nosotros", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy px-6 py-16 text-bone">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="mb-8 text-lg font-bold tracking-tight">
          RIDE<span className="text-ember">PERKS</span>
        </span>

        <nav className="mb-8 flex flex-wrap justify-center gap-x-7 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-bone/70 transition-colors duration-150 ease-out hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://www.instagram.com/rideperks/"
          target="_blank"
          rel="noreferrer"
          aria-label="RidePerks en Instagram"
          className="mb-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-bone/80 transition-colors duration-150 ease-out hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <InstagramIcon className="h-5 w-5" />
        </a>

        <Link
          href="/#waitlist"
          className="mb-10 cursor-pointer rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
        >
          Únete a la lista
        </Link>

        <p className="font-mono text-xs tracking-wide text-bone/40">© 2026 RIDEPERKS · PANAMÁ</p>
      </div>
    </footer>
  );
}
