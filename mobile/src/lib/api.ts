import { apiBaseUrl } from "./config";
import {
  DEVICE_KEYS,
  clearTokens,
  readTokens,
  readValue,
  writeTokens,
  writeValue,
  type Tokens,
} from "./tokens-store";

// Every call to the backend goes through here: it adds the session token,
// renews it shortly before it expires (or once after a 401), and turns
// failures into ApiError with the server's own message in Spanish.

export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status; 0 when the server could not be reached. */
    readonly status: number,
  ) {
    super(message);
  }
}

const OFFLINE = "No pudimos conectar. Revisa tu internet e intenta nuevamente.";
const TIMEOUT_MS = 15000;

let cached: Tokens | null | undefined;
let business: string | null | undefined;
let pinSession: string | null | undefined;

/** The business chosen in Cuenta (people who run more than one). */
export async function chooseBusiness(id: string | null) {
  business = id;
  await writeValue(DEVICE_KEYS.business, id);
}

export async function currentPinSession() {
  if (pinSession === undefined) pinSession = await readValue(DEVICE_KEYS.pin);
  return pinSession;
}

export async function savePinSession(value: string | null) {
  pinSession = value;
  await writeValue(DEVICE_KEYS.pin, value);
}
let refreshing: Promise<Tokens | null> | null = null;
const signedOutListeners = new Set<() => void>();

/** Called when the saved session stops working (expired or revoked). */
export function onSessionLost(listener: () => void) {
  signedOutListeners.add(listener);
  return () => {
    signedOutListeners.delete(listener);
  };
}

export async function currentTokens() {
  if (cached === undefined) cached = await readTokens();
  return cached;
}

export async function saveSession(tokens: Tokens) {
  cached = tokens;
  await writeTokens(tokens);
}

export async function forgetSession() {
  cached = null;
  await clearTokens();
  await chooseBusiness(null);
}

async function request(path: string, init: RequestInit, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(apiBaseUrl() + path, { ...init, signal: controller.signal });
  } catch {
    throw new ApiError(OFFLINE, 0);
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const data = await response.json();
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

// One renewal at a time: several screens may ask at once.
function renew(): Promise<Tokens | null> {
  if (!refreshing)
    refreshing = (async () => {
      const tokens = await currentTokens();
      if (!tokens) return null;
      const response = await request("/api/app/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });
      if (response.status === 401) {
        await forgetSession();
        signedOutListeners.forEach((listener) => listener());
        return null;
      }
      const data = await readJson(response);
      if (!response.ok || !data.session) return tokens;
      const next = data.session as Tokens;
      await saveSession(next);
      return next;
    })().finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function freshTokens() {
  const tokens = await currentTokens();
  if (!tokens) return null;
  const soon = Date.now() / 1000 + 60;
  if (tokens.expires_at && tokens.expires_at < soon) return renew();
  return tokens;
}

type Options = {
  method?: "GET" | "POST";
  body?: unknown;
  /** false for sign-in, which has no session yet. */
  auth?: boolean;
  /** Longer for uploads and payments (the server waits on Yappy). */
  timeoutMs?: number;
  /** Staff PIN mode: sends the device's PIN session instead of an account. */
  pin?: boolean;
};

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, auth: account = true, timeoutMs, pin = false } = options;
  const auth = account && !pin;
  if (business === undefined) business = await readValue(DEVICE_KEYS.business);
  const pinHeader = pin ? await currentPinSession() : null;
  // A FormData body (a photo) goes as multipart; fetch sets its boundary.
  const multipart = typeof FormData !== "undefined" && body instanceof FormData;
  const send = async (tokens: Tokens | null) => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined && !multipart) headers["Content-Type"] = "application/json";
    if (tokens) headers.Authorization = "Bearer " + tokens.access_token;
    if (tokens && business) headers["X-RP-Business"] = business;
    if (pinHeader) headers["X-RP-Pin"] = pinHeader;
    return request(path, {
      method,
      headers,
      body: body === undefined ? undefined : multipart ? (body as FormData) : JSON.stringify(body),
    }, timeoutMs);
  };
  let tokens = auth ? await freshTokens() : null;
  if (auth && !tokens) throw new ApiError("Inicia sesión de nuevo.", 401);
  let response = await send(tokens);
  if (auth && response.status === 401) {
    tokens = await renew();
    if (!tokens) throw new ApiError("Inicia sesión de nuevo.", 401);
    response = await send(tokens);
  }
  const data = await readJson(response);
  if (!response.ok)
    throw new ApiError(
      typeof data.error === "string" ? data.error : OFFLINE,
      response.status,
    );
  return data as T;
}
