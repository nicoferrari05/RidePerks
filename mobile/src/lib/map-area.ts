// The part of Panama the business map shows: Panama City. Same numbers as
// lib/platform/map-area.ts on the web; change both together.
export const PANAMA_CITY = {
  latitude: 9.0,
  longitude: -79.52,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
  minZoom: 10.5,
  maxZoom: 18,
  bounds: {
    southWest: { latitude: 8.84, longitude: -79.8 },
    northEast: { latitude: 9.2, longitude: -79.24 },
  },
};

export type MapBusiness = {
  id: string;
  name: string;
  address: string;
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
export function directionsLink(b: MapBusiness) {
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
