import Link from "next/link";

export default function JoinCTA() {
  return (
    <section id="unete" className="scroll-mt-20 bg-navy px-6 py-14 sm:py-28">
      <div
        data-reveal
        className="mx-auto flex max-w-6xl flex-col items-start gap-10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="max-w-md">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            EMPIEZA HOY
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            Crea tu cuenta y verifica tu perfil.
          </h2>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-bone/60">
            El registro es gratis. Si estabas en la lista de espera, usa el
            mismo correo.
          </p>
        </div>
        <Link
          href="/register"
          className="cursor-pointer rounded-full bg-ember px-8 py-4 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
        >
          Crear mi cuenta gratis
        </Link>
      </div>
    </section>
  );
}
