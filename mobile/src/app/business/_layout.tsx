import { Tabs } from "expo-router/tabs";
import { Dock, businessTabs } from "@/components/platform/Dock";
import { useApi } from "@/lib/use-api";
import { useTheme } from "@/theme/theme";
import type { BusinessHome } from "@/components/platform/business";

// The business portal (BusinessNav on the web): owners get Escanear,
// Actividad, Beneficios and Cuenta; staff only scan, so Escanear and Cuenta.
export default function BusinessLayout() {
  const { c } = useTheme();
  const { data } = useApi<BusinessHome>("/api/app/business/home");
  const owner = Boolean(data?.business) && data?.role === "owner";
  return (
    <Tabs
      tabBar={(props) => <Dock {...props} items={businessTabs(owner)} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="benefits" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
