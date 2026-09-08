"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="rp-empty">
      <h1>No pudimos cargar esta página.</h1>
      <p className="rp-muted">
        Comprueba tu conexión e intenta nuevamente. Tus datos siguen guardados.
      </p>
      <button className="rp-button" onClick={reset}>
        Volver a intentar
      </button>
    </div>
  );
}
