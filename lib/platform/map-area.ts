// The part of Panama the business map shows: Panama City, from Panamá
// Oeste across the canal to Costa del Este and San Miguelito. The map can't
// be dragged outside it, which keeps it fast (few tiles) and on topic.
// mobile/src/lib/map-area.ts copies these numbers; change both together.
export const PANAMA_CITY = {
  center: [-79.52, 9.0] as [number, number],
  zoom: 11.4,
  minZoom: 10.5,
  maxZoom: 18,
  bounds: [
    [-79.8, 8.84],
    [-79.24, 9.2],
  ] as [[number, number], [number, number]],
};

export type MapBusiness = {
  id: string;
  name: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
};

export function located<T extends MapBusiness>(list: T[]) {
  return list.filter(
    (b): b is T & { latitude: number; longitude: number } =>
      typeof b.latitude === "number" && typeof b.longitude === "number",
  );
}

/** "Cómo llegar": the exact point when there is one, else a search. */
export function directionsLink(b: {
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  if (typeof b.latitude === "number" && typeof b.longitude === "number")
    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      b.latitude.toFixed(6) +
      "," +
      b.longitude.toFixed(6)
    );
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(b.name + " " + b.address + " Panamá")
  );
}
