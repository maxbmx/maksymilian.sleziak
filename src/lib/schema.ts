import { company, faq, hero, person, site } from "../content";
import { contactLinks } from "./links";

/** Dane strukturalne (JSON-LD): osoba i firma jako osobne byty z własnym @id. */
export function buildSchema(imageUrl: string) {
  const personId = `${site.url}/#person`;
  const orgId = `${company.url}/#organization`;
  // Do sameAs trafiają tylko profile osoby (nie strona firmy) i tylko uzupełnione.
  const sameAs = [contactLinks.linkedin].filter((url) => url !== null);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${site.url}/#profilepage`,
        url: site.url,
        name: site.profileName,
        inLanguage: site.lang,
        dateCreated: site.publishedAt,
        dateModified: new Date().toISOString().slice(0, 10),
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: person.name,
        alternateName: person.alternateName,
        description: hero.lead,
        url: site.url,
        image: imageUrl,
        jobTitle: person.jobTitle,
        worksFor: { "@id": orgId },
        address: {
          "@type": "PostalAddress",
          addressLocality: person.city,
          addressCountry: person.country,
        },
        knowsAbout: person.knowsAbout,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: company.name,
        url: company.url,
        founder: { "@id": personId },
      },
      // Pytania i odpowiedzi widoczne na stronie. Bez pytań węzła nie ma.
      ...(faq.items.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${site.url}/#faq`,
              url: `${site.url}/#pytania`,
              inLanguage: site.lang,
              mainEntity: faq.items.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
          ]
        : []),
    ],
  };
}
