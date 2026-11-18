import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Button, Message, Muted, SubHeader } from "@/components/platform/ui";
import { Checkbox } from "@/components/platform/forms";
import { MANAGE_PATH, type Manage } from "@/components/platform/manage";
import { api } from "@/lib/api";
import { invalidate, useApi } from "@/lib/use-api";
import { dayNames } from "@/lib/format";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Horario (HoursForm on the web): each day open or closed, with its hours.
type Day = { open: boolean; from: string; to: string };

function TimeField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <TextInput
        value={value}
        onChangeText={(v) => {
          // Typing "0830" becomes "08:30".
          const digits = v.replace(/\D/g, "").slice(0, 4);
          onChange(
            digits.length > 2
              ? digits.slice(0, 2) + ":" + digits.slice(2)
              : digits,
          );
        }}
        accessibilityLabel={label}
        keyboardType="number-pad"
        maxLength={5}
        placeholder="08:00"
        placeholderTextColor={c.faint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          minHeight: 48,
          paddingHorizontal: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: focused ? c.text : "transparent",
          backgroundColor: c.raised,
          fontFamily: font.regular,
          fontSize: 16,
          color: c.text,
        }}
      />
    </View>
  );
}

function HoursForm({ data }: { data: Manage }) {
  const { c } = useTheme();
  const [days, setDays] = useState<Day[]>(() =>
    Array.from({ length: 7 }, (_, i) => {
      const value = data.hours?.[i] || null;
      return {
        open: Boolean(value),
        from: value?.[0] || "08:00",
        to: value ? (value[1] === "24:00" ? "00:00" : value[1]) : "18:00",
      };
    }),
  );
  const [result, setResult] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const update = (i: number, change: Partial<Day>) =>
    setDays((all) => all.map((d, j) => (j === i ? { ...d, ...change } : d)));

  async function save() {
    setPending(true);
    setResult(null);
    try {
      const r = await api<{ message: string }>("/api/app/business/hours", {
        method: "POST",
        body: { days },
      });
      setResult({ kind: "success", text: r.message });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidate(MANAGE_PATH);
    } catch (e) {
      setResult({
        kind: "error",
        text: e instanceof Error ? e.message : "No pudimos guardar el horario.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={{ gap: 16 }}>
      <Muted>
        Para abrir las 24 horas usa 00:00 a 00:00. Si cierras después de
        medianoche, pon la hora de cierre del día siguiente.
      </Muted>
      <View style={{ gap: 10 }}>
        {/* Monday first, as people read a week. */}
        {[1, 2, 3, 4, 5, 6, 0].map((i) => (
          <View
            key={i}
            style={{
              gap: 10,
              padding: 14,
              borderRadius: 18,
              backgroundColor: c.surface,
            }}
          >
            <Checkbox
              checked={days[i].open}
              onChange={(open) => update(i, { open })}
            >
              {dayNames[i]}
            </Checkbox>
            {days[i].open && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <TimeField
                  value={days[i].from}
                  onChange={(from) => update(i, { from })}
                  label={dayNames[i] + ": abre"}
                />
                <Text
                  style={{
                    fontFamily: font.regular,
                    fontSize: 15,
                    color: c.muted,
                  }}
                >
                  a
                </Text>
                <TimeField
                  value={days[i].to}
                  onChange={(to) => update(i, { to })}
                  label={dayNames[i] + ": cierra"}
                />
              </View>
            )}
          </View>
        ))}
      </View>
      {result && <Message kind={result.kind}>{result.text}</Message>}
      <Button
        label={pending ? "Guardando…" : "Guardar horario"}
        onPress={save}
        disabled={pending}
      />
    </View>
  );
}

export default function HoursScreen() {
  const { data, error, reload } = useApi<Manage>(MANAGE_PATH);
  return (
    <Screen>
      <SubHeader title="Horario" />
      {!data ? (
        error ? (
          <LoadError message={error} onRetry={reload} />
        ) : (
          <Loading />
        )
      ) : (
        <HoursForm data={data} />
      )}
    </Screen>
  );
}
