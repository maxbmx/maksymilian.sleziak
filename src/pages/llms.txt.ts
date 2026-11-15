import type { APIRoute } from "astro";
import { ai, company, contact, faq, llms, person, site } from "../content";
import { contactLinks } from "../lib/links";

/**
 * /llms.txt: opis strony dla modeli AI w formacie z llmstxt.org (Markdown: tytuł,
 * streszczenie w cytacie, sekcje z listami). Składany z content.ts, żeby nie rozjechał
 * się z treścią strony. Linki są bez UTM, bo to adresy do cytowania, a nie do klikania.
 */
export const GET: APIRoute = () => {
  const links = [
    `- [${llms.links.site}](${site.url}/)`,
    `- [${llms.links.contact}](${contact.calendarUrl})`,
    contactLinks.linkedin && `- [${llms.links.linkedin}](${contactLinks.linkedin})`,
    `- [${llms.links.company}](${company.url})`,
  ].filter(Boolean);

  const sections = [
    `# ${person.name}`,
    `> ${llms.summary}`,
    `## ${llms.factsHeading}\n\n${llms.facts.map((fact) => `- ${fact}`).join("\n")}`,
    `## ${llms.areasHeading}\n\n${ai.areas.map((area) => `- ${area.title}`).join("\n")}`,
    faq.items.length > 0 &&
      `## ${llms.faqHeading}\n\n${faq.items
        .map((item) => `### ${item.question}\n\n${item.answer}`)
        .join("\n\n")}`,
    `## ${llms.linksHeading}\n\n${links.join("\n")}`,
  ].filter(Boolean);

  return new Response(sections.join("\n\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
