import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { Loading, Screen } from "@/components/platform/Screen";
import { Button, Message, SubHeader } from "@/components/platform/ui";
import { Field, Hint, Select } from "@/components/platform/forms";
import { api } from "@/lib/api";
import { invalidate, useApi } from "@/lib/use-api";
import { categories } from "@/lib/format";
import type { BenefitForm, BusinessBenefits } from "@/components/platform/business";

// Crear un beneficio / Editar propuesta / Proponer cambios
// (MerchantBenefitForm on the web): save a draft or send it for approval.

const EMPTY: BenefitForm = {
  title: "",
  discount_label: "",
  description: "",
  category: "otros",
  terms: "",
  savings_amount: "",
  monthly_limit: "",
  valid_from: "",
  valid_until: "",
};

function Editor({
  initial,
  benefitId,
  revisionId: initialRevision,
  title,
}: {
  initial: BenefitForm;
  benefitId: string;
  revisionId: string;
  title: string;
}) {
  const [form, setForm] = useState(initial);
  const [revisionId, setRevisionId] = useState(initialRevision);
  const [result, setResult] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (key: keyof BenefitForm) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function save(submit: "draft" | "review") {
    setPending(true);
    setResult(null);
    try {
      const r = await api<{ message: string; revision_id: string; submitted: boolean }>(
        "/api/app/business/benefits/save",
        { method: "POST", body: { ...form, benefit_id: benefitId, revision_id: revisionId, submit } },
      );
      setRevisionId(r.revision_id);
      setSubmitted(r.submitted);
      setResult({ kind: "success", text: r.message });
      invalidate("/api/app/business/benefits");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setResult({ kind: "error", text: e instanceof Error ? e.message : "No pudimos guardar." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <SubHeader title={title} />
      <View style={{ gap: 16 }}>
        <Field label="Nombre del beneficio" value={form.title} onChangeText={set("title")} maxLength={140} />
        <Field
          label="Descuento o beneficio ofrecido"
          value={form.discount_label}
          onChangeText={set("discount_label")}
          maxLength={100}
        />
        <Field label="Descripción" value={form.description} onChangeText={set("description")} multiline maxLength={3000} />
        <Select
          label="Categoría"
          value={form.category}
          onChange={set("category")}
          options={Object.entries(categories).map(([id, label]) => ({ id, label }))}
        />
        <Field
          label="Términos, condiciones y restricciones"
          value={form.terms}
          onChangeText={set("terms")}
          multiline
          maxLength={3000}
        />
        <Field
          label="Ahorro fijo por uso, USD (opcional)"
          value={form.savings_amount}
          onChangeText={set("savings_amount")}
          keyboardType="decimal-pad"
          maxLength={9}
          hint="Déjalo vacío si el ahorro depende del consumo o es un porcentaje."
        />
        <Field
          label="Máximo de usos por conductor al mes (opcional)"
          value={form.monthly_limit}
          onChangeText={set("monthly_limit")}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Field
          label="Disponible desde"
          value={form.valid_from}
          onChangeText={set("valid_from")}
          placeholder="AAAA-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <Field
          label="Disponible hasta"
          value={form.valid_until}
          onChangeText={set("valid_until")}
          placeholder="AAAA-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <Hint>Fechas con el formato año-mes-día, por ejemplo 2026-12-31. Déjalas vacías si no tiene límite.</Hint>
        {result && <Message kind={result.kind}>{result.text}</Message>}
        <View style={{ gap: 10 }}>
          <Button
            label="Enviar a aprobación"
            onPress={() => void save("review")}
            disabled={pending || submitted}
            loading={pending}
          />
          <Button
            label="Guardar borrador"
            variant="secondary"
            size="md"
            onPress={() => void save("draft")}
            disabled={pending || submitted}
          />
        </View>
      </View>
    </Screen>
  );
}

export default function BenefitEditorScreen() {
  const params = useLocalSearchParams<{ new?: string; benefit?: string; revision?: string }>();
  const { data } = useApi<BusinessBenefits>("/api/app/business/benefits", !params.new);
  if (params.new) return <Editor initial={EMPTY} benefitId="" revisionId="" title="Crear un beneficio" />;
  if (!data)
    return (
      <Screen>
        <SubHeader title="Beneficio" />
        <Loading />
      </Screen>
    );
  if (params.revision) {
    const r = data.revisions.find((x) => x.id === params.revision);
    if (r)
      return <Editor initial={r.payload} benefitId={r.benefit_id || ""} revisionId={r.id} title="Editar propuesta" />;
  }
  const b = data.benefits.find((x) => x.id === params.benefit);
  if (b) return <Editor initial={b.payload} benefitId={b.id} revisionId="" title="Proponer cambios" />;
  return (
    <Screen>
      <SubHeader title="Beneficio" />
      <Message kind="error">Este beneficio ya no está disponible.</Message>
    </Screen>
  );
}
