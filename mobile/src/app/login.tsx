import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInputInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { Enter } from "@/components/Enter";
import {
  AudienceSwitch,
  type AccessTab,
  Field,
  Notice,
  PrimaryButton,
  TextLink,
  authText,
} from "@/components/auth";
import { useSession, type Audience } from "@/lib/session";
import { api, currentPinSession, savePinSession } from "@/lib/api";
import { router } from "expo-router";
import { WEB_URL } from "@/lib/config";
import { auth } from "@/theme/tokens";

// Same screen as the web's /login and /business/login
// (components/platform/AuthPage.tsx + components/ui/sign-in.tsx), with the
// Conductor / Comercio switch changing the copy in place.
const COPY = {
  driver: {
    title: "Qué bueno verte de vuelta.",
    question: "¿Primera vez por aquí?",
    create: "Crear cuenta gratis →",
    register: "/register",
  },
  business: {
    title: "Tu comercio, conectado.",
    question: "¿Tu comercio aún no tiene cuenta?",
    create: "Registrar responsable →",
    register: "/business/register",
  },
} as const;

export default function LoginScreen() {
  const { signIn, state } = useSession();
  const notice = state.status === "signedOut" ? state.notice : undefined;
  const [tab, setTab] = useState<AccessTab>("driver");
  const audience: Audience = tab === "business" ? "business" : "driver";
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);
  const copy = COPY[audience];

  async function submit() {
    if (pending) return;
    if (!email.trim() || !password) {
      setError("Revisa tu correo y contraseña.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await signIn(email.trim(), password, audience);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos conectar. Intenta nuevamente.",
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPending(false);
    }
  }

  // A phone that entered a business PIN earlier goes straight to scanning.
  useEffect(() => {
    void currentPinSession().then((session) => {
      if (session) router.replace("/pin");
    });
  }, []);

  async function enterPin() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await api<{ pin_session: string }>(
        "/api/app/pin/session",
        {
          method: "POST",
          body: { pin },
          auth: false,
        },
      );
      await savePinSession(result.pin_session);
      setPin("");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/pin");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos comprobar el PIN. Intenta nuevamente.",
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPending(false);
    }
  }

  // Registration and password recovery still happen on the web for now.
  const openWeb = (path: string) =>
    void WebBrowser.openBrowserAsync(WEB_URL + path);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.column}>
            <Enter delay={100}>
              <AudienceSwitch
                value={tab}
                onChange={(next) => {
                  setTab(next);
                  setError(null);
                }}
              />
            </Enter>
            {tab === "pin" ? (
              <>
                <Enter delay={200}>
                  <Text style={authText.title} accessibilityRole="header">
                    Escanea sin iniciar sesión.
                  </Text>
                </Enter>
                <Enter delay={300}>
                  <Text
                    style={[authText.small, { fontSize: 16, lineHeight: 24 }]}
                  >
                    Escribe el PIN que RidePerks le dio a tu comercio. Después
                    se abre la cámara para escanear el QR del conductor.
                  </Text>
                </Enter>
                <View style={styles.form}>
                  <Enter delay={400}>
                    <Field
                      label="PIN del comercio"
                      password
                      secretName="PIN"
                      value={pin}
                      onChangeText={(v) => setPin(v.replace(/D/g, ""))}
                      keyboardType="number-pad"
                      autoComplete="off"
                      maxLength={8}
                      placeholder="••••••"
                      returnKeyType="go"
                      onSubmitEditing={enterPin}
                    />
                  </Enter>
                  {error && <Notice>{error}</Notice>}
                  <Enter delay={500}>
                    <PrimaryButton
                      label="Confirmar PIN y escanear"
                      pending={pending}
                      onPress={enterPin}
                    />
                  </Enter>
                </View>
              </>
            ) : (
              <>
                <Enter delay={200}>
                  <Text style={authText.title} accessibilityRole="header">
                    {copy.title}
                  </Text>
                </Enter>
                {notice && <Notice>{notice}</Notice>}

                <View style={styles.form}>
                  <Enter delay={400}>
                    <Field
                      label="Correo electrónico"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="tu@correo.com"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      keyboardType="email-address"
                      inputMode="email"
                      maxLength={254}
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </Enter>
                  <Enter delay={500}>
                    <Field
                      ref={passwordRef}
                      label="Contraseña"
                      password
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="current-password"
                      textContentType="password"
                      maxLength={128}
                      returnKeyType="go"
                      onSubmitEditing={submit}
                    />
                  </Enter>
                  <Enter delay={600} style={styles.forgot}>
                    <TextLink onPress={() => openWeb("/recover")}>
                      Olvidé mi contraseña
                    </TextLink>
                  </Enter>
                  {error && <Notice>{error}</Notice>}
                  <Enter delay={700}>
                    <PrimaryButton
                      label="Iniciar sesión"
                      pending={pending}
                      onPress={submit}
                    />
                  </Enter>
                </View>

                <Enter delay={900}>
                  <Text style={[authText.small, styles.center]}>
                    {copy.question}{" "}
                    <TextLink onPress={() => openWeb(copy.register)}>
                      {copy.create}
                    </TextLink>
                  </Text>
                </Enter>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: auth.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  column: { width: "100%", maxWidth: 448, alignSelf: "center", gap: 20 },
  form: { gap: 16 },
  forgot: { alignItems: "flex-end" },
  center: { textAlign: "center" },
});
