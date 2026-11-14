import type { Page } from "@playwright/test";

type Ref = { "@id": string };

export type Schema = {
  profile: Ref & { mainEntity: Ref };
  person: Ref & {
    name: string;
    alternateName: string;
    jobTitle: string;
    worksFor: Ref;
    address: { addressLocality: string };
    sameAs?: string[];
  };
  org: Ref & { name: string; url: string; founder: Ref };
};

/** Czyta JSON-LD ze strony i zwraca trzy byty z @graph. Rzuca błąd, jeśli któregoś brakuje. */
export async function parseSchema(page: Page): Promise<Schema> {
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const graph: Array<{ "@type": string }> = JSON.parse(raw ?? "")["@graph"];
  const node = (type: string) => {
    const found = graph.find((n) => n["@type"] === type);
    if (!found) throw new Error(`Brak ${type} w JSON-LD`);
    return found;
  };
  return {
    profile: node("ProfilePage"),
    person: node("Person"),
    org: node("Organization"),
  } as unknown as Schema;
}
