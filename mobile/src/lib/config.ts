import Constants from "expo-constants";
import { Platform } from "react-native";

const PRODUCTION = "https://rideperks.app";

/**
 * Where the backend lives. Store builds talk to rideperks.app. While
 * developing, the app talks to `npm run dev` on the computer that serves
 * the Expo bundle (same Wi-Fi), on port 3000 unless EXPO_PUBLIC_API_PORT
 * says otherwise. EXPO_PUBLIC_API_URL overrides both.
 */
export function apiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (!__DEV__) return PRODUCTION;
  const port = process.env.EXPO_PUBLIC_API_PORT || "3000";
  if (Platform.OS === "web") return "http://localhost:" + port;
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return host ? "http://" + host + ":" + port : PRODUCTION;
}

export const WEB_URL = PRODUCTION;
