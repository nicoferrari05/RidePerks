import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/theme/theme";
import { Empty } from "./ui";

/**
 * `.rp-main` + `.rp-stack`: the page frame. 24px from the top (plus the
 * notch), 20px sides, 28px between blocks, and room for the floating dock
 * at the bottom on tab screens.
 */
export function Screen({
  children,
  tab = false,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  /** A dock screen: leave room for the floating bar. */
  tab?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { c, mode } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              tintColor={c.muted}
              colors={[c.text]}
              progressViewOffset={insets.top}
            />
          ) : undefined
        }
        contentContainerStyle={{
          width: "100%",
          maxWidth: 760,
          alignSelf: "center",
          paddingTop: 24 + insets.top,
          paddingHorizontal: 20,
          paddingBottom: (tab ? 124 : 40) + insets.bottom,
          gap: 28,
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/** First load: soft placeholder blocks (.rp-skeleton). */
export function Loading() {
  const { c } = useTheme();
  return (
    <View style={{ gap: 16 }} accessibilityLabel="Cargando">
      {[120, 200, 120].map((height, i) => (
        <View
          key={i}
          style={{ height, borderRadius: 24, backgroundColor: c.surface, opacity: 0.8 }}
        />
      ))}
    </View>
  );
}

/** Couldn't load and nothing cached: say so and offer to retry. */
export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Empty title="No pudimos cargar esta pantalla" action={{ label: "Reintentar", onPress: onRetry }}>
      {message}
    </Empty>
  );
}
