import { useState } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/platform/Screen";
import { Button, Message, Muted, SubHeader } from "@/components/platform/ui";
import { PasswordField } from "@/components/platform/forms";
import { api } from "@/lib/api";

// Contraseña (/driver/password, PasswordForm on the web).
export default function PasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [result, setResult] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setResult(null);
    try {
      const r = await api<{ message: string }>("/api/app/account/password", {
        method: "POST",
        body: { password, confirmation },
      });
      setResult({ kind: "success", text: r.message });
      setPassword("");
      setConfirmation("");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos conectar." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <SubHeader title="Contraseña" />
      <Muted>Elige una contraseña larga que no uses en otros servicios.</Muted>
      <View style={{ gap: 16 }}>
        <PasswordField label="Nueva contraseña" value={password} onChangeText={setPassword} newPassword />
        <PasswordField
          label="Repite la contraseña"
          value={confirmation}
          onChangeText={setConfirmation}
          newPassword
        />
        {result && <Message kind={result.kind}>{result.text}</Message>}
        <Button label={pending ? "Guardando…" : "Actualizar contraseña"} onPress={save} disabled={pending} />
      </View>
    </Screen>
  );
}
