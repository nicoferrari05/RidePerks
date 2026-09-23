import { Plus } from "lucide-react";

const QUESTIONS = [
  {
    q: "¿Cuánto cuesta?",
    a: "Crear la cuenta es gratis. La membresía cuesta $15 al mes y se paga con Yappy. Tú decides cuándo renovar; no hay cargos automáticos.",
  },
  {
    q: "¿Qué necesito para usar los beneficios?",
    a: "Una cuenta verificada y la membresía activa. Para verificarte, subes una captura de tu perfil de conductor y el equipo la revisa.",
  },
  {
    q: "Trabajo en varias plataformas, ¿puedo unirme?",
    a: "Sí. RidePerks es para cualquier conductor o repartidor en Panamá, sin importar en qué plataforma trabajes.",
  },
  {
    q: "¿Cuánto le cuesta a un comercio?",
    a: "Nada. El comercio propone su beneficio, nosotros lo revisamos y, una vez publicado, valida los canjes desde su portal.",
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Tu captura de verificación es privada y se borra después de revisarla. Al canjear, el comercio solo ve tu nombre y el beneficio.",
  },
];

export default function AboutFAQ() {
  return (
    <section className="px-5 pb-20 sm:px-6 sm:pb-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.4fr]">
        <h2
          data-reveal
          className="text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]"
        >
          Preguntas frecuentes.
        </h2>
        <div data-reveal className="divide-y divide-lp-line border-y border-lp-line">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium transition-opacity duration-150 hover:opacity-75 [&::-webkit-details-marker]:hidden">
                {q}
                <Plus
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="shrink-0 transition-transform duration-200 ease-snappy group-open:rotate-45"
                />
              </summary>
              <p className="max-w-xl pb-6 text-[15px] leading-relaxed text-lp-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
