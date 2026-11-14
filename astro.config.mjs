// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://maksymilian.sleziak.com",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  build: {
    // Cały CSS w <head>, bez osobnego zapytania – szybszy pierwszy render.
    inlineStylesheets: "always",
  },
  image: {
    responsiveStyles: true,
  },
  devToolbar: { enabled: false },
});
