import { normalise } from "./text";

/**
 * Search scoring with no data imports, so the browser (global search palette) and the server
 * (FESTIVA Intelligence) rank results the same way.
 */
export interface Scorable {
  title: string;
  /** Normalised alternative names (local names, aliases); matched like the title. */
  alt: string;
  /** Normalised text used for matching, padded with spaces. */
  haystack: string;
}

/**
 * Score a document against query tokens. Tokens match at the start of a word
 * ("lant" finds "lantern"; text in the middle of a word is ignored),
 * and every token must match somewhere or the document is dropped.
 */
export function scoreDoc(docItem: Scorable, tokens: string[]): number {
  const title = ` ${normalise(docItem.title)} `;
  const alt = ` ${docItem.alt} `;
  let score = 0;
  for (const token of tokens) {
    const word = ` ${token}`;
    if (title === `${word} `) score += 8;
    else if (title.includes(`${word} `)) score += 6;
    else if (title.includes(word)) score += 5;
    else if (alt.includes(`${word} `)) score += 5;
    else if (alt.includes(word)) score += 4;
    else if (docItem.haystack.includes(`${word} `)) score += 2;
    else if (token.length >= 3 && docItem.haystack.includes(word)) score += 1;
    else return 0;
  }
  return score;
}

export function tokenise(query: string): string[] {
  return normalise(query).split(" ").filter(Boolean);
}

/** Rank any scorable list; ties break alphabetically. */
export function rank<T extends Scorable>(items: T[], query: string, limit = 20): T[] {
  const tokens = tokenise(query);
  if (tokens.length === 0) return [];
  return items
    .map((d) => ({ d, score: scoreDoc(d, tokens) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score || a.d.title.localeCompare(b.d.title))
    .slice(0, limit)
    .map((e) => e.d);
}
