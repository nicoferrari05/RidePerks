export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold tracking-tight text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          RIDE<span className="text-ember">PERKS</span>
        </a>
        <a
          href="#waitlist"
          className="cursor-pointer rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          Únete
        </a>
      </div>
    </nav>
  );
}
