import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".reference/**",
    "artifacts/**",
    "test-results/**",
    "playwright-report/**",
    "next-env.d.ts",
    // The phone app has its own lint (cd mobile && npx expo lint).
    "mobile/**",
  ]),
]);
