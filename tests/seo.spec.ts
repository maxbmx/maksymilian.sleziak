import { expect, test } from "@playwright/test";
import { company, faq, person, site } from "../src/content";
import { parseSchema } from "./helpers";

const CANONICAL = `${site.url}/`;

test.describe("SEO i treść", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("dokładnie jeden h1 z imieniem i nazwiskiem", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText(person.name);
  });

  test("title, description, lang i canonical", async ({ page }) => {
    await expect(page).toHaveTitle(site.title);
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      site.description,
    );
    expect(site.description).toContain(person.name);
    expect(site.description.length).toBeGreaterThan(70);
    expect(site.description.length).toBeLessThanOrEqual(200);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute("href", CANONICAL);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /width=device-width/,
    );
  });

  test("strona jest indeksowalna (brak noindex w wersji produkcyjnej)", async ({ page }) => {
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).not.toContain("noindex");
  });

  test("Open Graph z obrazem 1200×630", async ({ page, request }) => {
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toBe(`${site.url}${site.ogImage}`);
    const res = await request.get(site.ogImage);
    expect(res.ok()).toBeTruthy();
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
      "content",
      "1200",
    );
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
      "content",
      "630",
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", site.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      "content",
      site.description,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "pl_PL");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("theme-color zgodny z tłem nagłówka strony", async ({ page }) => {
    const background = await page.evaluate(() => {
      const header = document.querySelector(".site-header")!;
      const [r, g, b] = getComputedStyle(header).backgroundColor.match(/\d+/g)!.map(Number);
      return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
    });
    expect(background).toBe(site.themeColor);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      site.themeColor,
    );
  });

  test("wygląd nie zależy od trybu ciemnego systemu", async ({ page }) => {
    const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.emulateMedia({ colorScheme: "light" });
    const light = await background();
    await page.emulateMedia({ colorScheme: "dark" });
    expect(await background()).toBe(light);
  });

  test("JSON-LD: Person i Organization jako osobne byty", async ({ page }) => {
    const schema = await parseSchema(page);

    expect(schema.person.name).toBe(person.name);
    expect(schema.person.alternateName).toBe(person.alternateName);
    expect(schema.person.jobTitle).toBe(person.jobTitle);
    expect(schema.person.address.addressLocality).toBe(person.city);
    expect(schema.person.worksFor["@id"]).toBe(schema.org["@id"]);
    expect(schema.org.name).toBe(company.name);
    expect(schema.org.url).toBe(company.url);
    expect(schema.org.founder["@id"]).toBe(schema.person["@id"]);
    expect(schema.profile.mainEntity["@id"]).toBe(schema.person["@id"]);
    expect(schema.person["@id"]).not.toBe(schema.org["@id"]);
    // sameAs: tylko profile osoby, nigdy strona firmy, tylko prawdziwe adresy.
    // (Obecność sameAs na produkcji sprawdza tests/smoke/.)
    for (const url of schema.person.sameAs ?? []) {
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toContain(new URL(company.url).hostname);
    }
  });

  test("obie formy nazwiska: Śleziak i Sleziak", async ({ page }) => {
    const html = await page.content();
    expect(html).toContain(person.name);
    expect(html).toContain(person.alternateName);
  });

  test("każdy obraz ma atrybut alt", async ({ page }) => {
    const missing = await page.locator("img:not([alt])").count();
    expect(missing).toBe(0);
  });

  test("pytania i odpowiedzi: treść z content.ts na stronie i w JSON-LD", async ({ page }) => {
    await page.goto("/");
    // Typografia wstawia twarde spacje, więc porównujemy tekst po ujednoliceniu odstępów.
    const clean = (text: string) => text.replace(/\s+/g, " ").trim();
    const items = page.locator("#pytania li");
    await expect(items).toHaveCount(faq.items.length);
    for (const [index, item] of faq.items.entries()) {
      expect(clean(await items.nth(index).locator("h3").innerText())).toBe(item.question);
      expect(clean(await items.nth(index).locator("p").innerText())).toBe(item.answer);
    }

    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const graph: Array<{ "@type": string; mainEntity?: unknown }> = JSON.parse(raw ?? "")["@graph"];
    const faqPage = graph.find((node) => node["@type"] === "FAQPage");
    expect(faqPage?.mainEntity).toEqual(
      faq.items.map((item) => ({
        "@type": "Question",
        name: clean(item.question),
        acceptedAnswer: { "@type": "Answer", text: clean(item.answer) },
      })),
    );
  });

  test("llms.txt: opis strony dla modeli AI, zgodny z content.ts", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("text/plain");
    const text = await response.text();
    expect(text.startsWith(`# ${person.name}\n\n> `)).toBeTruthy();
    expect(text).toContain(person.alternateName);
    expect(text).toContain(`${CANONICAL}`);
    for (const item of faq.items) expect(text).toContain(`### ${item.question}`);
    // Adresy do cytowania, bez oznaczeń kampanii.
    expect(text).not.toContain("utm_");
  });

  test("robots.txt: jawne zgody dla robotów AI, bez blokad", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    for (const bot of [
      "OAI-SearchBot",
      "GPTBot",
      "ClaudeBot",
      "PerplexityBot",
      "Google-Extended",
    ]) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
    expect(robots).not.toMatch(/^Disallow:/m);
  });

  test("pliki techniczne: robots, sitemap, favicon, 404", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("sitemap-index.xml");
    expect((await request.get("/sitemap-index.xml")).ok()).toBeTruthy();
    const sitemap = await (await request.get("/sitemap-0.xml")).text();
    expect(sitemap).toContain(`<loc>${CANONICAL}</loc>`);
    expect(sitemap).not.toContain("404");
    expect((await request.get("/favicon.svg")).ok()).toBeTruthy();
    expect((await request.get("/favicon-32.png")).ok()).toBeTruthy();
    expect((await request.get("/apple-touch-icon.png")).ok()).toBeTruthy();
    expect((await request.get("/nie-ma-takiej-strony")).status()).toBe(404);
  });

  test("strona 404 ma noindex", async ({ page }) => {
    await page.goto("/404");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});
