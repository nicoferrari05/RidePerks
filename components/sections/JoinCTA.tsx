import Link from "next/link";
import PillLink from "@/components/landing/PillLink";

export default function JoinCTA() {
  return (
    <section id="unete" className="scroll-mt-24 px-5 pb-16 sm:px-6 sm:pb-28">
      <div
        data-reveal
        className="mx-auto flex max-w-7xl flex-col items-center rounded-[28px] border border-lp-line bg-lp-surface px-6 py-14 text-center sm:rounded-[36px] sm:px-7 sm:py-24"
      >
        <h2 className="text-balance text-[clamp(2.25rem,6vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.04em]">
          Crea tu cuenta gratis.
        </h2>
        <div className="mt-8 flex w-full flex-col items-center gap-2 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
          <PillLink href="/register" className="w-full max-w-xs sm:w-auto">
            Crear mi cuenta
          </PillLink>
          <Link
            href="/login"
            className="rounded-full px-5 py-3 text-[15px] font-medium text-lp-muted underline-offset-4 transition-[color,transform] duration-[160ms] ease-snappy hover:text-lp-fg hover:underline active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lp-fg"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}
