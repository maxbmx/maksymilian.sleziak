import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { site } from "../src/content";

// @axe-core/playwright ma typy dla nowszego Playwrighta niż przypięty w projekcie;
// w działaniu są zgodne, więc rzutujemy typ strony.
type AxePage = ConstructorParameters<typeof AxeBuilder>[0]["page"];

// Strona ma jeden wygląd (bez trybu ciemnego), ale sprawdzamy ją przy obu ustawieniach systemu.
for (const colorScheme of ["light", "dark"] as const) {
  test(`dostępność (axe) – system w trybie ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    const results = await new AxeBuilder({ page: page as unknown as AxePage })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`),
      "naruszenia serious/critical",
    ).toEqual([]);
  });
}

test("klawiatura: pierwszy Tab to link „Przejdź do treści”", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText(site.skipLink);
  await expect(focused).toBeVisible();
});

test("klawiatura: każdy link i przycisk dostaje widoczny focus", async ({ page }) => {
  await page.goto("/");
  const count = await page.locator("a[href], button").count();
  for (let i = 0; i < count; i++) {
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return getComputedStyle(el).outlineStyle;
    });
    expect(outline).not.toBe("none");
  }
});

test("przyciski i linki kontaktowe mają obszar kliknięcia min. 44×44 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const button of await page.locator(".button, #kontakt dd a").all()) {
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
});
