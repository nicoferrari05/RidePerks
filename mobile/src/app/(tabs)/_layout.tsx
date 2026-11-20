import { Redirect } from "expo-router";
import { Tabs } from "expo-router/tabs";
import { Dock } from "@/components/platform/Dock";
import { useSession } from "@/lib/session";
import { useTheme } from "@/theme/theme";

// The driver's four destinations, like components/platform/Navigation.tsx:
// Comercios lives inside Beneficios; membership, verification, help and
// settings live inside Cuenta.
export default function TabsLayout() {
  const { c } = useTheme();
  const { state } = useSession();
  // A new driver sees the welcome screens first (the web sends them from
  // Inicio to /driver/welcome the same way).
  if (state.status === "signedIn" && state.profile.onboarded_at === null)
    return <Redirect href="/welcome" />;
  return (
    <Tabs
      tabBar={(props) => <Dock {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="benefits" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
