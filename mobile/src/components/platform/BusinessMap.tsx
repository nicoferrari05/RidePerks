import { memo, useRef } from "react";
import { Linking, Platform, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "@/theme/theme";
import { PANAMA_CITY, directionsLink, located, type MapBusiness } from "@/lib/map-area";

// Beneficios → Comercios: the partner businesses on a map of Panama City
// (components/platform/map/BusinessMap.tsx on the web). Native maps: Apple
// Maps on iPhone, Google Maps on Android. A pin shows the name and address;
// tapping that bubble opens directions. Hidden until a business has a point.
//
// Kept light so scrolling stays smooth: no 3D, rotation or points of
// interest, markers drawn once (tracksViewChanges off), and the map can't
// leave Panama City (Android enforces the box; iOS starts inside it).

const Pin = memo(function Pin() {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 3,
        borderColor: "#ffffff",
        backgroundColor: "#85cb33",
        shadowColor: "#100b00",
        shadowOpacity: 0.35,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    />
  );
});

export function BusinessMap({ businesses }: { businesses: MapBusiness[] }) {
  const { mode, c } = useTheme();
  const map = useRef<MapView>(null);
  const points = located(businesses);
  if (!points.length) return null;
  return (
    <View
      style={{ height: 300, borderRadius: 24, overflow: "hidden", backgroundColor: c.surface }}
      accessibilityLabel="Mapa de comercios aliados en Ciudad de Panamá"
    >
      <MapView
        ref={map}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: PANAMA_CITY.latitude,
          longitude: PANAMA_CITY.longitude,
          latitudeDelta: PANAMA_CITY.latitudeDelta,
          longitudeDelta: PANAMA_CITY.longitudeDelta,
        }}
        minZoomLevel={PANAMA_CITY.minZoom}
        maxZoomLevel={PANAMA_CITY.maxZoom}
        onMapReady={() => {
          if (Platform.OS === "android")
            map.current?.setMapBoundaries(PANAMA_CITY.bounds.northEast, PANAMA_CITY.bounds.southWest);
        }}
        userInterfaceStyle={mode}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
        showsPointsOfInterests={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        moveOnMarkerPress={false}
      >
        {points.map((b) => (
          <Marker
            key={b.id}
            coordinate={{ latitude: b.latitude, longitude: b.longitude }}
            title={b.name}
            description={b.address}
            tracksViewChanges={false}
            onCalloutPress={() => void Linking.openURL(directionsLink(b))}
          >
            <Pin />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
