import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { BadgeCheck, CreditCard, QrCode } from "lucide-react-native";
import { Enter } from "@/components/Enter";
import { Button, Message } from "@/components/platform/ui";
import { api } from "@/lib/api";
import { firstName } from "@/lib/format";
import { useSession } from "@/lib/session";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Bienvenida: the web's /driver/welcome (components/platform/Welcome.tsx).
// Shown once to a new driver (onboarded_at empty), before the tabs. Skipping
// or finishing tells the server, so the web won't show it again either.
const STEPS = [
  {
    Icon: BadgeCheck,
    title: "Verifica que eres conductor",
    text: "Sube una captura de tu perfil en Uber, inDrive o PedidosYa. El equipo la revisa a mano.",
  },
  {
    Icon: CreditCard,
    title: "Activa tu membresía",
    text: "$15 al mes o $150 al año con Yappy. Sin cargos automáticos: tú decides cuándo renovar.",
  },
  {
    Icon: QrCode,
    title: "Ahorra en cada parada",
    text: "En el comercio, abre el beneficio y muestra tu código. Tu ahorro queda registrado.",
  },
];

export default function WelcomeScreen() {
  const { c } = useTheme();
  const { state, markOnboarded } = useSession();
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<"skip" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const name = state.status === "signedIn" ? firstName(state.profile.full_name) : "conductor";
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  async function finish(next: "skip" | "verify") {
    if (pending) return;
    setPending(next);
    setError(null);
    try {
      await api("/api/app/driver/onboarding", { method: "POST" });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      markOnboarded();
      router.replace("/(tabs)");
      if (next === "verify") router.push("/settings/verify");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos conectar. Intenta nuevamente.");
      setPending(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top", "bottom"]}>
      <View style={{ alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 4 }}>
        <Button
          label="Saltar"
          variant="ghost"
          size="md"
          loading={pending === "skip"}
          disabled={pending !== null}
          onPress={() => void finish("skip")}
        />
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        <View style={{ width: "100%", maxWidth: 448, alignSelf: "center", gap: 28 }}>
          <Text style={{ fontFamily: font.medium, fontSize: 16, color: c.muted }}>
            Hola, {name}
          </Text>
          {/* Keyed by step so each one plays the entrance again. */}
          <Enter key={index} style={{ gap: 16 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: c.surface,
              }}
            >
              <step.Icon size={34} color={c.text} strokeWidth={1.8} />
            </View>
            <Text
              accessibilityLiveRegion="polite"
              style={{ fontFamily: font.medium, fontSize: 14, color: c.muted }}
            >
              Paso {index + 1} de {STEPS.length}
            </Text>
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: font.semibold,
                fontSize: 32,
                lineHeight: 36,
                letterSpacing: -0.8,
                color: c.text,
              }}
            >
              {step.title}
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: c.muted }}>
              {step.text}
            </Text>
          </Enter>
        </View>
      </ScrollView>
      <View style={{ width: "100%", maxWidth: 496, alignSelf: "center", padding: 24, gap: 20 }}>
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          {STEPS.map((s, i) => (
            <View
              key={s.title}
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: i === index ? c.text : c.surface2,
              }}
            />
          ))}
        </View>
        {error && <Message kind="error">{error}</Message>}
        {last ? (
          <Button
            label="Empezar: verificar mi cuenta"
            loading={pending === "verify"}
            disabled={pending !== null}
            onPress={() => void finish("verify")}
          />
        ) : (
          <Button
            label="Siguiente"
            onPress={() => {
              void Haptics.selectionAsync();
              setIndex(index + 1);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
