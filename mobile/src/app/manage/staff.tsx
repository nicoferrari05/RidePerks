import { useState } from "react";
import { Alert, Share, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Copy, Share2 } from "lucide-react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Button, List, Message, Muted, SubHeader } from "@/components/platform/ui";
import { MANAGE_PATH, type Manage } from "@/components/platform/manage";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Personal autorizado (StaffInvite + RemoveStaff on the web).
export default function StaffScreen() {
  const { c } = useTheme();
  const { data, error, reload, refresh } = useApi<Manage>(MANAGE_PATH);
  const [link, setLink] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function invite() {
    setPending(true);
    setResult(null);
    try {
      const r = await api<{ link: string }>("/api/app/business/staff/invite", { method: "POST" });
      setLink(r.link);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos crear la invitación." });
    } finally {
      setPending(false);
    }
  }

  function remove(id: string, name: string) {
    Alert.alert("¿Retirar el acceso de " + (name || "esta persona") + "?", "Ya no podrá escanear para tu comercio.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Retirar acceso",
        style: "destructive",
        onPress: async () => {
          setResult(null);
          try {
            const r = await api<{ message: string }>("/api/app/business/staff/remove", {
              method: "POST",
              body: { user_id: id },
            });
            setResult({ kind: "success", text: r.message });
            await refresh();
          } catch (e) {
            setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos retirar el acceso." });
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <SubHeader title="Personal autorizado" />
      <View style={{ gap: 16 }}>
        <Muted>
          Comparte este enlace con el empleado. Debe crear su propia cuenta de comercio y aceptar la invitación.
          Vence en 48 horas y solo puede usarse una vez.
        </Muted>
        <Button label={pending ? "Creando…" : "Crear invitación para personal"} onPress={invite} disabled={pending} />
        {link && (
          <View style={{ gap: 10, padding: 16, borderRadius: 18, backgroundColor: c.surface }}>
            <Text style={{ fontFamily: font.medium, fontSize: 14.1, color: c.text }}>Enlace de invitación</Text>
            <Text selectable style={{ fontFamily: font.regular, fontSize: 14.7, color: c.muted }}>
              {link}
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                label="Compartir"
                icon={Share2}
                size="md"
                onPress={() => void Share.share({ message: link })}
              />
              <Button
                label="Copiar"
                icon={Copy}
                variant="white"
                size="md"
                onPress={async () => {
                  await Clipboard.setStringAsync(link);
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              />
            </View>
          </View>
        )}
        {result && <Message kind={result.kind}>{result.text}</Message>}
      </View>
      {!data ? (
        error ? (
          <LoadError message={error} onRetry={reload} />
        ) : (
          <Loading />
        )
      ) : data.staff.length ? (
        <List>
          {data.staff.map((m, i) => (
            <View
              key={m.user_id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                paddingVertical: 15,
                borderBottomWidth: i === data.staff.length - 1 ? 0 : 1,
                borderBottomColor: c.line,
              }}
            >
              <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 16, color: c.text }}>
                {m.full_name || "Personal"}
              </Text>
              <Button label="Retirar acceso" variant="secondary" size="md" onCard onPress={() => remove(m.user_id, m.full_name)} />
            </View>
          ))}
        </List>
      ) : null}
    </Screen>
  );
}
