"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import LogoMark from "@/components/LogoMark";
import ThemeToggle from "@/components/landing/ThemeToggle";

type Key = "inicio" | "beneficios" | "como" | "planes" | "nosotros";

const LINKS: { href: string; label: string; key: Key; section?: string }[] = [
  { href: "/#top", label: "Inicio", key: "inicio", section: "top" },
  { href: "/#beneficios", label: "Beneficios", key: "beneficios", section: "beneficios" },
  { href: "/#como-funciona", label: "Cómo funciona", key: "como", section: "como-funciona" },
  { href: "/#planes", label: "Planes", key: "planes", section: "planes" },
  { href: "/about", label: "Nosotros", key: "nosotros" },
];

// On-screen movement: strong ease-in-out, kept under 300ms.
const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";

function keyFromLocation(pathname: string, hash: string): Key {
  if (pathname.startsWith("/about")) return "nosotros";
  return LINKS.find((l) => l.section && "#" + l.section === hash)?.key ?? "inicio";
}

export default function Nav() {
  const pathname = usePathname();
  const [active, setActive] = useState<Key>(
    pathname.startsWith("/about") ? "nosotros" : "inicio",
  );
  const links = useRef<Partial<Record<Key, HTMLAnchorElement | null>>>({});
  const indicator = useRef<HTMLSpanElement>(null);
  // After a click, ignore the scroll spy until the smooth scroll settles, so
  // the pill goes straight to the clicked link instead of visiting each
  // section it scrolls past.
  const lockUntil = useRef(0);
  // Once the page scrolls, the header becomes a solid glass tab so its text
  // never overlaps the content passing underneath.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // The hash only exists client-side; sync once after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(keyFromLocation(pathname, window.location.hash));
  }, [pathname]);

  // Scroll spy on the homepage sections.
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = LINKS.flatMap((l) => {
      const el = l.section ? document.getElementById(l.section) : null;
      return el ? [{ el, key: l.key }] : [];
    });
    const io = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntil.current) return;
        const hit = entries.find((e) => e.isIntersecting);
        const match = hit && sections.find((s) => s.el === hit.target);
        if (match) setActive(match.key);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s.el));
    return () => io.disconnect();
  }, [pathname]);

  // Move the shaded pill under the active link. Styles are written directly
  // (no state) so it animates on every change and snaps into place on load.
  useLayoutEffect(() => {
    const el = links.current[active];
    const pill = indicator.current;
    if (!el || !pill) return;
    const place = () => {
      pill.style.width = el.offsetWidth + "px";
      pill.style.transform = "translateX(" + el.offsetLeft + "px)";
      pill.style.opacity = "1";
    };
    place();
    if (!pill.dataset.ready)
      requestAnimationFrame(() => {
        pill.dataset.ready = "1";
        pill.style.transition =
          "transform 300ms " + EASE + ", width 300ms " + EASE;
      });
    const ro = new ResizeObserver(place);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [active]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 py-1.5 pl-4 pr-1.5 sm:pl-5">
        {/* The tab background fades and settles in on scroll (opacity and
            scale only), so nothing in the header shifts position. */}
        <span
          aria-hidden="true"
          className={
            "lp-tab pointer-events-none absolute inset-0 rounded-full transition-[opacity,scale] duration-300 ease-snappy " +
            (scrolled ? "scale-100 opacity-100" : "scale-[0.98] opacity-0")
          }
        />
        <Link
          href="/#top"
          aria-label="RidePerks, inicio"
          onClick={() => setActive("inicio")}
          className="pointer-events-auto relative shrink-0 rounded-md text-lp-fg transition-[transform,opacity] duration-[160ms] ease-snappy hover:opacity-75 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lp-fg"
        >
          <LogoMark variant="text" size="sm" className="sm:text-xl" />
        </Link>

        <nav
          aria-label="Principal"
          className={
            "pointer-events-auto relative hidden items-center rounded-full p-1 transition-[background-color,border-color,box-shadow] duration-300 lg:flex " +
            (scrolled ? "border border-transparent" : "lp-glass")
          }
        >
          <span
            ref={indicator}
            aria-hidden="true"
            className="absolute left-0 top-1 bottom-1 rounded-full bg-lp-pill opacity-0 shadow-[0_2px_10px_-4px_rgba(4,20,41,0.35)]"
          />
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              ref={(el) => {
                links.current[link.key] = el;
              }}
              onClick={() => {
                lockUntil.current = Date.now() + 1200;
                setActive(link.key);
              }}
              aria-current={link.key === active ? "page" : undefined}
              className={
                "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-[color,transform] duration-[160ms] ease-snappy active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lp-fg " +
                (link.key === active
                  ? "text-lp-pill-fg"
                  : "text-lp-fg/70 hover:text-lp-fg")
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="pointer-events-auto relative flex items-center gap-2">
          <Link
            href="/business/login"
            className={
              "hidden rounded-full px-4 py-2 text-sm font-medium text-lp-fg transition-transform duration-[160ms] ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lp-fg md:inline-flex " +
              (scrolled ? "border border-transparent" : "lp-glass")
            }
          >
            Comercios
          </Link>
          <div className="hidden min-[340px]:block">
            <ThemeToggle compact />
          </div>
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-lp-accent px-4 py-2.5 text-[13px] font-semibold text-lp-accent-fg transition-[transform,opacity] duration-[160ms] ease-snappy hover:opacity-90 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-fg sm:px-5 sm:text-sm"
          >
            <span className="sm:hidden">Entrar</span>
            <span className="hidden sm:inline">Iniciar sesión</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
