import { expect, test, type Page } from "@playwright/test";

/*
 * Audyt geometrii 8 / 32 px na gotowej stronie. Mierzy getBoundingClientRect względem
 * wspólnego początku: X = lewa krawędź kontenera, Y = góra .page (przewija się z dokumentem).
 * Elementy kontrolowane mają atrybut data-grid:
 *   "32"   pozycja i wymiary na siatce 32 px,
 *   "32y"  pas na całą szerokość okna: tylko Y i wysokość (X to wyjątek: krawędź okna),
 *   "8"    X i szerokość na siatce 8 px, Y i wysokość na siatce 32 px (przyciski, komórki).
 * Wiersze tekstu i bloki treści są sprawdzane w pionie względem widocznej siatki 32 px:
 * każdy wiersz ma leżeć w kratce, a nie tylko w podziale 8 px.
 */
const TOLERANCE = 0.1;
// Wymagane szerokości oraz wartości tuż pod i nad progami 768, 992 i 1184 px.
const widths = [320, 375, 390, 393, 767, 768, 991, 992, 1024, 1183, 1184, 1280, 1440, 1920];

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.scrollTo(0, 0);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

function audit(page: Page, tolerance: number) {
  return page.evaluate((tol) => {
    const off = (value: number, step: number) => Math.abs(value - step * Math.round(value / step));
    const pageBox = document.querySelector(".page")!.getBoundingClientRect();
    const container = document.querySelector(".container")!.getBoundingClientRect();
    const originX = container.left;
    const originY = pageBox.top;
    const problems: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("[data-grid]")) {
      const mode = el.dataset.grid!;
      const step = mode.startsWith("32") ? 32 : 8;
      const box = el.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;
      // Margines z zaokrąglenia (--snap) należy do bloku: jego koniec to koniec marginesu.
      const snap = el.hasAttribute("data-snap") ? parseFloat(getComputedStyle(el).marginBottom) : 0;
      const checks: [string, number, number][] = [
        ["y", box.top - originY, 32],
        ["h", box.height + snap, 32],
      ];
      if (mode !== "32y") {
        checks.push(["x", box.left - originX, step], ["w", box.width, step]);
      }
      const bad = checks.filter(([, v, m]) => off(v, m) > tol).map(([k, v]) => [k, v] as const);
      if (bad.length > 0) {
        const name = `${el.tagName.toLowerCase()}.${el.className.replace(/\s*astro-\S+/g, "").trim()}`;
        problems.push(`${name} [${mode}] ${bad.map(([k, v]) => `${k}=${v.toFixed(2)}`).join(" ")}`);
      }
    }
    // Wnętrza: wiersze tekstu i bloki treści bez własnego oznaczenia. Sprawdzamy Y i wysokość
    // (szerokość tekstu wynika z kolumny albo z naturalnej długości słów).
    const inner =
      ".page :is(h1, h2, h3, p, ul, li, dl, dt, dd, figure, figcaption, blockquote, .site-name)";
    for (const el of document.querySelectorAll<HTMLElement>(inner)) {
      if (el.hasAttribute("data-grid")) continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;
      const y = box.top - originY;
      if (off(y, 32) > tol || off(box.height, 32) > tol) {
        const name = `${el.tagName.toLowerCase()}.${el.className.replace(/\s*astro-\S+/g, "").trim()}`;
        problems.push(`${name} [wiersz 32] y=${y.toFixed(2)} h=${box.height.toFixed(2)}`);
      }
    }
    const view = document.documentElement.clientWidth;
    return {
      problems,
      containerWidth: container.width,
      marginLeft: container.left,
      marginRight: view - container.right,
      overflow: document.documentElement.scrollWidth - view,
      // Faza widocznej siatki: przesunięcie wzoru względem .page.
      gridPhase: parseFloat(
        getComputedStyle(document.querySelector(".page")!, "::before").backgroundPositionX,
      ),
      pageLeft: pageBox.left,
      pageHeight: pageBox.height,
    };
  }, tolerance);
}

for (const width of widths) {
  test(`siatka 8/32 px – ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await settle(page);

    for (const scroll of [0, 1, 13, 37]) {
      await page.evaluate((y) => window.scrollTo(0, y), scroll);
      const result = await audit(page, TOLERANCE);
      expect(result.problems, `przewinięcie ${scroll} px`).toEqual([]);
      expect(result.containerWidth % 32, "kontener w module 32 px").toBe(0);
      expect(Math.abs(result.marginLeft - result.marginRight), "równe marginesy").toBeLessThan(
        TOLERANCE,
      );
      expect(result.marginLeft, "margines min. 16 px").toBeGreaterThanOrEqual(16);
      expect(result.overflow, "brak poziomego przewijania").toBeLessThanOrEqual(0);
      expect(
        Math.abs(result.gridPhase - (result.marginLeft - result.pageLeft)),
        "faza widocznej siatki = lewa krawędź kontenera",
      ).toBeLessThan(TOLERANCE);
      expect(result.pageHeight % 32, "wysokość dokumentu w module 32 px").toBeLessThan(TOLERANCE);
    }
  });
}

test("interlinie tekstu są wielokrotnością 32 px", async ({ page }) => {
  for (const width of [375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await settle(page);
    const bad = await page.evaluate(() => {
      const found = new Set<string>();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const el = walker.currentNode.parentElement!;
        if (!walker.currentNode.textContent!.trim() || el.closest("script, strong, .todo"))
          continue;
        const lh = parseFloat(getComputedStyle(el).lineHeight);
        if (Number.isNaN(lh) || lh % 32 !== 0)
          found.add(`${el.tagName} ${getComputedStyle(el).lineHeight}`);
      }
      return [...found];
    });
    expect(bad, `${width} px`).toEqual([]);
  }
});

test("strona 404 trzyma siatkę", async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/404");
    await settle(page);
    expect((await audit(page, TOLERANCE)).problems, `${width} px`).toEqual([]);
  }
});

test("porównywalne wiersze sąsiednich kolumn leżą na jednej linii", async ({ page }) => {
  for (const width of [768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await settle(page);
    const rows = await page.evaluate(() => {
      const tops = (selector: string) => [
        ...new Set(
          [...document.querySelectorAll(selector)].map((el) =>
            Math.round(el.getBoundingClientRect().top),
          ),
        ),
      ];
      const pair = (a: string, b: string) => [
        ...new Set(
          [a, b].map((s) => Math.round(document.querySelector(s)!.getBoundingClientRect().top)),
        ),
      ];
      return {
        liczby: tops(".number dd"),
        opisyLiczb: tops(".number dt"),
        hero: pair(".hero-text", ".hero-portrait"),
        oMnie: pair("#about-heading", "#principles-heading"),
        prywatnie: pair(".personal-photo", "#personal-heading"),
      };
    });
    for (const [name, tops] of Object.entries(rows)) {
      expect(tops, `${name} – ${width} px`).toHaveLength(1);
    }
  }
});

/*
 * Odporność na ustawienia użytkownika (WCAG 1.4.12 i powiększenie tekstu). Rytm 8 px może się
 * wtedy zmienić; sprawdzamy, że nic nie jest ucięte i strona nie przewija się w poziomie.
 */
const userSettings = {
  "odstępy tekstu": `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`,
  "tekst 200%": "html { font-size: 200% !important; }",
};

for (const [name, css] of Object.entries(userSettings)) {
  test(`ustawienia użytkownika: ${name}`, async ({ page }) => {
    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.addStyleTag({ content: css });
      await settle(page);
      const result = await page.evaluate(() => {
        const root = document.documentElement;
        const clipped = [...document.querySelectorAll<HTMLElement>(".button, .card, .col, h1, h2")]
          .filter(
            (el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
          )
          .map((el) => `${el.tagName} ${el.textContent!.trim().slice(0, 30)}`);
        return { overflow: root.scrollWidth - root.clientWidth, clipped };
      });
      expect(result.overflow, `poziome przewijanie – ${width} px`).toBeLessThanOrEqual(0);
      expect(result.clipped, `ucięta treść – ${width} px`).toEqual([]);
    }
  });
}
