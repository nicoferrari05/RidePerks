import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { BottomTabBarProps } from "expo-router/tabs";
import {
  ChartColumn,
  House,
  ReceiptText,
  ScanLine,
  Ticket,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/theme";
import { easeSnappy, font } from "@/theme/tokens";

// The floating tab bar (components/ui/spotlight-dock.tsx on the web): the
// destinations and a short green bar that slides to the active one. No
// spotlight glow: on the phone it read as a dark smudge.

export type DockItems = Record<string, { label: string; icon: LucideIcon }>;

/** The driver's tabs (components/platform/Navigation.tsx). */
export const DRIVER_TABS: DockItems = {
  index: { label: "Inicio", icon: House },
  benefits: { label: "Beneficios", icon: Ticket },
  history: { label: "Actividad", icon: ReceiptText },
  account: { label: "Cuenta", icon: UserRound },
};

/** The business portal's tabs (BusinessNav): owners get four, staff two. */
export function businessTabs(owner: boolean): DockItems {
  return owner
    ? {
        index: { label: "Escanear", icon: ScanLine },
        activity: { label: "Actividad", icon: ChartColumn },
        benefits: { label: "Beneficios", icon: Ticket },
        account: { label: "Cuenta", icon: UserRound },
      }
    : {
        index: { label: "Escanear", icon: ScanLine },
        account: { label: "Cuenta", icon: UserRound },
      };
}

const ease = Easing.bezier(...easeSnappy);

export function Dock({
  state,
  navigateToTab,
  items = DRIVER_TABS,
}: BottomTabBarProps & { items?: DockItems }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const routes = state.routes.filter((r) => r.name in items);
  const active = routes.findIndex((r) => r.key === state.routes[state.index]?.key);
  const slot = routes.length ? (width - 12) / routes.length : 0;
  const x = useSharedValue(0);
  useEffect(() => {
    x.set(withTiming(Math.max(active, 0) * slot, { duration: 300, easing: ease }));
  }, [active, slot, x]);
  const bar = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12 + insets.bottom,
      }}
    >
      <View
        accessibilityRole="tablist"
        accessibilityLabel="Navegación"
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{
          width: "100%",
          maxWidth: 420,
          flexDirection: "row",
          padding: 6,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: c.dockLine,
          backgroundColor: c.dock,
          boxShadow: c.dockShadow,
        }}
      >
        {slot > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[{ position: "absolute", left: 6, top: 0, width: slot, alignItems: "center" }, bar]}
          >
            <View style={{ width: 32, height: 3, borderRadius: 999, backgroundColor: c.greenLine }} />
          </Animated.View>
        )}
        {routes.map((route, index) => {
          const item = items[route.name];
          const isActive = index === active;
          const color = isActive ? c.dockFg : c.dockMuted;
          const Icon = item.icon;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={item.label}
              onPress={() => {
                if (!isActive) void Haptics.selectionAsync();
                navigateToTab(route.key);
              }}
              style={({ pressed }) => ({
                flex: 1,
                height: 56,
                borderRadius: 18,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
            >
              <Icon size={22} color={color} strokeWidth={isActive ? 2.4 : 1.9} />
              <Text
                numberOfLines={1}
                style={{
                  paddingHorizontal: 4,
                  fontFamily: font.medium,
                  fontSize: 11,
                  lineHeight: 11,
                  letterSpacing: -0.11,
                  color,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
