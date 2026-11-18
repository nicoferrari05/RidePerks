import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { PressScale } from "@/components/PressScale";
import { Screen } from "@/components/platform/Screen";
import { Message, Panel, SubHeader, useType } from "@/components/platform/ui";
import { Checkbox, PasswordField } from "@/components/platform/forms";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Eliminar cuenta (/account/delete on the web). Asks for the password and
// an explicit confirmation, then a last "¿Eliminar tu cuenta para siempre?".

const DELETED = "Tu cuenta fue eliminada. Gracias por haber sido parte de RidePerks.";

export default function DeleteScreen() {
  const t = useType();
  const { c } = useTheme();
  const { endSession, state } = useSession();
  const business = state.status === "signedIn" && state.profile.role === "business";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    setError(null);
    try {
      await api("/api/app/account/delete", { method: "POST", body: { password, confirm } });
      await endSession(DELETED);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos conectar.");
      setPending(false);
    }
  }

  function ask() {
    if (!confirm) return setError("Confirma que entiendes que no se puede deshacer.");
    if (!password) return setError("Escribe tu contraseña.");
    Alert.alert("¿Eliminar tu cuenta para siempre?", "No se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => void remove() },
    ]);
  }

  const bullet = { fontFamily: font.regular, fontSize: 15, lineHeight: 23.3, color: c.muted };
  const bullets = [
    "No podrás volver a iniciar sesión con este correo.",
    "Borramos tu nombre, teléfono, capturas de verificación, favoritos, notificaciones y mensajes de ayuda.",
    "Los usos y pagos ya registrados se conservan sin tus datos personales, porque son parte del registro de los comercios y de la contabilidad.",
    business
      ? "Si administras un comercio, sigue publicado hasta que RidePerks lo pause. Escríbenos si quieres darlo de baja."
      : "Una membresía activa no se reembolsa.",
  ];
  return (
    <Screen>
      <SubHeader title="Eliminar cuenta" />
      <Text style={t.h1} accessibilityRole="header">
        ¿Seguro que quieres irte?
      </Text>
      <Panel style={{ gap: 12 }}>
        <Text style={t.h3}>Qué pasa al eliminarla</Text>
        <View style={{ gap: 8 }}>
          {bullets.map((b) => (
            <View key={b} style={{ flexDirection: "row", gap: 10, paddingRight: 4 }}>
              <Text style={bullet}>•</Text>
              <Text style={[bullet, { flex: 1 }]}>{b}</Text>
            </View>
          ))}
        </View>
      </Panel>
      <View style={{ gap: 16 }}>
        <PasswordField label="Tu contraseña" value={password} onChangeText={setPassword} />
        <Checkbox checked={confirm} onChange={setConfirm}>
          Entiendo que se borran mis datos personales y que no se puede deshacer.
          {business
            ? " El comercio seguirá en RidePerks hasta que el equipo lo pause."
            : " Si tienes una membresía activa, no se reembolsa."}
        </Checkbox>
        {error && <Message kind="error">{error}</Message>}
        <PressScale
          onPress={ask}
          disabled={pending}
          accessibilityRole="button"
          accessibilityState={{ disabled: pending, busy: pending }}
          style={{
            minHeight: 52,
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: c.danger,
            opacity: pending ? 0.45 : 1,
          }}
        >
          <Trash2 size={16} color="#ffffff" />
          <Text style={{ fontFamily: font.medium, fontSize: 15, color: "#ffffff" }}>
            {pending ? "Eliminando…" : "Eliminar mi cuenta"}
          </Text>
        </PressScale>
      </View>
    </Screen>
  );
}
