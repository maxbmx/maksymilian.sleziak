import type { ImageMetadata } from "astro";

type ImageModule = { default: ImageMetadata };

const photos = import.meta.glob<ImageModule>("../assets/images/*.{jpg,jpeg,png,webp}", {
  eager: true,
});
const logos = import.meta.glob<ImageModule>("../assets/logos/*.{svg,webp}", { eager: true });

function find(all: Record<string, ImageModule>, dir: string, file: string): ImageMetadata {
  const match = all[`../assets/${dir}/${file}`];
  if (!match) {
    throw new Error(`Brak pliku src/assets/${dir}/${file} – sprawdź nazwę w src/content.ts`);
  }
  return match.default;
}

/** Zwraca zdjęcie z src/assets/images/ po nazwie pliku podanej w content.ts. */
export const getImage = (file: string) => find(photos, "images", file);

/** Zwraca logotyp z src/assets/logos/ (SVG lub WebP) po nazwie pliku podanej w content.ts. */
export const getLogo = (file: string) => find(logos, "logos", file);
