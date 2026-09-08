"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="p-8">
      <h1>No pudimos cargar el portal.</h1>
      <button className="rp-button mt-4" onClick={reset}>
        Volver a intentar
      </button>
    </main>
  );
}
