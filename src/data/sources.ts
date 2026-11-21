/**
 * Reference links for food, attire, destination and brand entries open a
 * Wikipedia lookup for the subject rather than a hard-coded article URL, so a
 * renamed article never produces a dead citation. They are pointers for
 * further reading, not audited citations.
 */
export function wikiLookup(term: string): string {
  const query = decodeURIComponent(term).replace(/_/g, " ");
  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}&go=Go`;
}
