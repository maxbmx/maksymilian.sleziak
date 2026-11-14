/**
 * Wszystkie teksty strony.
 *
 * Żeby zmienić tekst na stronie, zmień go tutaj. Komponentów nie trzeba dotykać.
 * Miejsca do uzupełnienia są oznaczone funkcją todo("..."). Na stronie pokazują się
 * jako widoczny placeholder, a build produkcyjny (npm run build:prod) się nie uda,
 * dopóki choć jeden zostanie.
 *
 * Wartość null oznacza „nie pokazuj”. Pusta lista opinii ukrywa całą sekcję.
 */

export const TODO_MARKER = "DO UZUPEŁNIENIA";
export const todo = (what: string) => `[${TODO_MARKER}: ${what}]`;
export const isTodo = (value: string | null | undefined) =>
  typeof value === "string" && value.includes(TODO_MARKER);

export const site = {
  url: "https://maksymilian.sleziak.com",
  lang: "pl",
  locale: "pl_PL",
  title: "Maksymilian Śleziak, współzałożyciel Ageno | AI w e-commerce",
  description:
    "Maksymilian Śleziak (Sleziak), współzałożyciel Ageno z Bielska-Białej. Prowadzę firmę, która od 15 lat buduje e-commerce B2B i B2C, a dziś wdraża AI w sprzedaży internetowej.",
  // Nazwa strony w danych strukturalnych (ProfilePage).
  profileName: "Maksymilian Śleziak, strona osobista",
  ogImage: "/og.jpg",
  ogImageAlt: "Maksymilian Śleziak, współzałożyciel Ageno",
  // Kolor paska przeglądarki. Musi być równy tłu nagłówka strony, czyli --c-cream
  // w src/styles/global.css (pilnuje tego test).
  themeColor: "#f9f8f4",
  // Data pierwszej publikacji (RRRR-MM-DD) do danych strukturalnych. Popraw w dniu publikacji.
  publishedAt: "2026-11-13",
  skipLink: "Przejdź do treści",
};

export const person = {
  name: "Maksymilian Śleziak",
  alternateName: "Maksymilian Sleziak",
  firstName: "Maksymilian",
  lastName: "Śleziak",
  jobTitle: "Współzałożyciel i współwłaściciel Ageno",
  // Krótka forma stanowiska, używana w stopce.
  role: "współzałożyciel",
  city: "Bielsko-Biała",
  country: "PL",
  knowsAbout: ["AI w e-commerce", "e-commerce B2B", "e-commerce B2C", "Magento", "Pimcore", "PIM"],
};

export const company = {
  name: "Ageno",
  url: "https://ageno.pl",
  // Adres pokazywany jako tekst linku.
  urlLabel: "ageno.pl",
};

export const contact = {
  email: "maksymilian.sleziak@ageno.pl",
  linkedin: "https://www.linkedin.com/in/maksymiliansleziak/",
  // Adres, do którego prowadzą przyciski „Umówmy rozmowę” i „Umów rozmowę”.
  calendarUrl: "https://ageno.pl/kontakt",
};

export const header = {
  cta: "Umówmy rozmowę",
};

export const hero = {
  // Nadtytuł nad imieniem i nazwiskiem. Razem tworzą nagłówek „Cześć, jestem Maksymilian Śleziak”.
  eyebrow: "Cześć, jestem",
  lead: "Współzałożyciel Ageno. Od 2010 roku budujemy sklepy internetowe B2B i B2C na Magento i Pimcore.",
  specialties: "Dziś wdrażamy w nich AI, które ma zarabiać albo oszczędzać czas zespołu.",
  // Krótka lista z żółtymi znacznikami pod tekstem. Liczby pochodzą z realizacji
  // opisanych na ageno.pl (Martes Sport, Henry Schein Dental).
  highlights: [
    "Martes Sport: zamówienie w 24 godziny zamiast 7 dni",
    "Henry Schein: ponad 3000 klientów B2B z indywidualnymi cenami",
    "Adobe Solution Partner",
  ],
  cta: "Umówmy rozmowę",
  proof: "Ponad 90% naszych nowych projektów pochodzi z poleceń.",
  portraitAlt: "Maksymilian Śleziak",
};

export const numbers = {
  // Nazwa sekcji dla czytników ekranu (sekcja nie ma widocznego nagłówka).
  label: "Ageno w liczbach",
  items: [
    { value: "15 lat", label: "w e-commerce, od 2010 roku" },
    { value: "ok. 35 osób", label: "w zespole Ageno" },
    { value: "ponad 90%", label: "nowych projektów z poleceń" },
  ],
};

export type Client = { name: string; logo: string | null };

export const clients = {
  heading: "Zaufali nam",
  // Logotypy z ageno.pl, wrzucone bez zmian do src/assets/logos/ (SVG 600×400, znak na środku).
  // Wszystkie mają to samo płótno, więc strona pokazuje je w jednej skali.
  // Klient bez logo (logo: null) pokazuje się jako nazwa w kafelku.
  items: [
    { name: "Martes Sport", logo: "martes-sport.svg" },
    { name: "Eurofirany", logo: "eurofirany.svg" },
    { name: "PRO", logo: "pro.svg" },
    { name: "Kontakt-Simon", logo: "kontakt-simon.svg" },
    { name: "Henry Schein", logo: "henry-schein.svg" },
    { name: "Avionaut", logo: "avionaut.svg" },
  ] as Client[],
};

export const letter = {
  heading: "Dlaczego AI",
  paragraphs: [
    "Przez 15 lat widziałem, jak e-commerce zmienia się co kilka lat: nowe platformy, nowe kanały, nowe oczekiwania klientów. AI to największa z tych zmian, ale też najłatwiej na niej przepalić budżet.",
    "Dlatego w Ageno podchodzimy do AI jak do każdego innego wdrożenia. Zaczynamy od problemu biznesowego i liczby, którą chcemy poprawić. Jeśli AI w danym miejscu się nie opłaca, powiemy to wprost.",
    "Dobrym pierwszym krokiem są dane produktowe. ChatGPT, Claude i Gemini polecą tylko tę ofertę, którą potrafią odczytać. Audyt danych produktowych i ich uporządkowanie zajmuje kilka tygodni i przydaje się także wtedy, gdy na kolejne wdrożenia AI jest jeszcze za wcześnie.",
  ],
  signature: "Maksymilian Śleziak",
  signatureRole: "współzałożyciel Ageno",
  cta: "Porozmawiajmy o AI w Twoim sklepie",
};

export type CaseStudy = { client: string; problem: string; solution: string; result: string };

export const ai = {
  heading: "AI w e-commerce w Ageno",
  intro:
    "W Ageno wdrażamy AI tam, gdzie oszczędza czas zespołu albo zwiększa sprzedaż. Każde rozwiązanie trafia do działającego sklepu i jego procesów.",
  roleLabel: "Moja rola:",
  role: "Wyznaczam kierunek rozwoju firmy, dbam o to, żeby każde wdrożenie miało jasny cel biznesowy i mierzalny wynik, i odpowiadam za relację z klientem. Projekty realizuje nasz zespół specjalistów.",
  areasHeading: "W czym pomagamy",
  areas: [
    {
      title: "Sklep czytelny dla agentów AI",
      text: "Audyt API i danych produktowych. Sprawdzamy, czy asystenci AI potrafią odczytać Twoją ofertę, ceny i dostępność.",
    },
    {
      title: "Dane produktowe i PIM",
      text: "Porządkujemy dane w Pimcore i opisujemy je w schema.org, żeby rozumiały je wyszukiwarki i modele AI.",
    },
    {
      title: "Rekomendacje, scoring ofert i prognoza popytu",
      text: "Moduły AI dla sklepów B2B i B2C, dokładane tam, gdzie da się policzyć ich efekt.",
    },
    {
      title: "Szybszy rozwój sklepu",
      text: "Używamy AI przy analizie wymagań, testach, refaktoryzacji i wycenach, więc zmiany trafiają na produkcję wcześniej.",
    },
  ],
  // Przykład wdrożenia: null = blok ukryty. Gdy będzie gotowy, wpisz np.:
  // { client: "Producent mebli (B2B)", problem: "...", solution: "...", result: "..." }
  caseStudy: null as CaseStudy | null,
  caseStudyLabels: {
    heading: "Przykład wdrożenia:",
    problem: "Problem",
    solution: "Co zrobiliśmy",
    result: "Wynik",
  },
  advantage:
    "AI wdrażamy w systemach, które znamy od 15 lat, czyli w Magento i Pimcore. Ageno ma status Adobe Solution Partner.",
};

export const about = {
  heading: "O mnie",
  paragraphs: [
    "Jestem współzałożycielem Ageno, software house'u z Bielska-Białej, który od 2010 roku wdraża i rozwija platformy e-commerce dla dużych marek B2B i B2C.",
    "Zaczynałem jako projektant UX/UI i frontend developer, a wcześniej tworzyłem projekty w świecie BMX: markę odzieżową i portal bmx.pl. To nauczyło mnie patrzeć na sklep internetowy oczami klienta.",
    "W Ageno odpowiadam za sprzedaż, marketing i relacje z klientami. Za technologię odpowiada mój wspólnik, Krzysztof Kowalik, a projekty prowadzi zespół 35 specjalistów.",
    "Dziś prowadzimy Ageno w kierunku wdrożeń i rozwoju AI w e-commerce.",
  ],
  companyLinkLabel: "Więcej o firmie:",
};

export const principles = {
  heading: "Jak prowadzę współpracę",
  items: [
    {
      title: "Mówię wprost.",
      text: "Jeśli projekt nie ma sensu albo nie jesteśmy właściwą firmą, powiem to na pierwszym spotkaniu.",
    },
    {
      title: "Myślę długofalowo.",
      text: "Wdrożenie to początek współpracy. Z Martes Sport pracujemy od 2012 roku, z Henry Schein od 2019, z PRO i Avionaut od 2020.",
    },
    {
      title: "Jestem obecny, gdy jest trudno.",
      text: "W sytuacjach kryzysowych zachowuję spokój i biorę odpowiedzialność za komunikację z klientem.",
    },
  ],
};

export type Testimonial = { quote: string; name: string; role: string; company: string };

export const testimonials = {
  heading: "Co mówią klienci",
  // Pusta lista = sekcja ukryta. Dodawaj tylko opinie z pisemną zgodą autora.
  items: [] as Testimonial[],
  // Najkrótsza opinia, pokazywana przy przycisku w sekcji Kontakt. null = brak.
  featured: null as Testimonial | null,
};

export const personal = {
  heading: "Prywatnie",
  text: "Mieszkam w Bielsku-Białej. Jestem mężem i ojcem. Po pracy jeżdżę na rowerze szosowym i górskim po Beskidach i biegam.",
  photoAlt: "Maksymilian Śleziak w kasku rowerowym i okularach na leśnym szlaku w deszczu",
};

export const contactSection = {
  heading: "Porozmawiajmy o Twoim e-commerce",
  // Krótka zachęta pod nagłówkiem. null = brak.
  lead: "Opowiedz, co chcesz poprawić w swoim sklepie. Powiem wprost, czy AI ma tam sens i od czego bym zaczął." as
    string | null,
  cta: "Umów rozmowę",
  labels: {
    email: "E-mail",
    linkedin: "LinkedIn",
    linkedinLink: "Profil na LinkedIn",
    company: "Firma",
  },
};

export const notFound = {
  title: "Nie ma takiej strony",
  text: "Ten adres nie istnieje. Cała strona mieści się pod jednym adresem.",
  cta: "Wróć na stronę główną",
};

/** Zdjęcia z src/assets/images/. Po podmianie pliku wpisz tutaj jego nazwę. */
export const images = {
  portrait: "maksymilian-sleziak-portret.jpg",
  bike: "maksymilian-sleziak-rower.jpg",
};
