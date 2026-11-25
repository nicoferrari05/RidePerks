"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Key = "inicio" | "beneficios" | "como" | "app" | "planes" | "nosotros";

// Site header (landing and About): logo, the pill of section links with a
// sliding indicator, Comercios and Iniciar sesión. Once the page scrolls it
// becomes a white tab so its text never sits on the content underneath. No
// backdrop blur: the hero behind it is animated.
const LINKS: { href: string; label: string; key: Key; section?: string }[] = [
  { href: "#top", label: "Inicio", key: "inicio", section: "top" },
  { href: "#beneficios", label: "Beneficios", key: "beneficios", section: "beneficios" },
  { href: "#como-funciona", label: "Cómo funciona", key: "como", section: "como-funciona" },
  { href: "#app", label: "La app", key: "app", section: "app" },
  { href: "#planes", label: "Planes", key: "planes", section: "planes" },
  { href: "/about", label: "Nosotros", key: "nosotros" },
];

const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";

export default function SiteNav() {
  const pathname = usePathname();
  const home = pathname === "/";
  // Section anchors work in place on the home page; elsewhere they lead home.
  const to = (href: string) => (href.startsWith("#") && !home ? "/" + href : href);
  const [active, setActive] = useState<Key>(pathname.startsWith("/about") ? "nosotros" : "inicio");
  const [scrolled, setScrolled] = useState(false);
  const links = useRef<Partial<Record<Key, HTMLAnchorElement | null>>>({});
  const indicator = useRef<HTMLSpanElement>(null);
  // After a click, ignore the scroll spy until the smooth scroll settles.
  const lockUntil = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!home) return;
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
  }, [home]);

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
        pill.style.transition = "transform 300ms " + EASE + ", width 300ms " + EASE;
      });
    const ro = new ResizeObserver(place);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [active]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 py-1.5 pl-4 pr-1.5 sm:pl-5">
        <span
          aria-hidden="true"
          className={
            "rpx-tab pointer-events-none absolute inset-0 rounded-full transition-[opacity,scale] duration-300 ease-snappy " +
            (scrolled ? "scale-100 opacity-100" : "scale-[0.98] opacity-0")
          }
        />
        <Link
          href={home ? "#top" : "/"}
          aria-label="RidePerks, inicio"
          onClick={() => setActive("inicio")}
          className="pointer-events-auto relative shrink-0 rounded-md text-[var(--ink)] transition-[transform,opacity] duration-[160ms] ease-snappy hover:opacity-75 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
        >
          <span className="rpx-lockup h-[22px] sm:h-[25px]" />
        </Link>

        <nav
          aria-label="Principal"
          className={
            "pointer-events-auto relative hidden items-center rounded-full p-1 transition-[background-color,border-color,box-shadow] duration-300 lg:flex " +
            (scrolled ? "border border-transparent" : "rpx-glass")
          }
        >
          <span
            ref={indicator}
            aria-hidden="true"
            className="absolute bottom-1 left-0 top-1 rounded-full bg-[var(--ink)] opacity-0 shadow-[0_4px_14px_-6px_rgba(11,18,32,0.6)]"
          />
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={to(link.href)}
              ref={(el) => {
                links.current[link.key] = el;
              }}
              onClick={() => {
                lockUntil.current = Date.now() + 1200;
                setActive(link.key);
              }}
              aria-current={link.key === active ? "page" : undefined}
              className={
                "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-[color,transform] duration-[160ms] ease-snappy active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] " +
                (link.key === active ? "text-white" : "text-[var(--ink)]/65 hover:text-[var(--ink)]")
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
              "hidden rounded-full px-4 py-2 text-sm font-medium text-[var(--ink)] transition-transform duration-[160ms] ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] md:inline-flex " +
              (scrolled ? "border border-transparent" : "rpx-glass")
            }
          >
            Comercios
          </Link>
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-[var(--iris)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(0,102,204,0.9)] transition-[transform,opacity] duration-[160ms] ease-snappy hover:opacity-90 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] sm:px-5 sm:text-sm"
          >
            <span className="sm:hidden">Entrar</span>
            <span className="hidden sm:inline">Iniciar sesión</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
