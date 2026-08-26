import WaitlistForm from "@/components/WaitlistForm";
import Counter from "@/components/Counter";

export default function FinalCTA() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div data-reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
          Sé de los primeros.
        </h2>
        <p className="mt-4 text-lg text-mute">
          Sin costo. Sin compromiso. Solo te avisamos cuando abramos.
        </p>
        <div className="mt-8 w-full max-w-xl">
          <WaitlistForm />
        </div>
        <div className="mt-6">
          <Counter />
        </div>
      </div>
    </section>
  );
}
