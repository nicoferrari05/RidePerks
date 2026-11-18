import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Print from "expo-print";
import { Printer } from "lucide-react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Badge, Button, H2, Muted, SubHeader } from "@/components/platform/ui";
import { useApi } from "@/lib/use-api";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// A paid membership order as a receipt (/driver/membership/receipt/[id]).
// "Descargar o imprimir" opens the phone's print sheet, where it can be
// saved as PDF or shared, like the web's print dialog.

type Receipt = { total: string; plan_label: string; rows: [string, string][] };

const escape = (text: string) =>
  text.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] as string);

function receiptHtml(r: Receipt) {
  const rows = r.rows
    .map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#100b00;padding:32px}
header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.brand{font-weight:700;font-size:20px}.paid{background:#eef6e3;color:#3d6a1c;border-radius:999px;padding:4px 10px;font-weight:600;font-size:12px}
h2{margin:0 0 8px}.total{font-size:44px;font-weight:600;letter-spacing:-0.04em;margin:0}
.muted{color:#6b675e}table{width:100%;border-collapse:collapse;margin-top:16px}
td{padding:12px 0;border-bottom:1px solid rgba(16,11,0,.08)}td:last-child{text-align:right;font-weight:500}
</style></head><body><header><span class="brand">RidePerks</span><span class="paid">Pagado</span></header>
<h2>Recibo de pago</h2><p class="total">${escape(r.total)}</p>
<p class="muted">Membresía RidePerks · ${escape(r.plan_label)}</p><table>${rows}</table>
<p class="muted">Renovación manual, sin cargos automáticos. Este recibo confirma tu pago en RidePerks; no es una factura fiscal.</p>
</body></html>`;
}

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const { data, error, reload } = useApi<Receipt>("/api/app/driver/receipts/" + id);

  if (!data)
    return (
      <Screen>
        <SubHeader title="Recibo" />
        {error ? <LoadError message={error} onRetry={reload} /> : <Loading />}
      </Screen>
    );

  return (
    <Screen>
      <SubHeader title="Recibo" />
      <View style={{ gap: 8, padding: 24, borderRadius: 24, backgroundColor: c.surface }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 18, letterSpacing: -0.4, color: c.text }}>RidePerks</Text>
          <Badge label="Pagado" tone="good" />
        </View>
        <H2>Recibo de pago</H2>
        <Text style={{ fontFamily: font.semibold, fontSize: 44, lineHeight: 46, letterSpacing: -1.76, color: c.text }}>
          {data.total}
        </Text>
        <Muted>Membresía RidePerks · {data.plan_label}</Muted>
        <View style={{ marginTop: 12 }}>
          {data.rows.map(([label, value]) => (
            <View
              key={label}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: c.line,
              }}
            >
              <Text style={{ fontFamily: font.regular, fontSize: 15, color: c.muted }}>{label}</Text>
              <Text style={{ flexShrink: 1, textAlign: "right", fontFamily: font.medium, fontSize: 15, color: c.text }}>
                {value}
              </Text>
            </View>
          ))}
        </View>
        <Muted style={{ marginTop: 8, fontSize: 13.4 }}>
          Renovación manual, sin cargos automáticos. Este recibo confirma tu pago en RidePerks; no es una factura
          fiscal.
        </Muted>
      </View>
      <View style={{ gap: 12 }}>
        <Button
          label="Descargar o imprimir"
          icon={Printer}
          onPress={() => void Print.printAsync({ html: receiptHtml(data) }).catch(() => {})}
        />
        <Muted>En el teléfono, elige «Guardar como PDF» o «Compartir» en la ventana de impresión.</Muted>
      </View>
    </Screen>
  );
}
