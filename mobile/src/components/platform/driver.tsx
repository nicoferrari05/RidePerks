import { useState } from "react";
import { Text, TextInput, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ChevronRight, Circle, CircleCheck, Heart, Star } from "lucide-react-native";
import { PressScale } from "@/components/PressScale";
import { api } from "@/lib/api";
import { invalidate } from "@/lib/use-api";
import { appRoute } from "@/lib/routes";
import { money, MEMBERSHIP_PRICE_USD } from "@/lib/format";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";
import { Button, Empty, Message, Segmented, useType } from "./ui";

// Driver pieces: the setup checklist (components/ui/setup-progress), the
// savings card (SavingsCard), a use row with its rating form (UseRow +
// FeedbackForm) and the favorite heart (FavoriteButton).

export type SetupStep = {
  label: string;
  completed: boolean;
  note?: string;
  href?: string;
  action?: string;
};

/** The catalog is still switched off (catalog_live). */
export function ComingSoon() {
  return (
    <Empty title="Próximamente">
      Estamos cerrando los últimos detalles con los comercios aliados. Muy pronto vas a encontrar aquí
      descuentos en combustible, comida y taller.
    </Empty>
  );
}

function go(href?: string) {
  const to = appRoute(href);
  if (to) router.push(to);
}

export function SetupProgress({ steps }: { steps: SetupStep[] }) {
  const { c } = useTheme();
  const done = steps.filter((s) => s.completed).length;
  const next = steps.find((s) => !s.completed);
  return (
    <View
      accessibilityLabel="Configura tu cuenta"
      style={{ gap: 14, padding: 20, borderRadius: 24, backgroundColor: c.surface }}
    >
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <Text
          accessibilityRole="header"
          style={{ fontFamily: font.semibold, fontSize: 18, letterSpacing: -0.36, color: c.text }}
        >
          Configura tu cuenta
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 13, color: c.muted }}>
          {done} de {steps.length} pasos
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: steps.length, now: done, text: done + " de " + steps.length + " pasos" }}
        style={{ height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: c.surface2 }}
      >
        <View
          style={{
            width: (done / steps.length) * 100 + "%",
            height: "100%",
            borderRadius: 999,
            backgroundColor: c.greenLine,
          }}
        />
      </View>
      <View>
        {steps.map((step) => {
          const current = step === next;
          const link = Boolean(step.href && !step.completed && appRoute(step.href));
          const body = (
            <>
              {step.completed ? (
                <CircleCheck size={20} color={c.greenText} />
              ) : (
                <Circle size={20} color={c.muted} />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: current ? font.semibold : font.regular,
                    fontSize: 16,
                    lineHeight: 22,
                    color: step.completed || current ? c.text : c.muted,
                  }}
                >
                  {step.label}
                </Text>
                {step.note && (
                  <Text style={{ fontFamily: font.regular, fontSize: 13, lineHeight: 18, color: c.muted }}>
                    {step.note}
                  </Text>
                )}
              </View>
              {link && <ChevronRight size={20} color={c.faint} />}
            </>
          );
          const row = {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: 12,
            minHeight: 44,
            paddingVertical: 6,
          };
          return link ? (
            <PressScale key={step.label} onPress={() => go(step.href)} accessibilityRole="link" style={row}>
              {body}
            </PressScale>
          ) : (
            <View key={step.label} style={row}>
              {body}
            </View>
          );
        })}
      </View>
      {next?.href && next.action && appRoute(next.href) && (
        <Button label={next.action} onPress={() => go(next.href)} />
      )}
    </View>
  );
}

type Savings = { total: number; count: number };

/** Inicio's one dark card: savings this month or in total vs. the price. */
export function SavingsCard({ monthly, total }: { monthly: Savings; total: Savings }) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<"monthly" | "total">("monthly");
  const active = tab === "monthly" ? monthly : total;
  const ratio = active.total / MEMBERSHIP_PRICE_USD;
  const pct = Math.max(0, Math.min(ratio, 1)) * 100;
  const big = Math.min(60, Math.max(44, width * 0.13));
  const label = { fontFamily: font.regular, fontSize: 14.7, color: c.heroMuted };
  const foot = { fontFamily: font.regular, fontSize: 13.8, lineHeight: 20.6, color: c.heroMuted };
  const strong = { fontFamily: font.semibold, color: c.heroFg };
  return (
    <View
      accessibilityLabel="Ahorro registrado"
      style={{ gap: 6, padding: 24, borderRadius: 28, backgroundColor: c.hero }}
    >
      <Segmented
        hero
        label="Periodo"
        value={tab}
        onChange={setTab}
        options={[
          { id: "monthly", label: "Este mes" },
          { id: "total", label: "Total" },
        ]}
      />
      <Text style={label}>Ahorraste</Text>
      <Text
        style={{
          marginTop: 4,
          marginBottom: 2,
          fontFamily: font.semibold,
          fontSize: big,
          lineHeight: big * 1.05,
          letterSpacing: -big * 0.045,
          color: c.heroFg,
        }}
      >
        {money(active.total)}
      </Text>
      <Text style={label}>
        {active.count} {active.count === 1 ? "beneficio usado" : "beneficios usados"}
      </Text>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Avance hacia el precio de la membresía"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
        style={{ height: 6, marginTop: 14, borderRadius: 999, overflow: "hidden", backgroundColor: c.heroSurface }}
      >
        <View style={{ width: pct + "%", height: "100%", borderRadius: 999, backgroundColor: c.greenFill }} />
      </View>
      <Text style={foot}>
        {ratio >= 1 ? (
          <>
            Tu membresía se pagó sola <Text style={strong}>{ratio.toFixed(1)}x</Text>.
          </>
        ) : (
          <>
            Te faltan <Text style={strong}>{money(MEMBERSHIP_PRICE_USD - active.total)}</Text> para que tu
            membresía se pague sola.
          </>
        )}
      </Text>
    </View>
  );
}

export type Use = {
  id: string;
  benefit_title: string;
  business_name: string;
  savings_amount: number | null;
  date_label: string;
  can_rate: boolean;
};

/** One use in `.rp-list`; "Calificar este uso" opens the rating form in place. */
export function UseRow({ r, last, rate = false }: { r: Use; last: boolean; rate?: boolean }) {
  const { c } = useTheme();
  const t = useType();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  return (
    <View
      style={{
        paddingVertical: 15,
        gap: 4,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={[t.h3, { fontSize: 15.7 }]}>{r.benefit_title}</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 13.8, lineHeight: 20.6, color: c.muted }}>
            {r.business_name} · {r.date_label}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: font.semibold,
            fontSize: 16,
            color: r.savings_amount === null ? c.muted : c.greenText,
          }}
        >
          {r.savings_amount === null ? "Usado" : money(r.savings_amount)}
        </Text>
      </View>
      {rate &&
        (done ? (
          <View style={{ marginTop: 8, marginBottom: 6 }}>
            <Message kind="success">{done}</Message>
          </View>
        ) : (
          <>
            <PressScale
              onPress={() => setOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              style={{ minHeight: 36, justifyContent: "center", alignSelf: "flex-start" }}
            >
              <Text style={{ fontFamily: font.semibold, fontSize: 14.1, color: c.greenText }}>
                Calificar este uso
              </Text>
            </PressScale>
            {open && <FeedbackForm id={r.id} onDone={setDone} />}
          </>
        ))}
    </View>
  );
}

function FeedbackForm({ id, onDone }: { id: string; onDone: (message: string) => void }) {
  const { c } = useTheme();
  const [rating, setRating] = useState(0);
  const [applied, setApplied] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const legend = { fontFamily: font.medium, fontSize: 14.1, color: c.text, marginBottom: 8 };

  async function send() {
    if (!rating || applied === null) {
      setError("Elige las estrellas y si te aplicaron el beneficio.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await api<{ message: string }>("/api/app/driver/feedback", {
        method: "POST",
        body: { id, rating, applied, comment },
      });
      invalidate("/api/app/driver/history");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDone(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos guardar tu opinión.");
      setPending(false);
    }
  }

  return (
    <View style={{ gap: 16, marginTop: 8, marginBottom: 6 }}>
      <View>
        <Text style={legend}>¿Cómo te fue?</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <PressScale
              key={n}
              onPress={() => setRating(n)}
              accessibilityRole="radio"
              accessibilityState={{ checked: rating === n }}
              accessibilityLabel={n + (n === 1 ? " estrella" : " estrellas")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: c.raised,
              }}
            >
              <Star
                size={22}
                color={n <= rating ? c.greenLine : c.faint}
                fill={n <= rating ? c.greenLine : "transparent"}
              />
            </PressScale>
          ))}
        </View>
      </View>
      <View>
        <Text style={legend}>¿Te aplicaron el beneficio?</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[
            { value: true, label: "Sí" },
            { value: false, label: "No" },
          ].map((option) => {
            const checked = applied === option.value;
            return (
              <PressScale
                key={option.label}
                onPress={() => setApplied(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                style={{
                  minHeight: 40,
                  paddingHorizontal: 18,
                  borderRadius: 999,
                  justifyContent: "center",
                  backgroundColor: checked ? c.text : c.raised,
                }}
              >
                <Text style={{ fontFamily: font.medium, fontSize: 14.7, color: checked ? c.bg : c.text }}>
                  {option.label}
                </Text>
              </PressScale>
            );
          })}
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.medium, fontSize: 14.1, color: c.text }}>Comentario (opcional)</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={500}
          accessibilityLabel="Comentario (opcional)"
          placeholderTextColor={c.faint}
          style={{
            minHeight: 120,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: c.raised,
            fontFamily: font.regular,
            fontSize: 16,
            color: c.text,
            textAlignVertical: "top",
          }}
        />
      </View>
      {error && <Message kind="error">{error}</Message>}
      <Button label={pending ? "Enviando…" : "Enviar"} onPress={send} disabled={pending} />
    </View>
  );
}

/** Heart toggle for a benefit or a business; lights up before the server answers. */
export function FavoriteButton({
  kind,
  id,
  saved,
  name,
  onCard = false,
  onChange,
}: {
  kind: "benefit" | "business";
  id: string;
  saved: boolean;
  name: string;
  onCard?: boolean;
  onChange?: (saved: boolean) => void;
}) {
  const { c } = useTheme();
  const [on, setOn] = useState(saved);
  const [last, setLast] = useState(saved);
  if (saved !== last) {
    setLast(saved);
    setOn(saved);
  }
  async function toggle() {
    const next = !on;
    setOn(next);
    onChange?.(next);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await api("/api/app/driver/favorites", { method: "POST", body: { kind, id, saved: next } });
      invalidate("/api/app/driver/benefits");
      invalidate("/api/app/driver/directory");
    } catch {
      setOn(!next);
      onChange?.(!next);
    }
  }
  return (
    <PressScale
      onPress={toggle}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={(on ? "Quitar de favoritos: " : "Guardar en favoritos: ") + name}
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: onCard ? c.raised : c.surface,
      }}
    >
      <Heart size={20} color={on ? c.greenText : c.text} fill={on ? c.greenText : "transparent"} />
    </PressScale>
  );
}
