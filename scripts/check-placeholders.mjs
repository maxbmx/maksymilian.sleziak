// Strażnik placeholderów: przerywa build produkcyjny, jeśli na stronie zostało coś do uzupełnienia.
// Uruchamiany przez `npm run build:prod`.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const forbidden = [
  { pattern: /DO UZUPE[ŁL]NIENIA/gi, why: "nieuzupełniona treść" },
  { pattern: /lorem ipsum/gi, why: "tekst testowy" },
  { pattern: /\bTODO\b/g, why: "znacznik TODO" },
];

const problems = [];
for (const name of readdirSync(DIST, { recursive: true })) {
  if (!name.endsWith(".html")) continue;
  const file = join(DIST, name);
  const html = readFileSync(file, "utf8");
  for (const { pattern, why } of forbidden) {
    const count = html.match(pattern)?.length ?? 0;
    if (count) problems.push(`${file}: ${why} (${count}×)`);
  }
}

if (problems.length) {
  console.error("\n✗ Strona nie jest gotowa do publikacji:\n");
  for (const p of problems) console.error("  - " + p);
  console.error("\nUzupełnij src/content.ts.\n");
  process.exit(1);
}
console.log("✓ Brak placeholderów – strona gotowa do publikacji.");
