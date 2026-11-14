import { defineConfig, devices } from "@playwright/test";
import { site } from "./src/content";

// Smoke test działającej strony (domyślnie produkcji). Nie uruchamia lokalnego serwera.
export default defineConfig({
  testDir: "tests/smoke",
  retries: 2,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: process.env.BASE_URL ?? site.url },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
