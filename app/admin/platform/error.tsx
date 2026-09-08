"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="p-8">
      <h1>No pudimos cargar la plataforma.</h1>
      <p>Revisa la conexión y que la migración esté aplicada.</p>
      <button className="mt-4 underline" onClick={reset}>
        Volver a intentar
      </button>
    </main>
  );
}
