import { useState } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/platform/Screen";
import { Button, Message, Muted, SubHeader } from "@/components/platform/ui";
import { Field, Select } from "@/components/platform/forms";
import { api } from "@/lib/api";
import { invalidate } from "@/lib/use-api";
import { useSession } from "@/lib/session";
import { platforms } from "@/lib/format";

// Datos personales (/driver/profile/edit, ProfileForm on the web).
type Platform = keyof typeof platforms;

export default function ProfileScreen() {
  const { state, reload } = useSession();
  const profile = state.status === "signedIn" ? state.profile : null;
  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [platform, setPlatform] = useState<Platform | "">((profile?.platform as Platform) || "");
  const [result, setResult] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setResult(null);
    try {
      const r = await api<{ message: string }>("/api/app/driver/profile", {
        method: "POST",
        body: { full_name: name, phone, platform },
      });
      setResult({ kind: "success", text: r.message });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidate("/api/app/driver/home");
      invalidate("/api/app/driver/account");
      void reload();
    } catch (e) {
      setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos guardar." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <SubHeader title="Datos personales" />
      <Muted>Usamos tu WhatsApp para ayudarte con tu cuenta y tus beneficios.</Muted>
      <View style={{ gap: 16 }}>
        <Field
          label="Nombre completo"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          maxLength={100}
        />
        <Field
          label="WhatsApp (con código de país)"
          value={phone}
          onChangeText={setPhone}
          autoComplete="tel"
          textContentType="telephoneNumber"
          keyboardType="phone-pad"
          maxLength={20}
        />
        <Select<Platform>
          label="¿En qué plataforma trabajas?"
          placeholder="Selecciona tu plataforma"
          value={platform}
          onChange={setPlatform}
          options={Object.entries(platforms).map(([id, label]) => ({ id: id as Platform, label }))}
        />
        {result && <Message kind={result.kind}>{result.text}</Message>}
        <Button label={pending ? "Guardando…" : "Guardar cambios"} onPress={save} disabled={pending} />
      </View>
    </Screen>
  );
}
