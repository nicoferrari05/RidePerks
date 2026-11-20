import type { MapBusiness } from "@/lib/map-area";

// react-native-maps has no web version. The Expo web preview (development
// only) shows the list without the map; phones get BusinessMap.tsx.
export function BusinessMap(_: { businesses: MapBusiness[] }) {
  return null;
}
