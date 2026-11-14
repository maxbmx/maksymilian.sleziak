import { contact, isTodo } from "../content";

/** Zwraca wartość z content.ts albo null, jeśli to jeszcze placeholder. */
const filled = (value: string) => (isTodo(value) ? null : value);

const email = filled(contact.email);

/** Gotowe adresy linków kontaktowych. null = dane nieuzupełnione, link się nie renderuje. */
export const contactLinks = {
  email: email && `mailto:${email}`,
  linkedin: filled(contact.linkedin),
  calendar: filled(contact.calendarUrl),
};
