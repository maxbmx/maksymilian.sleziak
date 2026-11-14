// Lighthouse na profilu mobilnym: 3 przebiegi, mediana, progi poniżej.
// Użycie: npm run build && npm run preview (w drugim terminalu), potem: npm run test:lighthouse
// Albo z innym adresem: BASE_URL=https://podglad.pages.dev npm run test:lighthouse
import { chromium } from "@playwright/test";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { mkdirSync, writeFileSync } from "node:fs";

const url = process.env.BASE_URL ?? "http://localhost:4321/";
const RUNS = 3;
const thresholds = { performance: 95, accessibility: 95, "best-practices": 95, seo: 100 };
const metricLimits = { "largest-contentful-paint": 2000, "cumulative-layout-shift": 0.05 };

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const runs = [];
try {
  for (let i = 0; i < RUNS; i++) {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: "html",
      logLevel: "error",
      formFactor: "mobile",
      onlyCategories: Object.keys(thresholds),
    });
    runs.push(result);
  }
} finally {
  chrome.kill();
}

const median = (arr) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
const failures = [];
console.log(`Lighthouse (mobile, mediana z ${RUNS}) – ${url}`);

for (const [cat, min] of Object.entries(thresholds)) {
  const score = median(runs.map((r) => Math.round(r.lhr.categories[cat].score * 100)));
  console.log(`  ${score >= min ? "✓" : "✗"} ${cat}: ${score} (próg ${min})`);
  if (score < min) failures.push(`${cat} ${score} < ${min}`);
}
for (const [audit, max] of Object.entries(metricLimits)) {
  const value = median(runs.map((r) => r.lhr.audits[audit].numericValue));
  const shown = audit.includes("shift") ? value.toFixed(3) : `${Math.round(value)} ms`;
  console.log(`  ${value <= max ? "✓" : "✗"} ${audit}: ${shown} (limit ${max})`);
  if (value > max) failures.push(`${audit} ${shown}`);
}

mkdirSync(".lighthouse", { recursive: true });
writeFileSync(".lighthouse/report.html", runs.at(-1).report);
console.log("  Raport: .lighthouse/report.html");

if (failures.length) {
  console.error("\n✗ Lighthouse poniżej progów: " + failures.join(", "));
  process.exit(1);
}
