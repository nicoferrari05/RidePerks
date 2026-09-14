import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export default function Nav() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-line/70 bg-paper/85 px-2.5 py-2 shadow-[0_8px_30px_-12px_rgba(4,20,41,0.25)] backdrop-blur-md sm:px-3 sm:py-2.5">
        <Link
          href="/#top"
          className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <LogoMark
            size="sm"
            className="px-2.5 py-1 text-sm sm:px-3 sm:py-1.5 sm:text-base"
          />
        </Link>
        <div className="flex items-center gap-1 min-[390px]:gap-2 sm:gap-5">
          <Link
            href="/business/login"
            className="hidden min-[390px]:inline text-sm font-medium text-ink/80 hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            Comercios
          </Link>
          <Link
            href="/about"
            className="hidden sm:inline text-sm font-medium text-ink/70 transition-colors duration-150 ease-out hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            Nosotros
          </Link>
          <Link
            href="/login"
            className="shrink-0 cursor-pointer rounded-full bg-ember px-3.5 py-2 text-[13px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>
    </div>
  );
}
