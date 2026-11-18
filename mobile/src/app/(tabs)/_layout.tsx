import { Tabs } from "expo-router/tabs";
import { Dock } from "@/components/platform/Dock";
import { useTheme } from "@/theme/theme";

// The driver's four destinations, like components/platform/Navigation.tsx:
// Comercios lives inside Beneficios; membership, verification, help and
// settings live inside Cuenta.
export default function TabsLayout() {
  const { c } = useTheme();
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
