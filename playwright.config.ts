import { defineConfig, devices } from "@playwright/test";

// Własny port: testy nie mogą trafić w serwer deweloperski (npm run dev, port 4321).
const TEST_URL = "http://localhost:4322";

export default defineConfig({
  testDir: "tests",
  // Smoke test produkcji ma własną konfigurację: playwright.smoke.config.ts
  testIgnore: "smoke/**",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.BASE_URL ?? TEST_URL,
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" },
  },
  // Fonty systemowe wyglądają inaczej w każdym systemie, więc wzorce są osobne dla platformy.
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{arg}{ext}",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Testy uruchamiają się na zbudowanej stronie (npm run build), tak jak na produkcji.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npx astro preview --port 4322",
        url: TEST_URL,
        reuseExistingServer: !process.env.CI,
      },
});
