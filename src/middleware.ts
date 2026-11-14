import { defineMiddleware } from "astro:middleware";
import { polishTypography } from "./lib/typography";

// Poprawia sierotki i ostatnie wiersze akapitów w każdej stronie HTML
// (w podglądzie i w buildzie). Opis reguł: src/lib/typography.ts.
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const html = await response.text();
  return new Response(polishTypography(html), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
});
