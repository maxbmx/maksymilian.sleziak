import { company, contact, isTodo, utm } from "../content";

/** Zwraca wartość z content.ts albo null, jeśli to jeszcze placeholder. */
const filled = (value: string) => (isTodo(value) ? null : value);

const email = filled(contact.email);
const calendar = filled(contact.calendarUrl);

/** Miejsce na stronie, z którego prowadzi link. Trafia do utm_content. */
export type Placement = "naglowek" | "hero" | "o-mnie" | "kontakt" | "kontakt-przycisk" | "stopka";

/** Dokleja parametry UTM do adresu, zachowując istniejące parametry i kotwicę. */
export function withUtm(url: string, placement: Placement) {
  const tagged = new URL(url);
  tagged.searchParams.set("utm_source", utm.source);
  tagged.searchParams.set("utm_medium", utm.medium);
  tagged.searchParams.set("utm_campaign", utm.campaign);
  tagged.searchParams.set("utm_content", placement);
  return tagged.href;
}

/** Gotowe adresy linków kontaktowych. null = dane nieuzupełnione, link się nie renderuje. */
export const contactLinks = {
  email: email && `mailto:${email}`,
  linkedin: filled(contact.linkedin),
};

/** Adres przycisku rozmowy z oznaczeniem miejsca kliknięcia. null = adres nieuzupełniony. */
export const calendarLink = (placement: Placement) => calendar && withUtm(calendar, placement);

/** Link do strony firmy z oznaczeniem miejsca kliknięcia. */
export const companyLink = (placement: Placement) => withUtm(company.url, placement);
