import { useRef, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { Enter } from "@/components/Enter";
import {
  AudienceSwitch,
  Checkbox,
  Choices,
  Field,
  Notice,
  PrimaryButton,
  TextLink,
  authText,
} from "@/components/auth";
import { useSession, type Audience } from "@/lib/session";
import { platforms } from "@/lib/format";
import { WEB_URL } from "@/lib/config";
import { auth } from "@/theme/tokens";

// Crear cuenta: the web's /register and /business/register
// (components/platform/AuthPage.tsx + AuthForm). Same fields, same rules
// (checked again on the server), same messages. A new driver lands on the
// welcome screens; a new business owner on "Falta vincular tu comercio".
const COPY = {
  driver: {
    title: "Tu próximo ahorro empieza aquí.",
    text: "Crea tu cuenta gratis y entra directamente. Si estabas en la lista de espera, usa el mismo correo.",
    name: "Nombre completo",
    button: "Crear mi cuenta gratis",
  },
  business: {
    title: "Suma tu comercio a RidePerks.",
    text: "Crea la cuenta del responsable. El equipo de RidePerks la vinculará a tu comercio.",
    name: "Nombre del responsable",
    button: "Crear cuenta de comercio",
  },
} as const;

type PlatformId = keyof typeof platforms;
const PLATFORM_OPTIONS = Object.entries(platforms).map(([id, label]) => ({
  id: id as PlatformId,
  label,
}));

const backToLogin = () => (router.canGoBack() ? router.back() : router.replace("/login"));
const openWeb = (path: string) => void WebBrowser.openBrowserAsync(WEB_URL + path);

export default function RegisterScreen() {
  const { register, endSession } = useSession();
  const params = useLocalSearchParams<{ audience?: string }>();
  const [audience, setAudience] = useState<Audience>(
    params.audience === "business" ? "business" : "driver",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [platform, setPlatform] = useState<PlatformId | "">("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const phoneRef = useRef<TextInputInstance>(null);
  const copy = COPY[audience];
  const driver = audience === "driver";

  // Quick checks so the obvious mistakes don't need a round trip. The
  // server checks everything again (lib/platform/validation.ts).
  function problem() {
    if (name.trim().length < 2) return "Escribe tu nombre completo.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Escribe un correo válido.";
    if (password.length < 10) return "Usa al menos 10 caracteres.";
    if (!/^\+?[0-9 ()-]{8,20}$/.test(phone.trim()))
      return "Escribe un teléfono válido con código de país.";
    if (driver && !platform) return "Selecciona tu plataforma.";
    if (!terms) return "Acepta los términos y la política de privacidad.";
    return null;
  }

  async function submit() {
    if (pending) return;
    const local = problem();
    if (local) {
      setError(local);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const message = await register({
        audience,
        full_name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        platform: driver ? platform : "multiple",
        terms,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Signed in: the session switches the app to the account's screens.
      // Otherwise the account exists; sign in from the login screen.
      if (message) {
        await endSession(message);
        router.replace("/login");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos conectar. Intenta nuevamente.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPending(false);
    }
  }

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
            <Enter>
              <TextLink onPress={backToLogin}>← Volver</TextLink>
            </Enter>
            <Enter delay={100}>
              <AudienceSwitch
                withPin={false}
                value={audience}
                onChange={(next) => {
                  if (next === "pin") return;
                  setAudience(next);
                  setError(null);
                }}
              />
            </Enter>
            <Enter delay={200}>
              <Text style={authText.title} accessibilityRole="header">
                {copy.title}
              </Text>
            </Enter>
            <Enter delay={300}>
              <Text style={[authText.small, styles.lead]}>{copy.text}</Text>
            </Enter>

            <Enter delay={400} style={styles.form}>
              <Field
                label={copy.name}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                maxLength={100}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
              <Field
                ref={emailRef}
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
              <View style={styles.hinted}>
                <Field
                  ref={passwordRef}
                  label="Contraseña"
                  password
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  passwordRules="minlength: 10;"
                  maxLength={128}
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
                <Text style={authText.small}>Al menos 10 caracteres.</Text>
              </View>
              <Field
                ref={phoneRef}
                label="WhatsApp (con código de país)"
                value={phone}
                onChangeText={setPhone}
                placeholder="+507 6000 0000"
                autoComplete="tel"
                textContentType="telephoneNumber"
                keyboardType="phone-pad"
                inputMode="tel"
                maxLength={20}
              />
              {driver && (
                <Choices
                  label="¿En qué plataforma trabajas?"
                  value={platform}
                  options={PLATFORM_OPTIONS}
                  onChange={(v) => {
                    setPlatform(v);
                    setError(null);
                  }}
                />
              )}
              <Checkbox
                checked={terms}
                onChange={(v) => {
                  setTerms(v);
                  setError(null);
                }}
                label="Acepto los términos de uso y la política de privacidad"
              >
                Acepto los{" "}
                <TextLink underline onPress={() => openWeb("/terminos")}>
                  términos de uso
                </TextLink>{" "}
                y la{" "}
                <TextLink underline onPress={() => openWeb("/privacidad")}>
                  política de privacidad
                </TextLink>
                .
              </Checkbox>
              {error && <Notice>{error}</Notice>}
              <PrimaryButton label={copy.button} pending={pending} onPress={submit} />
            </Enter>

            <Enter delay={500}>
              <Text style={[authText.small, styles.center]}>
                <TextLink onPress={backToLogin}>Ya tengo una cuenta. Iniciar sesión →</TextLink>
              </Text>
            </Enter>
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
  lead: { fontSize: 16, lineHeight: 24 },
  form: { gap: 16 },
  hinted: { gap: 6 },
  center: { textAlign: "center" },
});
