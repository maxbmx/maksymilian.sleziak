// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "dist/",
      ".astro/",
      ".claude/",
      "node_modules/",
      "test-results/",
      "playwright-report/",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    // Skrypty i konfiguracja uruchamiane w Node.
    files: ["scripts/**/*.mjs", "*.config.{mjs,ts}"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        fetch: "readonly",
        URL: "readonly",
      },
    },
  },
  {
    // Jedyny skrypt strony, wykonywany w przeglądarce.
    files: ["src/scripts/**/*.js"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        getComputedStyle: "readonly",
        ResizeObserver: "readonly",
      },
    },
  },
);
