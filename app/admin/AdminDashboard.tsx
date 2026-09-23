"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Heading, Empty } from "@/components/platform/ui";

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
    // Loads remote data on mount; subsequent updates are asynchronous.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <>
      <Heading title="Lista de espera">
        Conductores que se anotaron antes del lanzamiento y sus referidos.
      </Heading>

      {error && (
        <p className="rp-error" role="alert">
          {error}
        </p>
      )}

      <dl className="rp-metrics">
        <div>
          <dt>Total en lista</dt>
          <dd>{stats.total}</dd>
        </div>
        <div>
          <dt>Verificados</dt>
          <dd>{stats.verified}</dd>
        </div>
        <div>
          <dt>Pendientes</dt>
          <dd>{stats.pending}</dd>
        </div>
        <div>
          <dt>Referidos totales</dt>
          <dd>{stats.referrals}</dd>
        </div>
      </dl>

      <div className="rp-actions">
        {(["uber", "indrive", "pedidosya", "multiple", "none"] as const).map((p) => (
          <span key={p} className="rp-badge">
            {p === "none" ? "Sin especificar" : PLATFORM_LABEL[p]}
            <strong>{platformCounts[p] ?? 0}</strong>
          </span>
        ))}
      </div>

      <section className="rp-panel rp-stack">
        <h2>Contador público: {showCounter ? "visible" : "oculto"}</h2>
        <p className="rp-muted">
          Muestra u oculta el número de conductores en la página principal.
        </p>
        <button
          type="button"
          className="rp-button secondary"
          onClick={toggleCounter}
          disabled={showCounter === null}
          aria-pressed={showCounter ?? false}
        >
          {showCounter ? "Ocultar contador" : "Mostrar contador"}
        </button>
      </section>

      <div className="rp-stack rp-waitlist-tools">
        <div className="rp-field">
          <label htmlFor="search">Buscar</label>
          <input
            id="search"
            type="search"
            placeholder="Nombre, correo o WhatsApp"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <FilterGroup
          label="Plataforma"
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
          label="Estado"
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

      {entries === null ? (
        <div className="rp-skeleton" aria-label="Cargando" />
      ) : filtered.length === 0 ? (
        <Empty title={entries.length ? "Sin resultados" : "No hay conductores todavía"}>
          <p>
            {entries.length
              ? "Prueba con otra búsqueda o quita los filtros."
              : "Las inscripciones de la lista de espera aparecerán aquí."}
          </p>
        </Empty>
      ) : (
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Plataforma</th>
                <th>WhatsApp</th>
                <th>Referidos</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td data-label="#" className="rp-table-pos">
                    {entry.position}
                  </td>
                  <td data-label="Nombre" className="rp-table-name">
                    {entry.full_name}
                  </td>
                  <td data-label="Correo">
                    <a href={`mailto:${entry.email}`}>{entry.email}</a>
                  </td>
                  <td data-label="Plataforma">
                    {entry.platform ? PLATFORM_LABEL[entry.platform] : <span className="rp-muted">-</span>}
                  </td>
                  <td data-label="WhatsApp">
                    {entry.whatsapp ? (
                      <a href={waLink(entry.whatsapp)} target="_blank" rel="noreferrer">
                        {entry.whatsapp}
                      </a>
                    ) : (
                      <span className="rp-muted">-</span>
                    )}
                  </td>
                  <td data-label="Referidos">
                    {entry.referral_count > 0 ? (
                      <span className="rp-badge good">{entry.referral_count}</span>
                    ) : (
                      <span className="rp-muted">0</span>
                    )}
                  </td>
                  <td data-label="Fecha" className="rp-table-date">
                    {formatDate(entry.created_at)}
                  </td>
                  <td data-label="Estado">
                    <label className="sr-only" htmlFor={`status-${entry.id}`}>
                      Estado de {entry.full_name}
                    </label>
                    <span className="rp-status-select" data-status={entry.status}>
                      <select
                        id={`status-${entry.id}`}
                        value={entry.status}
                        onChange={(e) => updateStatus(entry.id, e.target.value as EntryStatus)}
                      >
                        <option value="pending">{STATUS_LABEL.pending}</option>
                        <option value="verified">{STATUS_LABEL.verified}</option>
                        <option value="rejected">{STATUS_LABEL.rejected}</option>
                      </select>
                      <ChevronDown size={14} aria-hidden="true" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="rp-subnav" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" onClick={() => onChange(v)} aria-pressed={value === v}>
          {text}
        </button>
      ))}
    </div>
  );
}
