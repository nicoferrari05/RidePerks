import { useState } from "react";
import { Alert, View } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { ImagePlus, Trash2 } from "lucide-react-native";
import { PressScale } from "@/components/PressScale";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Button, H2, Message, Muted, SubHeader } from "@/components/platform/ui";
import { MANAGE_PATH, type Manage } from "@/components/platform/manage";
import { api } from "@/lib/api";
import { invalidate, useApi } from "@/lib/use-api";
import { imagePart, pickImage } from "@/lib/images";
import { useTheme } from "@/theme/theme";

// Logo y fotos (MediaForms on the web). Up to 6 photos; they publish at once.

function Tile({ url, label, onRemove }: { url: string; label: string; onRemove: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ width: "48%", aspectRatio: 4 / 3, borderRadius: 16, overflow: "hidden", backgroundColor: c.surface2 }}>
      <Image source={{ uri: url }} contentFit="cover" style={{ flex: 1 }} accessibilityLabel={label} />
      <PressScale
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={"Quitar " + label.toLowerCase()}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 36,
          height: 36,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.raised,
        }}
      >
        <Trash2 size={16} color={c.dangerFg} />
      </PressScale>
    </View>
  );
}

export default function MediaScreen() {
  const { data, error, reload, refresh } = useApi<Manage>(MANAGE_PATH);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function done(message: string) {
    setResult({ kind: "success", text: message });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    invalidate("/api/app/business/home");
    await refresh();
  }

  async function upload(kind: "logo" | "photo") {
    setResult(null);
    let image;
    try {
      image = await pickImage(kind + ".jpg");
    } catch {
      return setResult({ kind: "error", text: "No pudimos leer esa imagen. Prueba con otra." });
    }
    if (!image) return;
    setBusy(kind);
    try {
      const form = new FormData();
      form.append("kind", kind);
      form.append("file", imagePart(image));
      const r = await api<{ message: string }>("/api/app/business/media", { method: "POST", body: form, timeoutMs: 60000 });
      await done(r.message);
    } catch (e) {
      setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos subir la imagen." });
    } finally {
      setBusy(null);
    }
  }

  function remove(path: string, label: string) {
    Alert.alert("¿Quitar " + label.toLowerCase() + "?", "Deja de verse para los conductores.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: async () => {
          setResult(null);
          try {
            const r = await api<{ message: string }>("/api/app/business/media/remove", { method: "POST", body: { path } });
            await done(r.message);
          } catch (e) {
            setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos quitar la imagen." });
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <SubHeader title="Logo y fotos" />
      {!data ? (
        error ? (
          <LoadError message={error} onRetry={reload} />
        ) : (
          <Loading />
        )
      ) : (
        <>
          <Muted>JPG, PNG o WebP. Se publican al instante para los conductores.</Muted>
          {result && <Message kind={result.kind}>{result.text}</Message>}
          <View style={{ gap: 12 }}>
            <H2>Logo</H2>
            {data.logo && (
              <View style={{ flexDirection: "row" }}>
                <Tile url={data.logo.url} label="Logo" onRemove={() => remove(data.logo!.path, "Logo")} />
              </View>
            )}
            <Button
              label={data.logo ? "Cambiar logo" : "Subir logo"}
              icon={ImagePlus}
              variant="secondary"
              loading={busy === "logo"}
              disabled={busy !== null}
              onPress={() => void upload("logo")}
            />
          </View>
          <View style={{ gap: 12 }}>
            <H2>Fotos ({data.photos.length} de 6)</H2>
            {data.photos.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }}>
                {data.photos.map((p, i) => (
                  <Tile key={p.path} url={p.url} label={"Foto " + (i + 1)} onRemove={() => remove(p.path, "Foto " + (i + 1))} />
                ))}
              </View>
            )}
            {data.photos.length < 6 && (
              <Button
                label="Agregar foto"
                icon={ImagePlus}
                variant="secondary"
                loading={busy === "photo"}
                disabled={busy !== null}
                onPress={() => void upload("photo")}
              />
            )}
          </View>
        </>
      )}
    </Screen>
  );
}
