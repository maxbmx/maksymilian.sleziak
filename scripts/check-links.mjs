// Sprawdza linki w zbudowanej stronie (dist/):
//  - kotwice (#kontakt) wskazują na istniejące id,
//  - pliki lokalne (/og.jpg, /_astro/...) istnieją,
//  - linki mailto: i tel: mają poprawny format,
//  - z flagą --external: linki zewnętrzne odpowiadają (status < 400).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const external = process.argv.includes("--external");
const files = ["dist/index.html", "dist/404.html"];
const errors = [];
const externalUrls = new Set();

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const refs = [
    ...[...html.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) =>
      m[1].split(",").map((s) => s.trim().split(/\s+/)[0]),
    ),
  ];

  for (const ref of refs) {
    if (ref.startsWith("#")) {
      if (ref.length > 1 && !ids.has(ref.slice(1))) errors.push(`${file}: brak elementu ${ref}`);
    } else if (ref.startsWith("mailto:")) {
      if (!/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(ref))
        errors.push(`${file}: zły e-mail ${ref}`);
    } else if (ref.startsWith("tel:")) {
      if (!/^tel:\+?\d{9,15}$/.test(ref)) errors.push(`${file}: zły telefon ${ref}`);
    } else if (/^https?:\/\//.test(ref)) {
      if (ref.startsWith("https://maksymilian.sleziak.com/")) {
        const local = join("dist", new URL(ref).pathname);
        if (!existsSync(local) && !existsSync(join(local, "index.html")))
          errors.push(`${file}: brak pliku dla ${ref}`);
      } else externalUrls.add(ref);
    } else if (ref.startsWith("/")) {
      const local = join("dist", decodeURIComponent(ref.split("#")[0]));
      if (!existsSync(local) && !existsSync(join(local, "index.html")))
        errors.push(`${file}: brak pliku ${ref}`);
    }
  }
}

if (external) {
  for (const url of externalUrls) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      // LinkedIn blokuje roboty (status 999) – traktujemy jako działający.
      if (res.status >= 400 && res.status !== 999)
        errors.push(`zewnętrzny link ${url}: ${res.status}`);
    } catch (e) {
      errors.push(`zewnętrzny link ${url}: ${e.message}`);
    }
  }
}

if (errors.length) {
  console.error("✗ Problemy z linkami:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(
  `✓ Linki poprawne${external ? ` (w tym ${externalUrls.size} zewnętrznych)` : " (zewnętrzne pominięte, użyj --external)"}.`,
);
