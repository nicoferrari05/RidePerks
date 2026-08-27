import Link from "next/link";

export default function Nav() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav className="pointer-events-auto flex w-full max-w-3xl items-center justify-between rounded-full border border-line/70 bg-paper/85 px-3 py-2.5 shadow-[0_8px_30px_-12px_rgba(4,20,41,0.25)] backdrop-blur-md">
        <Link
          href="/#top"
          className="inline-flex items-center rounded-full bg-navy px-4 py-2 text-sm font-bold tracking-tight text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <span>
            RIDE<span className="text-ember">PERKS</span>
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="/about"
            className="text-sm font-medium text-ink/70 transition-colors duration-150 ease-out hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            Nosotros
          </Link>
          <Link
            href="/#waitlist"
            className="cursor-pointer rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Únete
          </Link>
        </div>
      </nav>
    </div>
  );
}
