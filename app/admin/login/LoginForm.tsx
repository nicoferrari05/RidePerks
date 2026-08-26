"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Contraseña incorrecta.");
        setLoading(false);
        return;
      }
      const next = searchParams.get("next") || "/admin";
      router.replace(next);
      router.refresh();
    } catch {
      setError("No pudimos conectar. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-3xl border border-white/10 bg-navy-2 p-8 shadow-2xl"
    >
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold tracking-tight text-bone">
        RIDE<span className="text-ember">PERKS</span>
      </div>
      <h1 className="text-xl font-semibold text-bone">Panel de administración</h1>
      <p className="mt-1 text-sm text-bone/60">Ingresa la contraseña para ver la lista de espera.</p>

      <label htmlFor="password" className="sr-only">
        Contraseña
      </label>
      <input
        id="password"
        type="password"
        required
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        className="mt-6 w-full rounded-xl border border-white/10 bg-navy px-4 py-3 text-bone placeholder:text-bone/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember"
      />

      {error && (
        <p className="mt-3 text-sm text-ember" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full cursor-pointer rounded-xl bg-ember px-4 py-3 font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
