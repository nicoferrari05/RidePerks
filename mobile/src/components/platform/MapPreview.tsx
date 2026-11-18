import { Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  G,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { MapPin } from "lucide-react-native";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";
import { Badge, H2 } from "./ui";

// Placeholder for the future map of partner businesses (MapPreview.tsx on
// the web): the same drawn streets, bay and pins, blurred, behind a
// "Próximamente" note.

const PINS: [number, number][] = [
  [92, 62],
  [178, 96],
  [252, 58],
  [128, 150],
  [222, 132],
];

export function MapPreview() {
  const { c } = useTheme();
  return (
    <View
      accessibilityLabel="Mapa de comercios, próximamente"
      style={{
        minHeight: 220,
        aspectRatio: 16 / 10,
        maxHeight: 300,
        borderRadius: 24,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.mapLand,
      }}
    >
      <Svg
        viewBox="0 0 360 220"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", width: "108%", height: "108%" }}
      >
        <Defs>
          <Filter id="blur">
            <FeGaussianBlur stdDeviation="3" />
          </Filter>
          <RadialGradient id="fade" cx="50%" cy="50%" rx="60%" ry="70%">
            <Stop offset="0" stopColor={c.mapLand} stopOpacity={0.8} />
            <Stop offset="1" stopColor={c.mapLand} stopOpacity={0.15} />
          </RadialGradient>
        </Defs>
        <G filter="url(#blur)">
          <Rect width="360" height="220" fill={c.mapLand} />
          <Path d="M170 220 C210 182 252 164 296 146 C326 134 346 118 360 108 L360 220 Z" fill={c.mapWater} />
          <Ellipse cx="58" cy="168" rx="38" ry="24" fill={c.mapPark} />
          <Rect x="268" y="14" width="60" height="34" rx="10" fill={c.mapPark} />
          <G fill="none" stroke={c.mapRoad} strokeLinecap="round" strokeWidth="3">
            <Path d="M0 34 L360 6" />
            <Path d="M0 112 L170 120" />
            <Path d="M40 0 L58 220" />
            <Path d="M176 0 L168 220" />
            <Path d="M300 0 L286 140" />
            <Path d="M0 196 L150 204" />
            <Path d="M210 92 L360 82" />
          </G>
          <G fill="none" stroke={c.mapRoad} strokeLinecap="round" strokeWidth="7">
            <Path d="M150 220 C196 176 246 158 296 138 C326 126 346 110 360 100" />
            <Path d="M0 74 C80 86 160 104 240 66 L360 22" />
            <Path d="M112 0 L138 220" />
            <Path d="M236 0 L222 150" />
          </G>
          {PINS.map(([x, y]) => (
            <G key={x + "-" + y}>
              <Circle cx={x} cy={y} r="13" fill={c.greenSoft} />
              <Circle cx={x} cy={y} r="6" fill={c.text} />
              <Circle cx={x} cy={y} r="2.5" fill={c.greenLine} />
            </G>
          ))}
        </G>
        <Rect width="360" height="220" fill="url(#fade)" />
      </Svg>
      <View style={{ alignItems: "center", gap: 8, maxWidth: 280, paddingVertical: 24, paddingHorizontal: 20 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.raised,
            boxShadow: c.shadow,
          }}
        >
          <MapPin size={22} color={c.greenText} />
        </View>
        <View style={{ alignSelf: "center" }}>
          <Badge label="Próximamente" tone="good" />
        </View>
        <H2 style={{ marginTop: 2, textAlign: "center" }}>Mapa de comercios</H2>
        <Text style={{ fontFamily: font.regular, fontSize: 14.7, lineHeight: 22, textAlign: "center", color: c.muted }}>
          Pronto verás aquí todos los comercios aliados cerca de ti.
        </Text>
      </View>
    </View>
  );
}
