"use client";
import { useEffect, useState } from "react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
} from "@/components/ui/mapcn-marker-label";
import { PANAMA_CITY, type MapBusiness } from "@/lib/platform/map-area";

type Located = MapBusiness & { latitude: number; longitude: number };

// Spanish copy for MapLibre's own controls and the two-finger hint.
const LOCALE = {
  "NavigationControl.ZoomIn": "Acercar",
  "NavigationControl.ZoomOut": "Alejar",
  "AttributionControl.ToggleAttribution": "Créditos del mapa",
  "CooperativeGesturesHandler.WindowsHelpText": "Usa Ctrl + rueda para acercar el mapa",
  "CooperativeGesturesHandler.MacHelpText": "Usa Cmd + rueda para acercar el mapa",
  "CooperativeGesturesHandler.MobileHelpText": "Usa dos dedos para mover el mapa",
};

// The partner businesses on a map of Panama City. A pin brings that
// business's card in the list below into view and briefly highlights it.
export default function BusinessMapView({ businesses }: { businesses: Located[] }) {
  // On touch screens one finger keeps scrolling the page; two move the map.
  const [touch] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );
  const [active, setActive] = useState<{ id: string; at: number } | null>(null);

  useEffect(() => {
    if (!active) return;
    const card = document.getElementById("comercio-" + active.id);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.setAttribute("data-flash", "");
    const t = setTimeout(() => card.removeAttribute("data-flash"), 1600);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <Map
      center={PANAMA_CITY.center}
      zoom={PANAMA_CITY.zoom}
      minZoom={PANAMA_CITY.minZoom}
      maxZoom={PANAMA_CITY.maxZoom}
      maxBounds={PANAMA_CITY.bounds}
      cooperativeGestures={touch}
      locale={LOCALE}
    >
      {businesses.map((b) => (
        <MapMarker
          key={b.id}
          longitude={b.longitude}
          latitude={b.latitude}
          onClick={() => setActive({ id: b.id, at: Date.now() })}
        >
          <MarkerContent>
            <span
              role="button"
              aria-label={"Ver " + b.name}
              className="rp-map-pin"
              data-active={active?.id === b.id ? "" : undefined}
            />
            <MarkerLabel position="bottom" className="rp-map-label">
              {b.name}
            </MarkerLabel>
          </MarkerContent>
          <MarkerTooltip>{b.name}</MarkerTooltip>
        </MapMarker>
      ))}
    </Map>
  );
}
