// Smoke test produkcji. Uruchamiany po deployu na prawdziwym adresie:
//   npm run test:smoke                      -> https://maksymilian.sleziak.com
//   BASE_URL=https://inny-adres npm run test:smoke
import { expect, test } from "@playwright/test";
import { analytics, person, site, TODO_MARKER } from "../../src/content";
import { parseSchema } from "../helpers";

test("strona główna odpowiada 200 i jest indeksowalna", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"] ?? "").not.toContain("noindex");
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${site.url}/`);
});

test("h1 z imieniem i nazwiskiem, bez placeholderów", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText(person.name);
  expect(await page.content()).not.toContain(TODO_MARKER);
});

test("JSON-LD: Person z name, jobTitle, worksFor i sameAs", async ({ page }) => {
  await page.goto("/");
  const schema = await parseSchema(page);
  expect(schema.person.name).toBe(person.name);
  expect(schema.person.jobTitle).toBe(person.jobTitle);
  expect(schema.person.worksFor["@id"]).toBe(schema.org["@id"]);
  expect(schema.person.sameAs?.length).toBeGreaterThan(0);
});

test("http przekierowuje na https, nagłówki bezpieczeństwa ustawione", async ({ request }) => {
  const url = new URL(test.info().project.use.baseURL!);
  test.skip(url.protocol !== "https:", "tylko dla adresu https");
  const insecure = await request.get(`http://${url.host}/`, { maxRedirects: 0 });
  expect(insecure.status()).toBe(301);
  expect(insecure.headers()["location"]).toBe(`https://${url.host}/`);

  const headers = (await request.get("/")).headers();
  for (const name of [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
  ]) {
    expect(headers[name], name).toBeTruthy();
  }
});

test("pliki techniczne dostępne", async ({ request }) => {
  for (const path of ["/robots.txt", "/sitemap-index.xml", "/favicon.svg", site.ogImage]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test("analityka Cloudflare: skrypt z tokenem z content.ts, dopuszczony w CSP", async ({ page }) => {
  test.skip(!analytics.cloudflareToken, "brak tokenu w src/content.ts");
  const response = await page.goto("/");
  const beacon = page.locator('script[src="https://static.cloudflareinsights.com/beacon.min.js"]');
  await expect(beacon).toHaveCount(1);
  expect(JSON.parse((await beacon.getAttribute("data-cf-beacon")) ?? "{}").token).toBe(
    analytics.cloudflareToken,
  );
  const csp = response?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("https://static.cloudflareinsights.com");
  expect(csp).toContain("connect-src 'self' https://cloudflareinsights.com");
});
