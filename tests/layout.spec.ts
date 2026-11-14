import { expect, test } from "@playwright/test";
import { contact } from "../src/content";

const widths = [360, 768, 1280, 1920];

for (const width of widths) {
  test(`brak poziomego przewijania – ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("nagłówek mieści się w jednej linii na 360 px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const name = await page.locator(".site-name").boundingBox();
  const cta = await page.locator(".header-cta").boundingBox();
  expect(Math.abs(name!.y + name!.height / 2 - (cta!.y + cta!.height / 2))).toBeLessThan(4);
  // Jeden wiersz nazwiska ma 64 px (dwie kratki siatki); zawinięcie dałoby 128 px.
  expect(name!.height).toBeLessThanOrEqual(64);
});

test("hero widoczny bez przewijania na 1280×800", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeInViewport();
  await expect(page.locator(".hero .button")).toBeInViewport();
  await expect(page.locator(".hero-portrait img")).toBeInViewport();
});

test("imię i nazwisko widoczne od razu na telefonie (390×844)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeInViewport({ ratio: 1 });
});

test("przyciski „Umówmy rozmowę” prowadzą pod adres z content.ts", async ({ page }) => {
  await page.goto("/");
  for (const selector of [".header-cta", ".hero .button", "#kontakt .button"]) {
    await expect(page.locator(selector)).toHaveAttribute("href", contact.calendarUrl);
  }
});

test("przycisk w liście prowadzi do sekcji kontakt", async ({ page }) => {
  await page.goto("/");
  await page.locator(".letter-action .button").click();
  await expect(page.locator("#kontakt")).toBeInViewport();
});

test("strona działa bez JavaScriptu", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#kontakt")).toBeAttached();
  await context.close();
});

test("brak plików JavaScript na stronie", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (req) => {
    if (req.resourceType() === "script") scripts.push(req.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(scripts).toEqual([]);
});

test("budżet wydajności: start strony na telefonie poniżej 500 KB", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const sizes: Promise<number>[] = [];
  page.on("response", (res) => {
    sizes.push(
      res
        .body()
        .then((body) => body.length)
        .catch(() => 0),
    );
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const total = (await Promise.all(sizes)).reduce((sum, size) => sum + size, 0);
  expect(total, `przesłano ${Math.round(total / 1024)} KB`).toBeLessThan(500 * 1024);
});

test("żadne zdjęcie na telefonie nie przekracza 200 KB", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const images: Promise<string | null>[] = [];
  page.on("response", (res) => {
    if (res.request().resourceType() !== "image") return;
    images.push(
      res
        .body()
        .then((body) => (body.length > 200 * 1024 ? `${res.url()} (${body.length} B)` : null))
        .catch(() => null),
    );
  });
  await page.goto("/", { waitUntil: "networkidle" });
  // Przewinięcie do końca wczytuje też zdjęcia z lazy loadingiem.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState("networkidle");
  expect(images.length).toBeGreaterThan(0);
  expect((await Promise.all(images)).filter(Boolean)).toEqual([]);
});

test("portret w hero ładuje się priorytetowo, pozostałe zdjęcia leniwie", async ({ page }) => {
  await page.goto("/");
  const portrait = page.locator(".hero-portrait img");
  await expect(portrait).toHaveAttribute("fetchpriority", "high");
  await expect(portrait).not.toHaveAttribute("loading", "lazy");
  const others = page.locator("main img:not(.hero-portrait img)");
  for (const img of await others.all()) {
    await expect(img).toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("width", /\d+/);
    await expect(img).toHaveAttribute("height", /\d+/);
  }
});

test("strona nie pobiera plików fontów", async ({ page }) => {
  const fonts: string[] = [];
  page.on("request", (req) => {
    if (req.resourceType() === "font") fonts.push(req.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(fonts).toEqual([]);
});

test("brak zapytań do zewnętrznych serwerów (fonty, analityka)", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname) && url.protocol.startsWith("http"))
      external.push(req.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(external).toEqual([]);
});
