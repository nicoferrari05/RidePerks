"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

// Admin → business editor: tap the map to place the business. Sends
// latitude/longitude with the form; "Quitar ubicación" takes it off the map.
const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => null,
});

export default function LocationPicker({
  latitude,
  longitude,
}: {
  latitude?: number | null;
  longitude?: number | null;
}) {
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(
    typeof latitude === "number" && typeof longitude === "number"
      ? { lat: latitude, lng: longitude }
      : null,
  );
  return (
    <div className="rp-field">
      <span id="location-label">Ubicación en el mapa (opcional)</span>
      <input type="hidden" name="latitude" value={point ? point.lat.toFixed(6) : ""} />
      <input type="hidden" name="longitude" value={point ? point.lng.toFixed(6) : ""} />
      <div className="rp-map-frame" role="group" aria-labelledby="location-label">
        <LocationPickerMap point={point} onChange={setPoint} />
      </div>
      <p className="rp-muted">
        {point
          ? "Arrastra el punto o toca otro lugar para moverlo. "
          : "Toca el mapa donde está el comercio. Sin ubicación no aparece en el mapa de los conductores."}
        {point && (
          <button type="button" className="rp-text-link" onClick={() => setPoint(null)}>
            Quitar ubicación
          </button>
        )}
      </p>
    </div>
  );
}
