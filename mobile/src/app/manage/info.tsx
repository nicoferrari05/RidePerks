import { useState } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Badge, Button, Message, Muted, SubHeader } from "@/components/platform/ui";
import { Field, Select } from "@/components/platform/forms";
import { MANAGE_PATH, type Manage } from "@/components/platform/manage";
import { api } from "@/lib/api";
import { invalidate, useApi } from "@/lib/use-api";
import { categories } from "@/lib/format";

// Información del comercio (MerchantInfo on the web).
function InfoForm({ data, onSaved }: { data: Manage; onSaved: () => void }) {
  const [form, setForm] = useState(data.info);
  const [result, setResult] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const set = (key: keyof Manage["info"]) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    setPending(true);
    setResult(null);
    try {
      const r = await api<{ message: string }>("/api/app/business/info", { method: "POST", body: form });
      setResult({ kind: "success", text: r.message });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidate("/api/app/business/home");
      invalidate(MANAGE_PATH);
      onSaved();
    } catch (e) {
      setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos guardar los datos." });
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={{ gap: 16 }}>
      <Muted>
        Descripción y teléfono se actualizan al instante. Los cambios de nombre, dirección o categoría los revisa
        RidePerks antes de publicarlos.
      </Muted>
      {data.pending_change && <Badge label="Tienes un cambio pendiente de aprobación" tone="plain" />}
      <Field label="Nombre" value={form.name} onChangeText={set("name")} maxLength={120} />
      <Field label="Descripción" value={form.description} onChangeText={set("description")} multiline maxLength={2000} />
      <Field label="Dirección" value={form.address} onChangeText={set("address")} maxLength={250} />
      <Field label="Teléfono" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" maxLength={24} />
      <Select
        label="Categoría"
        value={form.category}
        onChange={set("category")}
        options={Object.entries(categories).map(([id, label]) => ({ id, label }))}
      />
      {result && <Message kind={result.kind}>{result.text}</Message>}
      <Button label={pending ? "Guardando…" : "Guardar información"} onPress={save} disabled={pending} />
    </View>
  );
}

export default function InfoScreen() {
  const { data, error, reload, refresh } = useApi<Manage>(MANAGE_PATH);
  return (
    <Screen>
      <SubHeader title="Información del comercio" />
      {!data ? (
        error ? (
          <LoadError message={error} onRetry={reload} />
        ) : (
          <Loading />
        )
      ) : (
        <InfoForm data={data} onSaved={() => void refresh()} />
      )}
    </Screen>
  );
}
