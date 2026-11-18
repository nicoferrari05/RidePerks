import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { ChevronDown } from "lucide-react-native";
import { Screen } from "@/components/platform/Screen";
import { Button, H2, MenuTitle, Message, Muted, SubHeader, TextLink } from "@/components/platform/ui";
import { Field, Select } from "@/components/platform/forms";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Ayuda (/driver/help: HelpView + SupportForm on the web).

const FAQ = [
  [
    "¿Cómo uso un beneficio?",
    "Abre el beneficio y genera tu código cuando estés en el comercio. Vence en dos minutos y sirve una sola vez. El comercio lo escanea para confirmarlo.",
  ],
  [
    "¿Por qué no puedo generar un código?",
    "Tu cuenta debe estar verificada y tu membresía activa. También puede que el beneficio haya vencido o que llegaras al límite del mes.",
  ],
  [
    "¿Cuánto cuesta RidePerks?",
    "El registro es gratis. La membresía cuesta $15 al mes, o $150 por un año en un solo pago. Cada pago se confirma con Yappy, sin cargos automáticos.",
  ],
  [
    "¿No aparece mi ahorro?",
    "Se registra cuando el comercio confirma tu código. Los descuentos sin monto fijo aparecen como usos, sin sumar un ahorro estimado.",
  ],
];

const TOPICS = [
  { id: "benefit", label: "Un beneficio o comercio" },
  { id: "account", label: "Mi cuenta o verificación" },
  { id: "privacy", label: "Acceso o corrección de mis datos" },
  { id: "delete", label: "Eliminar mi cuenta y datos" },
] as const;
type Topic = (typeof TOPICS)[number]["id"];

function Question({ q, a }: { q: string; a: string }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: c.line }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          minHeight: 60,
          paddingVertical: 8,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: c.text }}>{q}</Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <ChevronDown size={18} color={c.faint} />
        </View>
      </Pressable>
      {open && <Muted style={{ marginBottom: 20 }}>{a}</Muted>}
    </View>
  );
}

export default function HelpScreen() {
  const { state } = useSession();
  const business = state.status === "signedIn" && state.profile.role === "business";
  const driverHelp = useApi<{ email: string | null }>("/api/app/driver/support", !business);
  const businessHome = useApi<{ support_email: string | null }>("/api/app/business/home", business);
  const email = business ? businessHome.data?.support_email : driverHelp.data?.email;
  const [topic, setTopic] = useState<Topic>("benefit");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function send() {
    setPending(true);
    setResult(null);
    try {
      const r = await api<{ message: string }>(business ? "/api/app/business/support" : "/api/app/driver/support", {
        method: "POST",
        body: { topic, message },
      });
      setResult({ kind: "success", text: r.message });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos enviar tu solicitud." });
    } finally {
      setPending(false);
    }
  }

  const sent = result?.kind === "success";
  return (
    <Screen>
      <SubHeader title={business ? "Escríbenos" : "Ayuda"} />
      {!business && (
        <View>
          <MenuTitle>Preguntas frecuentes</MenuTitle>
          {FAQ.map(([q, a]) => (
            <Question key={q} q={q} a={a} />
          ))}
        </View>
      )}
      <View style={{ gap: 12 }}>
        <H2>Escríbenos</H2>
        <View style={{ gap: 16 }}>
          <Select<Topic> label="¿En qué podemos ayudarte?" value={topic} onChange={setTopic} options={[...TOPICS]} />
          <Field
            label="Cuéntanos qué necesitas"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={2000}
          />
          <Muted>No incluyas contraseñas ni datos de pasajeros. Te contactaremos por el WhatsApp de tu perfil.</Muted>
          {result && <Message kind={result.kind}>{result.text}</Message>}
          <Button label={pending ? "Enviando…" : "Enviar solicitud"} onPress={send} disabled={pending || sent} />
        </View>
      </View>
      {email && <TextLink label={email} onPress={() => void Linking.openURL("mailto:" + email)} />}
    </Screen>
  );
}
