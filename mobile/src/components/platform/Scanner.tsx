import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Camera, CheckCircle2 } from "lucide-react-native";
import { api, ApiError } from "@/lib/api";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";
import { Button, H2, Message, Muted, Panel } from "./ui";

// The counter scanner (components/platform/BusinessScanner.tsx on the web),
// with the phone's own camera. Account mode (owner/staff): read the code,
// see who it belongs to, then confirm. PIN mode (staff without an account):
// the camera opens on arrival and a scan registers the use at once.

type Result = {
  driver_name: string;
  benefit_title: string;
  discount_label: string;
  terms?: string;
};

export function Scanner({ pin = false, onPinExpired }: { pin?: boolean; onPinExpired?: () => void }) {
  const { c } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Result | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const reading = useRef(false);

  async function start() {
    setError("");
    setResult(null);
    const granted = permission?.granted || (await requestPermission()).granted;
    if (!granted) {
      setError("No pudimos abrir la cámara. Permite el acceso o escribe el código del conductor.");
      return;
    }
    reading.current = false;
    setCamera(true);
  }

  useEffect(() => {
    // PIN mode opens the camera on arrival, like the web's /pin.
    if (!pin) return;
    const timer = setTimeout(() => void start(), 0);
    return () => clearTimeout(timer);
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  async function submit(value: string) {
    const code = value.trim();
    if (!code) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const path = pin ? "/api/app/pin/redeem" : preview ? "/api/app/business/redeem" : "/api/app/business/preview";
      const data = await api<Result>(path, { method: "POST", body: { token: code }, pin });
      if (pin || preview) {
        setResult(data);
        setToken("");
        setPreview(null);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setPreview(data);
        void Haptics.selectionAsync();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos validar el código.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // The PIN was changed or removed: back to the PIN screen.
      if (pin && e instanceof ApiError && e.status === 401) onPinExpired?.();
    } finally {
      setBusy(false);
    }
  }

  const done = result && (
    <Panel style={{ gap: 12 }}>
      <CheckCircle2 size={32} color={c.greenText} />
      <H2>{pin ? "Canje registrado" : "Beneficio confirmado"}</H2>
      <Text style={{ fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: c.text }}>
        <Text style={{ fontFamily: font.bold }}>{result.driver_name}</Text>
        {"\n"}
        {result.benefit_title}
      </Text>
      <Message kind="success">Aplica: {result.discount_label}</Message>
      {pin && result.terms ? <Muted>{result.terms}</Muted> : null}
      <Muted>Este código quedó registrado y no se puede volver a usar.</Muted>
    </Panel>
  );

  return (
    <View style={{ gap: 28 }}>
      {pin && done}
      <Panel>
        <Muted>
          {pin
            ? "Apunta la cámara al QR del conductor: el canje se registra al leerlo."
            : "Escanea el QR del conductor y confirma cuando vayas a aplicar el descuento."}
        </Muted>
        {camera && (
          <View style={{ width: "100%", aspectRatio: 1, borderRadius: 18, overflow: "hidden", backgroundColor: "#000" }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={({ data }) => {
                // The camera keeps reporting until closed; act on the first read.
                if (reading.current) return;
                reading.current = true;
                setCamera(false);
                setToken(data.trim());
                setPreview(null);
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (pin) void submit(data);
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: "18%",
                top: "18%",
                right: "18%",
                bottom: "18%",
                borderRadius: 22,
                borderWidth: 3,
                borderColor: "rgba(255, 255, 255, 0.9)",
              }}
            />
          </View>
        )}
        {camera ? (
          <Button label="Cerrar cámara" variant="secondary" onCard onPress={() => setCamera(false)} />
        ) : (
          <Button
            label={result ? "Escanear otro QR" : "Escanear QR"}
            icon={Camera}
            onPress={() => void start()}
            disabled={busy}
          />
        )}
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.medium, fontSize: 14.1, color: c.text }}>
            ¿Falla la cámara? Escribe el código
          </Text>
          <TextInput
            value={token}
            onChangeText={(v) => {
              setToken(v);
              setPreview(null);
            }}
            accessibilityLabel="¿Falla la cámara? Escribe el código"
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            placeholder="Ej: F3A9B2"
            placeholderTextColor={c.faint}
            maxLength={36}
            returnKeyType="go"
            onSubmitEditing={() => void submit(token)}
            style={{
              minHeight: 52,
              paddingHorizontal: 16,
              borderRadius: 16,
              backgroundColor: c.raised,
              fontFamily: font.regular,
              fontSize: 16,
              color: c.text,
            }}
          />
        </View>
        {error ? <Message kind="error">{error}</Message> : null}
        {preview && (
          <View style={{ gap: 12 }} accessibilityLiveRegion="polite">
            <Text style={{ fontFamily: font.semibold, fontSize: 16, color: c.text }}>{preview.driver_name}</Text>
            <Text style={{ fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: c.text }}>
              <Text style={{ fontFamily: font.bold }}>{preview.benefit_title}</Text> · {preview.discount_label}
            </Text>
            {preview.terms ? <Muted>{preview.terms}</Muted> : null}
            <Muted>Acceso válido al consultar. Se comprobará nuevamente al confirmar.</Muted>
          </View>
        )}
        <Button
          label={
            busy
              ? pin
                ? "Registrando…"
                : "Consultando…"
              : pin
                ? "Registrar canje"
                : preview
                  ? "Confirmar y aplicar beneficio"
                  : "Consultar beneficio"
          }
          variant={!pin && preview ? "default" : "secondary"}
          onCard
          loading={busy}
          disabled={!token.trim()}
          onPress={() => void submit(token)}
        />
      </Panel>
      {!pin && done}
    </View>
  );
}
