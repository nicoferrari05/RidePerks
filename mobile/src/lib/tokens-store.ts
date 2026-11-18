import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// The session lives in the phone's keychain (iOS) / keystore (Android),
// never in plain storage. The web preview (Expo web, development only)
// falls back to localStorage because browsers have no keychain.

export type Tokens = {
  access_token: string;
  refresh_token: string;
  /** Seconds since epoch, as Supabase reports it. */
  expires_at?: number;
};

const KEYS = {
  access: "rp_access_token",
  refresh: "rp_refresh_token",
  expires: "rp_expires_at",
} as const;

const web = Platform.OS === "web";

async function read(key: string) {
  if (web) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}
async function write(key: string, value: string) {
  if (web) return globalThis.localStorage?.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}
async function remove(key: string) {
  if (web) return globalThis.localStorage?.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

export async function readTokens(): Promise<Tokens | null> {
  const [access, refresh, expires] = await Promise.all([
    read(KEYS.access),
    read(KEYS.refresh),
    read(KEYS.expires),
  ]);
  if (!access || !refresh) return null;
  const expiresAt = Number(expires);
  return {
    access_token: access,
    refresh_token: refresh,
    expires_at: Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : undefined,
  };
}

export async function writeTokens(tokens: Tokens) {
  await Promise.all([
    write(KEYS.access, tokens.access_token),
    write(KEYS.refresh, tokens.refresh_token),
    tokens.expires_at
      ? write(KEYS.expires, String(tokens.expires_at))
      : remove(KEYS.expires),
  ]);
}

export async function clearTokens() {
  await Promise.all(Object.values(KEYS).map(remove));
}

// Small device settings next to the session: the business picked in Cuenta
// (sent as X-RP-Business) and a staff PIN session (sent as X-RP-Pin).
export const DEVICE_KEYS = { business: "rp_business_id", pin: "rp_pin_session" } as const;

export async function readValue(key: string) {
  try {
    return await read(key);
  } catch {
    return null;
  }
}
export async function writeValue(key: string, value: string | null) {
  if (value === null) await remove(key);
  else await write(key, value);
}
