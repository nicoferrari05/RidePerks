# RidePerks phone app (iOS + Android)

React Native with Expo (SDK 58) and Expo Router. Same backend and same look
as the web: it calls the Next.js server's `/api/app/*` routes, and its colors
come from `src/theme/tokens.ts`, kept equal to the web's CSS by
`tests/mobile-tokens.test.mjs` at the repo root. Background and decisions:
"Phone app" in `../HANDOFF.md`.

## Try it on your phone (Windows or Mac)

1. Install **Expo Go** on the phone (App Store / Google Play).
2. Computer and phone on the same Wi-Fi.
3. In the repo root, start the backend: `npm run dev` (port 3000). If Windows
   asks whether Node.js may use the network, allow private networks.
4. In another terminal: `cd mobile`, then `npx expo start`.
5. Scan the QR code: iPhone with the Camera app, Android from Expo Go.

The app talks to the computer that serves it, on port 3000. To point it
elsewhere, create `mobile/.env.local` with
`EXPO_PUBLIC_API_URL=https://rideperks.app` (only once the `/api/app` routes
are deployed) or `EXPO_PUBLIC_API_PORT=3100`.

`.env.local` at the repo root may point at production data: sign in with a
test account, not a real driver's.

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

`npm run web` opens the app in a browser (port 8081). It's handy for quick
layout checks; the phone is the real test.

## Layout

- `src/app/`: screens (Expo Router; every file is a route).
- `src/components/`: shared pieces (`PressScale`, `Enter`, sign-in controls).
- `src/lib/`: backend calls (`api.ts`), the session (`session.tsx`), token
  storage in the keychain/keystore (`tokens-store.ts`), and the backend URL
  (`config.ts`).
- `src/theme/tokens.ts`: colors and fonts copied from the web.

Builds for the stores are made with EAS in the cloud (`npx eas-cli@latest
build`). No local Xcode or Android Studio is needed.
