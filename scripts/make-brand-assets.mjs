// Generuje obraz udostępniania (public/og.jpg, 1200×630) oraz ikony PNG.
// Używa fontu systemowego, tak jak strona, więc wynik zależy od komputera, na którym powstaje.
// Uruchom ponownie po podmianie portretu: npm run assets
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { images } from "../src/content.ts";

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const portraitJpg = await sharp(`src/assets/images/${images.portrait}`)
  .resize(480, 630, { fit: "cover" })
  .jpeg({ quality: 85 })
  .toBuffer();

const og = `<html><head><style>
  body{margin:0;width:1200px;height:630px;display:flex;background:#f9f8f4;font-family:${FONT};color:#111}
  .t{flex:1;padding:72px 64px;display:flex;flex-direction:column;justify-content:center}
  h1{font-size:68px;line-height:1.1;margin:0;font-weight:700;letter-spacing:-2px}
  p{font-size:30px;line-height:1.35;margin:28px 0 0;font-weight:400;color:#111}
  .bar{width:72px;height:8px;background:#fbcf2b;margin-bottom:36px}
  img{width:480px;height:630px;object-fit:cover}
</style></head><body>
  <div class="t"><div class="bar"></div><h1>Maksymilian Śleziak</h1><p>Współzałożyciel Ageno.<br>AI w e-commerce dla marek B2B i B2C.</p></div>
  <img src="data:image/jpeg;base64,${portraitJpg.toString("base64")}">
</body></html>`;

const icon = (size) => `<html><head><style>
  body{margin:0;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:#fbcf2b;font-family:${FONT};color:#320101}
  span{font-size:${Math.round(size * 0.46)}px;font-weight:700;letter-spacing:-0.02em}
</style></head><body><span>MŚ</span></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(html, w, h, out, type = "png") {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html);
  await page.screenshot({ path: out, type, ...(type === "jpeg" ? { quality: 85 } : {}) });
  console.log("✓", out);
}

await shot(og, 1200, 630, "public/og.jpg", "jpeg");
await shot(icon(180), 180, 180, "public/apple-touch-icon.png");
await shot(icon(32), 32, 32, "public/favicon-32.png");
await browser.close();
