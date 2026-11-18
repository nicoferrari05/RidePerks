import { Text, View } from "react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { BellButton, Empty, H1, Muted } from "@/components/platform/ui";
import { Scanner } from "@/components/platform/Scanner";
import type { BusinessHome } from "@/components/platform/business";
import { useApi } from "@/lib/use-api";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Escanear (ScanView on the web): the first thing anyone at the counter needs.
export default function ScanScreen() {
  const { c } = useTheme();
  const { data, error, refreshing, reload } = useApi<BusinessHome>("/api/app/business/home");

  if (!data)
    return (
      <Screen tab>{error ? <LoadError message={error} onRetry={reload} /> : <Loading />}</Screen>
    );

  if (!data.business)
    return (
      <Screen tab refreshing={refreshing} onRefresh={reload}>
        <H1>Tu comercio</H1>
        <Empty
          title={data.profile.status === "suspended" ? "Tu cuenta está suspendida" : "Falta vincular tu comercio"}
        >
          <Muted>
            {data.profile.status === "suspended"
              ? "Escríbenos para revisar tu cuenta."
              : "RidePerks te asignará como responsable de tu comercio. Cuando lo haga, podrás validar beneficios aquí."}
          </Muted>
          <Muted style={{ marginTop: 12 }}>
            {data.profile.full_name} · {data.profile.phone}
          </Muted>
        </Empty>
      </Screen>
    );

  return (
    <Screen tab refreshing={refreshing} onRefresh={reload}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 16 }}>
        <View style={{ flex: 1, gap: 6 }}>
          <H1>{data.business.name}</H1>
          <Text style={{ fontFamily: font.regular, fontSize: 15, lineHeight: 23.3, color: c.muted }}>
            {data.business.address}
          </Text>
        </View>
        <BellButton unread={data.unread} />
      </View>
      <Scanner />
    </Screen>
  );
}
