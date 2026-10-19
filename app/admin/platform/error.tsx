"use client";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import "../../platform.css";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
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
            <Button size="lg" onClick={reset}>
              Volver a intentar
            </Button>
            <Link
              className={buttonVariants({ variant: "secondary", size: "md" })}
              href="/admin"
            >
              Ir a la lista de espera
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
