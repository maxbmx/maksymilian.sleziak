import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";

// Wzorce zrzutów ekranu. Po świadomej zmianie wyglądu: npm run test:e2e:update
// Strona używa fontów systemowych, więc wzorce są osobne dla każdego systemu
// (tests/__screenshots__/<platforma>/). Tam, gdzie wzorców nie ma, test jest pomijany.
const widths = [360, 768, 1280, 1920];

for (const width of widths) {
  test(`wygląd ${width} px`, async ({ page }, testInfo) => {
    const name = `home-${width}.png`;
    test.skip(
      testInfo.config.updateSnapshots === "missing" && !existsSync(testInfo.snapshotPath(name)),
      `brak wzorców dla systemu ${process.platform}`,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page).toHaveScreenshot(name, { fullPage: true });
  });
}
