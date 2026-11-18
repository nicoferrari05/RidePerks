import { useState } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { ImagePlus } from "lucide-react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Badge, Button, Message, Muted, SubHeader, useType } from "@/components/platform/ui";
import { Hint } from "@/components/platform/forms";
import { api } from "@/lib/api";
import { imagePart, pickImage, type PickedImage } from "@/lib/images";
import { invalidate, useApi } from "@/lib/use-api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Verificación (/driver/verify, VerifyView + VerificationForm on the web).
// The screenshot is shrunk on the phone before it goes up (long side 1600px,
// JPEG), so it uploads fast on mobile data and stays well under the 5 MB cap.

type State = {
  status: "pending" | "verified" | "rejected" | "suspended";
  pending: boolean;
  rejected_note: string | null;
};

function Steps() {
  const { c } = useTheme();
  const steps = [
    "Abre la app donde trabajas y entra a tu perfil.",
    "Toma una captura donde se lean tu nombre y la plataforma.",
    "Oculta datos de pasajeros, pagos y documentos.",
  ];
  return (
    <View style={{ gap: 14 }}>
      {steps.map((step, i) => (
        <View key={step} style={{ flexDirection: "row", gap: 14 }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: c.greenSoft,
            }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 12.8, color: c.greenText }}>{i + 1}</Text>
          </View>
          <Muted style={{ flex: 1 }}>{step}</Muted>
        </View>
      ))}
    </View>
  );
}

export default function VerifyScreen() {
  const t = useType();
  const { c } = useTheme();
  const { reload: reloadSession } = useSession();
  const { data, error, reload } = useApi<State>("/api/app/driver/verification");
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [result, setResult] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function pick() {
    setResult(null);
    try {
      const image = await pickImage("verificacion.jpg");
      if (image) setPhoto(image);
    } catch {
      setResult({ kind: "error", text: "No pudimos leer esa imagen. Prueba con otra captura." });
    }
  }

  async function send() {
    if (!photo) {
      setResult({ kind: "error", text: "Selecciona una imagen JPG, PNG o WebP de hasta 5 MB." });
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("photo", imagePart(photo));
      const r = await api<{ message: string }>("/api/app/driver/verification", {
        method: "POST",
        body: form,
        timeoutMs: 60000,
      });
      setResult({ kind: "success", text: r.message });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidate("/api/app/driver/home");
      void reloadSession();
      await reload();
    } catch (e) {
      setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos enviar la imagen." });
    } finally {
      setPending(false);
    }
  }

  if (!data)
    return (
      <Screen>
        <SubHeader title="Verificación" />
        {error ? <LoadError message={error} onRetry={reload} /> : <Loading />}
      </Screen>
    );

  const verified = data.status === "verified";
  const suspended = data.status === "suspended";
  const canSend = !verified && !suspended && !data.pending;
  return (
    <Screen>
      <SubHeader title="Verificación" />
      <View style={{ alignItems: "flex-start", gap: 14 }}>
        <Badge
          tone={verified ? "good" : "pending"}
          label={verified ? "Verificada" : suspended ? "Suspendida" : data.pending ? "En revisión" : "Sin verificar"}
        />
        <Text style={t.h1} accessibilityRole="header">
          {verified
            ? "Tu cuenta está verificada"
            : suspended
              ? "Tu cuenta está suspendida"
              : data.pending
                ? "Estamos revisando tu captura"
                : "Verifica que eres conductor"}
        </Text>
        <Muted>
          {verified
            ? "Ya puedes generar códigos en los beneficios disponibles."
            : suspended
              ? "Escríbenos desde Ayuda para revisar tu caso."
              : data.pending
                ? "El equipo revisa tu nombre y plataforma a mano. Te avisaremos por correo."
                : "Sube una captura de tu perfil en Uber, inDrive o PedidosYa donde se vean tu nombre y la plataforma."}
        </Muted>
      </View>
      {data.rejected_note && <Message kind="error">Necesitamos una nueva imagen. {data.rejected_note}</Message>}
      {result?.kind === "success" && <Message kind="success">{result.text}</Message>}
      {canSend && (
        <>
          <Steps />
          <View style={{ gap: 16 }}>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.medium, fontSize: 14.1, color: c.text }}>
                Captura de tu perfil de conductor
              </Text>
              {photo && (
                <Image
                  source={{ uri: photo.uri }}
                  contentFit="contain"
                  accessibilityLabel="Captura elegida"
                  style={{ width: "100%", height: 260, borderRadius: 18, backgroundColor: c.surface2 }}
                />
              )}
              <Button
                label={photo ? "Elegir otra captura" : "Elegir captura"}
                icon={ImagePlus}
                variant="secondary"
                onPress={pick}
              />
              <Hint>
                JPG, PNG o WebP. Máximo 5 MB. No incluyas cédula, datos de pasajeros ni información de pagos.
              </Hint>
            </View>
            {result?.kind === "error" && <Message kind="error">{result.text}</Message>}
            <Button
              label={pending ? "Enviando imagen…" : "Enviar para revisión"}
              onPress={send}
              disabled={pending}
            />
          </View>
          <Muted>Tu imagen es privada y se borra después de la revisión.</Muted>
        </>
      )}
    </Screen>
  );
}
