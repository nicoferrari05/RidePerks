"use client";
import dynamic from "next/dynamic";
import { located, type MapBusiness } from "@/lib/platform/map-area";

// Loaded only on the Comercios tab: the map library is large.
const BusinessMapView = dynamic(() => import("./BusinessMapView"), {
  ssr: false,
  loading: () => <div className="rp-map-frame" aria-hidden="true" />,
});

/** Beneficios → Comercios: the map above the list, once a business has a point. */
export default function BusinessMap({ businesses }: { businesses: MapBusiness[] }) {
  const points = located(businesses);
  if (!points.length) return null;
  return (
    <section className="rp-map-frame" aria-label="Mapa de comercios aliados en Ciudad de Panamá">
      <BusinessMapView businesses={points} />
    </section>
  );
}
