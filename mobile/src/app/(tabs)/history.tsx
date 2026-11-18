import { Text, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Empty, H1, List, Muted } from "@/components/platform/ui";
import { UseRow, type Use } from "@/components/platform/driver";
import { useApi } from "@/lib/use-api";
import { money } from "@/lib/format";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Actividad (HistoryView on the web): total saved and every use, with
// "Calificar este uso" on recent ones.
export default function HistoryScreen() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { data, error, refreshing, reload } = useApi<{ rows: Use[] }>("/api/app/driver/history");

  if (!data)
    return (
      <Screen tab>
        <H1>Actividad</H1>
        {error ? <LoadError message={error} onRetry={reload} /> : <Loading />}
      </Screen>
    );

  const rows = data.rows;
  const sum = rows.reduce((s, r) => s + Number(r.savings_amount || 0), 0);
  const big = Math.min(56, Math.max(44, width * 0.13));
  return (
    <Screen tab refreshing={refreshing} onRefresh={reload}>
      <H1>Actividad</H1>
      {rows.length ? (
        <>
          <View style={{ gap: 6 }}>
            <Muted>Ahorro registrado</Muted>
            <Text
              style={{
                fontFamily: font.semibold,
                fontSize: big,
                lineHeight: big * 1.05,
                letterSpacing: -big * 0.045,
                color: c.text,
              }}
            >
              {money(sum)}
            </Text>
            <Muted>
              En {rows.length} {rows.length === 1 ? "uso" : "usos"}. Los descuentos sin monto fijo no suman al
              total.
            </Muted>
          </View>
          <List>
            {rows.map((r, i) => (
              <UseRow key={r.id} r={r} last={i === rows.length - 1} rate={r.can_rate} />
            ))}
          </List>
          {rows.length === 500 && <Muted>Se muestran los últimos 500 usos.</Muted>}
        </>
      ) : (
        <Empty
          title="Todavía no tienes usos"
          action={{ label: "Explorar beneficios", onPress: () => router.navigate("/benefits") }}
        >
          Genera un código desde un beneficio y muéstralo en el comercio. Tu ahorro aparecerá aquí cuando lo
          confirmen.
        </Empty>
      )}
    </Screen>
  );
}
