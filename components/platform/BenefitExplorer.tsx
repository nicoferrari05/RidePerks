"use client";
import { useState, useEffect } from "react";
import { categories } from "@/lib/platform/types";
import { BenefitCard, Empty, type CatalogBenefit } from "./ui";
export default function BenefitExplorer({
  benefits,
  initialCategory,
}: {
  benefits: CatalogBenefit[];
  initialCategory: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  useEffect(() => {
    const sync = () =>
      setCategory(new URL(location.href).searchParams.get("category") || "");
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  function select(value: string) {
    setCategory(value);
    const url = new URL(location.href);
    url.searchParams.delete("q");
    if (value) url.searchParams.set("category", value);
    else url.searchParams.delete("category");
    window.history.replaceState(null, "", url);
  }
  const visible = benefits.filter((b) => !category || b.category === category);
  return (
    <>
      <div
        className="rp-category-chips"
        role="group"
        aria-label="Filtrar beneficios por categoría"
      >
        {[["", "Todas"], ...Object.entries(categories)].map(
          ([value, label]) => (
            <button
              type="button"
              key={value}
              className={"rp-category-chip " + (value || "salud")}
              aria-pressed={category === value}
              onClick={() => select(value)}
            >
              {label}
            </button>
          ),
        )}
      </div>
      <p className="rp-muted" aria-live="polite">
        {visible.length}{" "}
        {visible.length === 1
          ? "beneficio disponible"
          : "beneficios disponibles"}
      </p>
      {visible.length ? (
        <div className="rp-grid">
          {visible.map((b) => (
            <BenefitCard key={b.id} benefit={b} />
          ))}
        </div>
      ) : (
        <Empty
          title={
            benefits.length
              ? "Sin beneficios en esta categoría"
              : "Los próximos beneficios estarán aquí"
          }
        >
          <p>
            {benefits.length
              ? "Selecciona otra categoría para explorar más beneficios."
              : "Aquí aparecerán los beneficios confirmados de nuestros comercios aliados."}
          </p>
        </Empty>
      )}
    </>
  );
}
