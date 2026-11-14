/*
 * Strona ma jeden skrypt wstawiony w treść (src/scripts/snap.js). Polityka CSP w public/_headers
 * dopuszcza go po hashu. Ten skrypt sprawdza po buildzie, że hash się zgadza.
 *
 *   node scripts/check-csp.mjs          sprawdza dist/ i kończy błędem przy różnicy
 *   node scripts/check-csp.mjs --write  wpisuje aktualny hash do public/_headers
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HEADERS = "public/_headers";
const write = process.argv.includes("--write");

const pages = readdirSync("dist", { recursive: true })
  .filter((file) => file.endsWith(".html"))
  .map((file) => join("dist", file));

const hashes = new Set();
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    // Dane strukturalne (JSON-LD) nie są wykonywane, więc CSP ich nie dotyczy.
    if (attrs.includes("application/ld+json") || attrs.includes("src=")) continue;
    hashes.add(`'sha256-${createHash("sha256").update(body).digest("base64")}'`);
  }
}

const headers = readFileSync(HEADERS, "utf8");
const expected = ["'self'", ...hashes].join(" ");
const current = headers.match(/script-src ([^;]*);/)?.[1];

if (current === expected) {
  console.log(`CSP: script-src zgodne z treścią strony (${hashes.size} skrypt inline).`);
} else if (write) {
  writeFileSync(HEADERS, headers.replace(/script-src [^;]*;/, `script-src ${expected};`));
  console.log(`CSP: zapisano script-src ${expected} w ${HEADERS}. Zbuduj stronę ponownie.`);
} else {
  console.error(`CSP: w ${HEADERS} jest "script-src ${current}", a strona wymaga "${expected}".`);
  console.error("Uruchom: node scripts/check-csp.mjs --write, a potem ponownie build.");
  process.exit(1);
}
