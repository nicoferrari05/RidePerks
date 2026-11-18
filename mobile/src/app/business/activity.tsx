import { useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Download } from "lucide-react-native";
import { Badge, Empty, H1, List, MenuRow, Message, Muted, SectionHead, Segmented } from "@/components/platform/ui";
import { api } from "@/lib/api";
import { shareTextFile } from "@/lib/share-file";
import { BarChart, type Bar } from "@/components/platform/business";
import { useApi } from "@/lib/use-api";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Actividad for owners (ActivityView + BusinessMetrics on the web).

type Period = "7" | "30" | "month" | "previous";
type Activity = {
  period: Period;
  drivers: number;
  next_milestone: number;
  uses: number;
  savings: string;
  valued_uses: number;
  top_benefit: string | null;
  chart: { title: string; bars: Bar[] };
  feedback: { count: number; avg: number | null; notApplied: number };
  recent: { id: string; benefit_title: string; date_label: string; via_pin: boolean }[];
};

const PERIODS: { id: Period; label: string }[] = [
  { id: "7", label: "7 días" },
  { id: "30", label: "30 días" },
  { id: "month", label: "Este mes" },
  { id: "previous", label: "Mes pasado" },
];

export default function ActivityScreen() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<Period>("30");
  const { data, error, refreshing, reload } = useApi<Activity>("/api/app/business/activity?period=" + period);
  const big = Math.min(60, Math.max(44, width * 0.13));
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // The same CSV as the web; the phone saves it and opens the share sheet
  // (Archivos, WhatsApp, correo, Excel…).
  async function exportCsv() {
    setExporting(true);
    setExportError(null);
    try {
      const file = await api<{ name: string; csv: string }>("/api/app/business/export?period=" + period);
      await shareTextFile(file.name, file.csv, "text/csv");
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "No pudimos generar el archivo.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Screen tab refreshing={refreshing} onRefresh={reload}>
      <H1>Actividad</H1>
      <Segmented label="Período" value={period} onChange={setPeriod} options={PERIODS} />
      {!data ? (
        error ? (
          <LoadError message={error} onRetry={reload} />
        ) : (
          <Loading />
        )
      ) : (
        <>
          <View style={{ gap: 6, padding: 24, borderRadius: 28, backgroundColor: c.hero }}>
            <Text style={{ fontFamily: font.regular, fontSize: 14.7, color: c.heroMuted }}>
              Conductores que te trajo RidePerks
            </Text>
            <Text
              style={{
                marginTop: 4,
                marginBottom: 2,
                fontFamily: font.semibold,
                fontSize: big,
                lineHeight: big * 1.05,
                letterSpacing: -big * 0.045,
                color: c.heroFg,
              }}
            >
              {data.drivers}
            </Text>
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Avance hacia la próxima meta"
              style={{ height: 6, marginTop: 14, borderRadius: 999, overflow: "hidden", backgroundColor: c.heroSurface }}
            >
              <View
                style={{
                  width: Math.max(0, Math.min(data.drivers / data.next_milestone, 1)) * 100 + "%",
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: c.greenFill,
                }}
              />
            </View>
            <Text style={{ fontFamily: font.regular, fontSize: 13.8, lineHeight: 20.6, color: c.heroMuted }}>
              Próxima meta: <Text style={{ fontFamily: font.semibold, color: c.heroFg }}>{data.next_milestone}</Text>{" "}
              conductores.
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              ["Usos", String(data.uses)],
              ["Ahorro registrado", data.savings],
            ].map(([label, value]) => (
              <View key={label} style={{ flex: 1, gap: 6, padding: 18, borderRadius: 22, backgroundColor: c.surface }}>
                <Text style={{ fontFamily: font.regular, fontSize: 13.4, color: c.muted }}>{label}</Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 25.6, letterSpacing: -0.77, color: c.text }}>{value}</Text>
              </View>
            ))}
          </View>
          <BarChart title={data.chart.title} bars={data.chart.bars} unit="usos" />
          <View>
            <MenuRow label="Más usado" value={data.top_benefit || "Todavía no hay usos"} icon={null} />
            <MenuRow
              label="Calificación de conductores"
              icon={null}
              value={
                data.feedback.count
                  ? data.feedback.avg!.toFixed(1) +
                    " ★ · " +
                    data.feedback.count +
                    (data.feedback.count === 1 ? " opinión" : " opiniones")
                  : "Sin opiniones todavía"
              }
            />
            {data.feedback.notApplied > 0 && (
              <MenuRow label="Dijeron que no se aplicó" value={String(data.feedback.notApplied)} icon={null} />
            )}
            <MenuRow
              label={exporting ? "Preparando el archivo…" : "Descargar usos (CSV para Excel)"}
              icon={Download}
              onPress={exporting ? undefined : () => void exportCsv()}
            />
          </View>
          {exportError && <Message kind="error">{exportError}</Message>}
          {data.valued_uses < data.uses && (
            <Muted>
              El ahorro incluye {data.valued_uses} de {data.uses} usos: los descuentos variables no tienen un importe
              fijo.
            </Muted>
          )}
          <View>
            <SectionHead title="Últimos usos" />
            {data.recent.length ? (
              <List>
                {data.recent.map((r, i) => (
                  <View
                    key={r.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      paddingVertical: 15,
                      borderBottomWidth: i === data.recent.length - 1 ? 0 : 1,
                      borderBottomColor: c.line,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: font.semibold, fontSize: 15.7, color: c.text }}>{r.benefit_title}</Text>
                      <Text style={{ fontFamily: font.regular, fontSize: 13.8, color: c.muted }}>{r.date_label}</Text>
                    </View>
                    <Badge label={r.via_pin ? "Con PIN" : "Confirmado"} tone="good" />
                  </View>
                ))}
              </List>
            ) : (
              <Empty title="Sin usos todavía">Cuando confirmes un beneficio, aparecerá aquí.</Empty>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}
