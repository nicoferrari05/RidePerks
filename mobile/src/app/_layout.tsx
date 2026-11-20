import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { JetBrainsMono_600SemiBold } from "@expo-google-fonts/jetbrains-mono/600SemiBold";
import { PressScale } from "@/components/PressScale";
import { SessionProvider, useSession } from "@/lib/session";
import { ThemeProvider } from "@/theme/theme";
import { auth, font } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();

function Routes() {
  const { state, reload } = useSession();
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    JetBrainsMono_600SemiBold,
  });
  const ready = (fontsLoaded || fontError) && state.status !== "loading";

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  if (state.status === "unreachable")
    return (
      <View style={styles.offline}>
        <Text style={styles.offlineTitle}>Sin conexión</Text>
        <Text style={styles.offlineText}>{state.message}</Text>
        <PressScale accessibilityRole="button" onPress={() => void reload()} style={styles.retry}>
          <Text style={styles.retryText}>Reintentar</Text>
        </PressScale>
      </View>
    );

  const signedIn = state.status === "signedIn";
  const role = signedIn ? state.profile.role : null;
  // Detail screens slide in from the side, like any native app; going back
  // is the system gesture (iOS) or button (Android).
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Protected guard={role === "driver"}>
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="welcome" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="benefit/[id]" />
        <Stack.Screen name="settings/profile" />
        <Stack.Screen name="settings/membership" />
        <Stack.Screen name="settings/verify" />
        <Stack.Screen name="receipt/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={role === "business"}>
        <Stack.Screen name="business" options={{ animation: "fade" }} />
        <Stack.Screen name="manage/benefit" />
        <Stack.Screen name="manage/info" />
        <Stack.Screen name="manage/hours" />
        <Stack.Screen name="manage/media" />
        <Stack.Screen name="manage/staff" />
      </Stack.Protected>
      {/* Both kinds of account. */}
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings/help" />
        <Stack.Screen name="settings/password" />
        <Stack.Screen name="settings/delete" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="pin" options={{ animation: "fade" }} />
        <Stack.Screen name="register" />
        <Stack.Screen name="recover" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <Routes />
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  offline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: auth.bg,
  },
  offlineTitle: { fontFamily: font.semibold, fontSize: 24, color: auth.text },
  offlineText: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: auth.muted,
  },
  retry: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: auth.primary,
  },
  retryText: { fontFamily: font.medium, fontSize: 16, color: auth.primaryFg },
});
