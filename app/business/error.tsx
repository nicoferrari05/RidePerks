"use client";
import { Button } from "@/components/ui/button";
import "../platform.css";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="rp-app">
      <main className="rp-main">
        <div className="rp-empty">
          <h1>No pudimos cargar el portal.</h1>
          <p className="rp-muted">
            Comprueba tu conexión e intenta nuevamente.
          </p>
          <Button size="lg" onClick={reset}>
            Volver a intentar
          </Button>
        </div>
      </main>
    </div>
  );
}
