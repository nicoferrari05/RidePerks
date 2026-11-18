import { useEffect, useRef, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { PressScale } from "@/components/PressScale";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import {
  Empty,
  H2,
  List,
  MenuRow,
  MenuTitle,
  Message,
  Muted,
  Panel,
  SubHeader,
  TextLink,
} from "@/components/platform/ui";
import { Checkbox, Field } from "@/components/platform/forms";
import { api } from "@/lib/api";
import { invalidate, useApi } from "@/lib/use-api";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Membresía (/driver/membership: MembershipView + YappyCheckout on the web).
// Paying asks Yappy to send the request to the driver's Yappy app; the
// screen checks every few seconds until Yappy confirms it to the server.

type Membership = {
  state: { status: string; lifetime: boolean };
  free: boolean;
  verified: boolean;
  payments_enabled: boolean;
  phone: string;
  valid_until_label: string | null;
  renew_open: boolean;
  pending: boolean;
  orders: { id: string; status: string; title: string; detail: string }[];
  receipts: { id: string; title: string; date: string }[];
};

const PLANS = {
  monthly: {
    label: "Mensual",
    price: "$15.00",
    note: "al mes",
    consent:
      "Acepto pagar $15.00 por un mes de membresía. La renovación es manual y no hay cargos automáticos.",
  },
  annual: {
    label: "Anual",
    price: "$150.00",
    note: "un solo pago · 2 meses gratis",
    consent:
      "Acepto pagar $150.00 en un solo pago por 12 meses de membresía. No hay cargos automáticos ni renovación automática.",
  },
} as const;
type PlanId = keyof typeof PLANS;

/** Yappy's own orange (their button's theme), for the pay action. */
const YAPPY_ORANGE = "#ff7900";

export default function MembershipScreen() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ plan?: string }>();
  const { data, error, refreshing, reload, refresh } = useApi<Membership>("/api/app/driver/membership");
  const [plan, setPlan] = useState<PlanId>(params.plan === "annual" ? "annual" : "monthly");
  const [phone, setPhone] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const wasPending = useRef(false);

  const pending = Boolean(data?.pending);
  // Every 4 seconds while a payment waits for Yappy, every 30 otherwise.
  useEffect(() => {
    const timer = setInterval(() => void refresh(), pending ? 4000 : 30000);
    return () => clearInterval(timer);
  }, [pending, refresh]);
  useEffect(() => {
    if (!data) return;
    const paid = data.orders[0]?.status === "paid";
    if (wasPending.current && !data.pending && paid) {
      setMessage("");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidate("/api/app/driver/home");
      invalidate("/api/app/driver/account");
    }
    wasPending.current = data.pending;
  }, [data]);

  async function pay() {
    if (!data) return;
    const number = (phone ?? data.phone).replace(/\D/g, "");
    if (pending) return setMessage("Ya tienes un pago pendiente. Espera la confirmación de Yappy.");
    if (!consent) return setMessage("Acepta el precio y las condiciones antes de continuar.");
    if (!/^6\d{7}$/.test(number)) return setMessage("Escribe tu número de Yappy de 8 dígitos.");
    setBusy(true);
    setMessage("");
    try {
      await api("/api/app/driver/membership/pay", {
        method: "POST",
        body: { plan, phone: number, accepted: consent },
        timeoutMs: 45000,
      });
      setMessage(
        "Te enviamos la solicitud de pago a tu Yappy. Ábrelo y confírmala; tu membresía se actualizará aquí.",
      );
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No pudimos conectar con Yappy.");
    } finally {
      setBusy(false);
    }
  }

  const big = Math.min(60, Math.max(44, width * 0.13));
  const hero = (
    <View style={{ gap: 6, padding: 24, borderRadius: 28, backgroundColor: c.hero }}>
      <Text style={{ fontFamily: font.regular, fontSize: 14.7, color: c.heroMuted }}>Membresía RidePerks</Text>
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
        $15
      </Text>
      <Text style={{ fontFamily: font.regular, fontSize: 14.7, lineHeight: 22, color: c.heroMuted }}>
        al mes, o $150 por un año en un solo pago (2 meses gratis). Renovación manual con Yappy, sin cargos
        automáticos.
      </Text>
    </View>
  );

  if (!data)
    return (
      <Screen>
        <SubHeader title="Membresía" />
        {hero}
        {error ? <LoadError message={error} onRetry={reload} /> : <Loading />}
      </Screen>
    );

  const blocked = data.state.status !== "enabled";
  const showsCheckout = !blocked && !data.state.lifetime && !data.free && data.verified && data.payments_enabled;
  const disabled = busy || pending;

  return (
    <Screen refreshing={refreshing} onRefresh={reload}>
      <SubHeader title="Membresía" />
      {hero}
      {blocked ? (
        <Empty
          title={data.state.status === "suspended" ? "Tu acceso está suspendido" : "Tu acceso está cancelado"}
          action={{ label: "Hablar con el equipo", onPress: () => router.push("/settings/help") }}
        >
          Un pago no retira este bloqueo. Escríbenos para revisarlo.
        </Empty>
      ) : data.state.lifetime ? (
        <Empty title="Tienes acceso permanente">No necesitas pagar una membresía mensual.</Empty>
      ) : data.free ? (
        <Empty title="El acceso gratuito sigue activo">
          Todavía no necesitas pagar. Aquí verás el pago cuando empiece.
        </Empty>
      ) : !data.verified ? (
        <Empty
          title="Primero verifica tu cuenta"
          action={{ label: "Verificar ahora", onPress: () => router.push("/settings/verify") }}
        >
          Para pagar y usar beneficios necesitamos aprobar tu perfil.
        </Empty>
      ) : !data.payments_enabled ? (
        <Message kind="error">El pago está fuera de servicio por un momento. Escríbenos desde Ayuda.</Message>
      ) : (
        <View style={{ gap: 28 }}>
          {data.valid_until_label && (
            <Message kind="success">Membresía activa hasta el {data.valid_until_label}.</Message>
          )}
          {data.renew_open && (
            <Panel>
              <H2>{data.valid_until_label ? "Renueva tu membresía" : "Activa tu membresía"}</H2>
              <View accessibilityRole="radiogroup" accessibilityLabel="Plan de membresía" style={{ flexDirection: "row", gap: 10 }}>
                {(Object.keys(PLANS) as PlanId[]).map((id) => {
                  const selected = plan === id;
                  return (
                    <PressScale
                      key={id}
                      disabled={disabled}
                      onPress={() => {
                        setPlan(id);
                        setConsent(false);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected, disabled }}
                      style={{
                        flex: 1,
                        gap: 2,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderRadius: 18,
                        backgroundColor: c.raised,
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected ? c.text : c.line,
                        margin: selected ? 0 : 1,
                      }}
                    >
                      <Text style={{ fontFamily: font.regular, fontSize: 14, color: c.muted }}>{PLANS[id].label}</Text>
                      <Text style={{ fontFamily: font.bold, fontSize: 22, letterSpacing: -0.44, color: c.text }}>
                        {PLANS[id].price}
                      </Text>
                      <Text style={{ fontFamily: font.regular, fontSize: 13, color: c.greenText }}>{PLANS[id].note}</Text>
                    </PressScale>
                  );
                })}
              </View>
              <Field
                label="Tu número de Yappy"
                onCard
                value={phone ?? data.phone}
                onChangeText={(v) => setPhone(v.replace(/\D/g, ""))}
                keyboardType="number-pad"
                autoComplete="tel"
                maxLength={8}
                placeholder="60000000"
                editable={!disabled}
              />
              <Checkbox checked={consent} onChange={setConsent} disabled={disabled}>
                {PLANS[plan].consent}
              </Checkbox>
              {pending && (
                <Text style={{ fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: c.text }}>
                  Esperando la confirmación de Yappy. Puedes volver a esta pantalla para consultar el resultado.
                </Text>
              )}
              <PressScale
                onPress={pay}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityState={{ disabled, busy }}
                style={{
                  minHeight: 52,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: YAPPY_ORANGE,
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <Text style={{ fontFamily: font.semibold, fontSize: 16, color: "#ffffff" }}>
                  {busy ? "Conectando con Yappy…" : "Pagar con Yappy"}
                </Text>
              </PressScale>
            </Panel>
          )}
          {message ? <Muted>{message}</Muted> : null}
          {data.orders.length > 0 && (
            <View>
              <H2 style={{ marginBottom: 16 }}>Tus pagos</H2>
              <List>
                {data.orders.map((o, i) => (
                  <View
                    key={o.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      paddingVertical: 15,
                      borderBottomWidth: i === data.orders.length - 1 ? 0 : 1,
                      borderBottomColor: c.line,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: font.bold, fontSize: 15.7, color: c.text }}>{o.title}</Text>
                      <Muted>{o.detail}</Muted>
                    </View>
                    {o.status === "paid" && (
                      <TextLink label="Recibo" onPress={() => router.push(("/receipt/" + o.id) as Href)} />
                    )}
                  </View>
                ))}
              </List>
            </View>
          )}
        </View>
      )}
      {!showsCheckout && data.receipts.length > 0 && (
        <View>
          <MenuTitle>Recibos</MenuTitle>
          {data.receipts.map((r) => (
            <MenuRow
              key={r.id}
              label={r.title}
              value={r.date}
              onPress={() => router.push(("/receipt/" + r.id) as Href)}
            />
          ))}
        </View>
      )}
      <Muted>
        Si renuevas antes del vencimiento, el tiempo nuevo se suma al que te queda. Cada beneficio mantiene sus
        condiciones y límites.
      </Muted>
    </Screen>
  );
}
