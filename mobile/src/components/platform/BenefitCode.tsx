import { useEffect, useState } from "react";
import { AppState, Text, useWindowDimensions, View } from "react-native";
import QRCodeSvg from "react-qr-code";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { CheckCircle2, Copy, QrCode } from "lucide-react-native";
import { api } from "@/lib/api";
import { invalidate } from "@/lib/use-api";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";
import { Button, H2, Message, Muted } from "./ui";

// The one-time code a driver shows at the counter (components/platform/
// BenefitCode.tsx on the web): generate, show the QR and the six-letter
// fallback, count down two minutes, and notice when the counter confirms it.
// While the code is on screen the phone stays awake.

type Code = { token: string; short_code?: string; expires_at: string; status: string };

function KeepAwake() {
  useKeepAwake();
  return null;
}

export function BenefitCode({ benefitId, verified }: { benefitId: string; verified: boolean }) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const [code, setCode] = useState<Code | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    const tick = () =>
      setSeconds(Math.max(0, Math.ceil((new Date(code.expires_at).getTime() - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [code]);

  useEffect(() => {
    if (!code || code.status === "used") return;
    const poll = async () => {
      if (AppState.currentState !== "active" || new Date(code.expires_at).getTime() <= Date.now()) return;
      try {
        const data = await api<{ status: string }>("/api/app/driver/codes/" + code.token);
        if (data.status === "used") {
          setCode((current) => (current ? { ...current, status: "used" } : current));
          setError("");
          invalidate("/api/app/driver/home");
          invalidate("/api/app/driver/history");
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {
        /* A temporary network failure does not invalidate the QR. */
      }
    };
    const timer = setInterval(poll, 4000);
    return () => clearInterval(timer);
  }, [code]);

  async function generate() {
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      setCode(await api<Code>("/api/app/driver/codes", { method: "POST", body: { benefit_id: benefitId } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos generar el código.");
    } finally {
      setBusy(false);
    }
  }

  const box = {
    alignItems: "center" as const,
    gap: 14,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: c.surface,
  };
  const center = { textAlign: "center" as const };

  if (!verified)
    return (
      <View style={box}>
        <QrCode size={32} color={c.text} />
        <H2 style={center}>Verifica tu cuenta para usarlo</H2>
        <Muted style={center}>Mientras revisamos tu perfil puedes explorar los beneficios.</Muted>
        <Button label="Verificar mi cuenta" onPress={() => router.push("/settings/verify")} style={{ alignSelf: "stretch" }} />
      </View>
    );

  const showing = code && code.status !== "used" && seconds > 0;
  const qrSize = Math.min(220, width * 0.62);
  const shortCode = code?.short_code || code?.token || "";

  return (
    <View style={box} accessibilityLiveRegion="polite">
      {code?.status === "used" ? (
        <>
          <CheckCircle2 size={48} color={c.greenText} />
          <H2 style={center}>Beneficio confirmado</H2>
          <Muted style={center}>El comercio lo registró en tu actividad.</Muted>
          <Button
            label="Ver actividad"
            variant="secondary"
            onCard
            onPress={() => router.navigate("/history")}
            style={{ alignSelf: "stretch" }}
          />
        </>
      ) : showing ? (
        <>
          <KeepAwake />
          <H2 style={center}>Muéstralo en el comercio</H2>
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Código de un solo uso para este beneficio"
            style={{ padding: 16, borderRadius: 22, backgroundColor: "#ffffff" }}
          >
            <QRCodeSvg value={code.token} size={qrSize} level="M" />
          </View>
          <Muted style={center}>
            Vence en{" "}
            <Text style={{ fontFamily: font.semibold, color: c.text }}>
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </Text>
            . Si la cámara falla, dicta este código:
          </Muted>
          <Text
            selectable
            style={{ fontFamily: "JetBrainsMono_600SemiBold", fontSize: 32, letterSpacing: 5.8, color: c.text }}
          >
            {shortCode}
          </Text>
          <Button
            label={copied ? "Código copiado" : "Copiar código"}
            icon={Copy}
            variant="ghost"
            size="md"
            onPress={async () => {
              await Clipboard.setStringAsync(shortCode);
              setCopied(true);
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        </>
      ) : (
        <>
          <H2 style={center}>{code ? "Tu código venció" : "¿Ya estás en el comercio?"}</H2>
          <Muted style={center}>
            {code
              ? "Genera uno nuevo cuando te atiendan."
              : "Genera tu código cuando te atiendan. Dura dos minutos y sirve una sola vez."}
          </Muted>
          <Button
            label={code ? "Generar nuevo código" : "Generar mi código"}
            onPress={generate}
            loading={busy}
            style={{ alignSelf: "stretch" }}
          />
        </>
      )}
      {error ? (
        <View style={{ alignSelf: "stretch" }}>
          <Message kind="error">{error}</Message>
        </View>
      ) : null}
    </View>
  );
}
