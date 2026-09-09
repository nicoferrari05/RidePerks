import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/live",
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 180000,
  reporter: "list",
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3100",
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
