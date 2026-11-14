/**
 * Polska typografia w gotowym HTML-u, bez dotykania tekstów w content.ts.
 *
 * 1. Sierotki: jednoliterowe słowa (a, i, o, u, w, z) nie zostają na końcu wiersza,
 *    bo spacja po nich zamienia się w twardą.
 * 2. Ostatni wiersz: ostatnie słowo akapitu, punktu listy i opisu nie zostaje samo,
 *    bo łączy się twardą spacją ze słowem przed nim.
 *
 * Zmieniany jest tylko tekst w <body>. Znaczniki, atrybuty, skrypty i style zostają
 * bez zmian, więc <title>, opis strony i JSON-LD nie dostają twardych spacji.
 */

const NBSP = "&nbsp;";
const TOKEN = /(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/i;
// Jednoliterowe słowo po początku tekstu, spacji, nawiasie, cudzysłowie albo twardej spacji.
const SINGLE_LETTER = /(^|[\s(„"]|&nbsp;)([aiouwz])\s+(?=\S)/gi;
// Bloki, w których pilnujemy ostatniego wiersza. Nagłówki zostają bez zmian:
// są krótkie, a sklejone słowa mogłyby nie zmieścić się na wąskim ekranie.
const WIDOW_BLOCK = /^<\/(p|li|dd|blockquote)>$/i;
const BLOCK_TAG =
  /^<\/?(p|li|dd|dt|blockquote|div|section|article|ul|ol|dl|h[1-6]|figure|header|footer|main)\b/i;
// Krótsze teksty zostają bez zmian (etykiety, podpisy).
const MIN_WORDS = 4;

const isTag = (token: string) => token.startsWith("<");

function fixSingleLetters(text: string): string {
  // Dwa przebiegi łapią ciągi typu „a w domu”.
  return text.replace(SINGLE_LETTER, `$1$2${NBSP}`).replace(SINGLE_LETTER, `$1$2${NBSP}`);
}

/** Łączy dwa ostatnie słowa bloku kończącego się na tokenie `close`. */
function fixLastLine(tokens: string[], close: number): void {
  const textIndexes: number[] = [];
  for (let i = close - 1; i >= 0; i--) {
    const token = tokens[i];
    if (isTag(token)) {
      if (!BLOCK_TAG.test(token)) continue;
      // Zagnieżdżony blok obsługuje własne zamknięcie.
      if (token.startsWith("</")) return;
      break;
    }
    textIndexes.push(i);
  }

  const words = textIndexes
    .map((i) => tokens[i])
    .reverse()
    .join("")
    .replace(/&nbsp;/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < MIN_WORDS) return;

  // Szukamy od końca ostatniego odstępu, po którym jest jeszcze jakieś słowo.
  let tail = "";
  for (const i of textIndexes) {
    const token = tokens[i];
    const end = tail.trim() ? token.length : token.trimEnd().length;
    const head = token.slice(0, end);
    const match = /\s+(?=\S*$)/.exec(head);
    if (match) {
      const after = head.slice(match.index + match[0].length) + token.slice(end) + tail;
      // Ostatnie słowo jest już przyklejone twardą spacją (np. po „w”).
      if (after.includes(NBSP)) return;
      // Odstęp na samym początku bloku nie rozdziela słów.
      const before = head.slice(0, match.index);
      const hasWordBefore =
        before.trim() !== "" || textIndexes.some((j) => j < i && tokens[j].trim() !== "");
      if (!hasWordBefore) return;
      tokens[i] = before + NBSP + token.slice(match.index + match[0].length);
      return;
    }
    tail = token + tail;
  }
}

export function polishTypography(html: string): string {
  const bodyStart = html.search(/<body[\s>]/i);
  if (bodyStart === -1) return html;

  const tokens = html.slice(bodyStart).split(TOKEN);
  for (let i = 0; i < tokens.length; i++) {
    if (!isTag(tokens[i])) tokens[i] = fixSingleLetters(tokens[i]);
  }
  for (let i = 0; i < tokens.length; i++) {
    if (WIDOW_BLOCK.test(tokens[i])) fixLastLine(tokens, i);
  }
  return html.slice(0, bodyStart) + tokens.join("");
}
