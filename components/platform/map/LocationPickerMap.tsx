"use client";
import { useEffect } from "react";
import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/mapcn-marker-label";
import { PANAMA_CITY } from "@/lib/platform/map-area";

type Point = { lat: number; lng: number };

function ClickToPlace({ onChange }: { onChange: (p: Point) => void }) {
  const { map } = useMap();
  useEffect(() => {
    if (!map) return;
    map.getCanvas().style.cursor = "crosshair";
    const handle = (e: { lngLat: { lat: number; lng: number } }) =>
      onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    map.on("click", handle);
    return () => {
      map.off("click", handle);
    };
  }, [map, onChange]);
  return null;
}

export default function LocationPickerMap({
  point,
  onChange,
}: {
  point: Point | null;
  onChange: (p: Point) => void;
}) {
  return (
    <Map
      center={point ? [point.lng, point.lat] : PANAMA_CITY.center}
      zoom={point ? 15 : PANAMA_CITY.zoom}
      minZoom={PANAMA_CITY.minZoom}
      maxZoom={PANAMA_CITY.maxZoom}
      maxBounds={PANAMA_CITY.bounds}
      theme="light"
    >
      <ClickToPlace onChange={onChange} />
      {point && (
        <MapMarker
          longitude={point.lng}
          latitude={point.lat}
          draggable
          onDragEnd={(p) => onChange({ lat: p.lat, lng: p.lng })}
        >
          <MarkerContent>
            <span className="rp-map-pin" data-active="" />
          </MarkerContent>
        </MapMarker>
      )}
    </Map>
  );
}
