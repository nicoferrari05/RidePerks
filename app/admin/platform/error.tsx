"use client";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import "../../platform.css";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="rp-app">
      <main className="rp-main rp-stack">
        <div className="rp-empty">
          <TriangleAlert size={30} aria-hidden="true" />
          <h2>No pudimos cargar la plataforma</h2>
          <p className="rp-muted">
            Revisa la conexión y que la migración de Supabase esté aplicada.
          </p>
          <div className="rp-actions" style={{ justifyContent: "center" }}>
            <button className="rp-button" onClick={reset}>
              Volver a intentar
            </button>
            <Link className="rp-button secondary" href="/admin">
              Ir a la lista de espera
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
