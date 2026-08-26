"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Platform = "uber" | "indrive" | "pedidosya" | "multiple";
type EntryStatus = "pending" | "verified" | "rejected";

type Entry = {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  platform: Platform | null;
  status: EntryStatus;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  position: number;
  created_at: string;
};

const STATUS_LABEL: Record<EntryStatus, string> = {
  pending: "Pendiente",
  verified: "Verificado",
  rejected: "Rechazado",
};

const STATUS_STYLE: Record<EntryStatus, string> = {
  pending: "bg-bone-2 text-mute",
  verified: "bg-verde/15 text-verde",
  rejected: "bg-ember-soft text-ember-2",
};

const PLATFORM_LABEL: Record<Platform, string> = {
  uber: "Uber",
  indrive: "InDrive",
  pedidosya: "PedidosYa",
  multiple: "Varias",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-PA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function waLink(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [showCounter, setShowCounter] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform | "none">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | EntryStatus>("all");
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setError(null);
    try {
      const [entriesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/entries"),
        fetch("/api/admin/settings"),
      ]);
      if (entriesRes.status === 401 || settingsRes.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const entriesData = await entriesRes.json();
      const settingsData = await settingsRes.json();
      setEntries(entriesData.entries ?? []);
      setShowCounter(Boolean(settingsData.showCounter));
    } catch {
      // Network-level failure (fetch itself rejected, e.g. Supabase env vars
      // misconfigured). Fall back to empty state instead of spinning forever.
      setEntries((prev) => prev ?? []);
      setShowCounter((prev) => prev ?? false);
      setError("No pudimos cargar los datos. Revisa la configuración de Supabase.");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id: string, status: EntryStatus) {
    const previous = entries;
    setEntries((prev) => prev?.map((e) => (e.id === id ? { ...e, status } : e)) ?? prev);
    const res = await fetch("/api/admin/entries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) setEntries(previous);
  }

  async function toggleCounter() {
    if (showCounter === null) return;
    const next = !showCounter;
    setShowCounter(next);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showCounter: next }),
    });
    if (!res.ok) setShowCounter(!next);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (platformFilter === "none" && e.platform) return false;
      if (platformFilter !== "all" && platformFilter !== "none" && e.platform !== platformFilter)
        return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (
        q &&
        !e.full_name.toLowerCase().includes(q) &&
        !e.email.toLowerCase().includes(q) &&
        !(e.whatsapp ?? "").includes(q)
      )
        return false;
      return true;
    });
  }, [entries, query, platformFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: entries?.length ?? 0,
      verified: entries?.filter((e) => e.status === "verified").length ?? 0,
      pending: entries?.filter((e) => e.status === "pending").length ?? 0,
      referrals: entries?.reduce((sum, e) => sum + (e.referral_count ?? 0), 0) ?? 0,
    }),
    [entries]
  );

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { uber: 0, indrive: 0, pedidosya: 0, multiple: 0, none: 0 };
    for (const e of entries ?? []) {
      counts[e.platform ?? "none"] = (counts[e.platform ?? "none"] ?? 0) + 1;
    }
    return counts;
  }, [entries]);

  return (
    <main className="min-h-screen bg-paper pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-6 py-4 backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold tracking-tight text-bone">
          RIDE<span className="text-ember">PERKS</span>
          <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-widest text-bone/70">
            ADMIN
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-medium text-navy transition-colors duration-150 hover:bg-bone-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember"
        >
          Cerrar sesión
        </button>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-8">
        {error && (
          <p className="mb-4 rounded-xl bg-ember-soft px-4 py-3 text-sm text-ember-2">{error}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total en lista" value={stats.total} />
          <StatCard label="Verificados" value={stats.verified} tone="verde" />
          <StatCard label="Pendientes" value={stats.pending} />
          <StatCard label="Referidos totales" value={stats.referrals} tone="ember" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-mute">
          {(["uber", "indrive", "pedidosya", "multiple", "none"] as const).map((p) => (
            <span key={p} className="rounded-full border border-line bg-white px-3 py-1.5">
              {p === "none" ? "Sin especificar" : PLATFORM_LABEL[p]}{" "}
              <span className="font-mono font-semibold text-navy">{platformCounts[p] ?? 0}</span>
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-navy">Contador público</p>
            <p className="text-sm text-mute">
              Muestra u oculta el número de conductores en la página principal.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={showCounter ?? false}
            aria-label="Mostrar contador público"
            onClick={toggleCounter}
            disabled={showCounter === null}
            className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-wait ${
              showCounter ? "bg-verde" : "bg-line"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                showCounter ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="sr-only" htmlFor="search">
            Buscar
          </label>
          <input
            id="search"
            type="search"
            placeholder="Buscar por nombre, email o WhatsApp…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            <FilterGroup
              value={platformFilter}
              onChange={setPlatformFilter}
              options={[
                ["all", "Todas"],
                ["uber", "Uber"],
                ["indrive", "InDrive"],
                ["pedidosya", "PedidosYa"],
                ["multiple", "Varias"],
                ["none", "Sin especificar"],
              ]}
            />
            <FilterGroup
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                ["all", "Todos"],
                ["pending", "Pendiente"],
                ["verified", "Verificado"],
                ["rejected", "Rechazado"],
              ]}
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-mute">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Plataforma</th>
                <th className="px-5 py-3 font-medium">WhatsApp</th>
                <th className="px-5 py-3 font-medium">Referidos</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {entries === null && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-mute">
                    Cargando…
                  </td>
                </tr>
              )}
              {entries !== null && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-mute">
                    No hay conductores todavía.
                  </td>
                </tr>
              )}
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-line last:border-none">
                  <td className="px-5 py-3.5 font-mono text-xs text-mute">{entry.position}</td>
                  <td className="px-5 py-3.5 font-medium text-navy">{entry.full_name}</td>
                  <td className="px-5 py-3.5">
                    <a
                      href={`mailto:${entry.email}`}
                      className="text-ink underline decoration-line underline-offset-4 hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember"
                    >
                      {entry.email}
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-ink">
                    {entry.platform ? PLATFORM_LABEL[entry.platform] : <span className="text-mute">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {entry.whatsapp ? (
                      <a
                        href={waLink(entry.whatsapp)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[13px] text-navy underline decoration-line underline-offset-4 hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember"
                      >
                        {entry.whatsapp}
                      </a>
                    ) : (
                      <span className="text-mute">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {entry.referral_count > 0 ? (
                      <span className="rounded-full bg-ember-soft px-2.5 py-1 font-mono text-xs font-semibold text-ember-2">
                        {entry.referral_count}
                      </span>
                    ) : (
                      <span className="text-mute">0</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-mute">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <label className="sr-only" htmlFor={`status-${entry.id}`}>
                      Estado de {entry.full_name}
                    </label>
                    <select
                      id={`status-${entry.id}`}
                      value={entry.status}
                      onChange={(e) => updateStatus(entry.id, e.target.value as EntryStatus)}
                      className={`cursor-pointer rounded-full border-none px-3 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember ${STATUS_STYLE[entry.status]}`}
                    >
                      <option value="pending">{STATUS_LABEL.pending}</option>
                      <option value="verified">{STATUS_LABEL.verified}</option>
                      <option value="rejected">{STATUS_LABEL.rejected}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "verde" | "ember" }) {
  const toneClass = tone === "verde" ? "text-verde" : tone === "ember" ? "text-ember" : "text-navy";
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-mute">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function FilterGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full border border-line bg-white p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember ${
            value === v ? "bg-navy text-bone" : "text-mute hover:text-navy"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
