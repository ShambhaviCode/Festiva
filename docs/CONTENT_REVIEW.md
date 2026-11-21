# Content review and source provenance

How FESTIVA's cultural content is sourced, labelled and reviewed. The rule that matters most: **nothing is marked "reviewed" unless a named person with relevant standing reviewed it and agreed to be credited.** Automated checks, AI tools and FESTIVA's builders never count as reviewers.

## What every festival carries

| Field | Where | Status shown to readers |
| --- | --- | --- |
| Name, local name, names in original scripts with language tags | `src/data/festivals.ts`, `src/data/festival-culture.ts` | Part of the page |
| Countries, region, communities ("observed by") | `festivals.ts` | Part of the page |
| Calendar system and date rule | `festivals.ts` (`date`), `festival-culture.ts` (`calendarSystem`) | "Calendar" in the page header |
| Next date, with its own status | `date.occurrences` for movable festivals | Fixed date / calculated from a rule / checked against published calendars / projected / not yet checked / seasonal, with date sources linked |
| History, significance, traditions, regional variations, etiquette | `festivals.ts` | Each section's kind of claim is explained on the page (see below) |
| Symbols and meanings | `festival-culture.ts` | Part of the page |
| Food, dress, places, music | `foods.ts`, `attire.ts`, `destinations.ts`, `music.ts` | Linked; each has a further-reading source |
| Sources | `provenance` | "Sources and reliability" at the foot of the page |
| Expert review | `src/data/reviews.ts` | "Not yet reviewed by a cultural expert" unless a review record exists |

## Kinds of claim

Festival pages separate four kinds of statement, so readers can tell history from belief:

- **History and origins: documented history.** Summarised from the reference sources. Where an origin is traditional rather than documented (for example a founding legend), the text says "tradition holds" or "is said to".
- **Why it matters: belief and interpretation.** What the festival means to those who keep it, in their terms. Not a claim about the divine.
- **Traditions and how it varies: community practice.** Customs differ by family, place and generation.
- **Celebrating respectfully: guidance.** General advice for guests; local custom comes first.

## Date statuses

- **Checked against published calendars**: the date was compared with the cited source on the date shown (`lastChecked`). At least one source is required (enforced by `tests/unit/data-integrity.test.ts`).
- **Projected**: from a projection or a rule that authorities confirm later (moon sighting, government announcement). Sources required; the note says what is uncertain.
- **Not yet checked**: shown with a warning; no `lastChecked` date.
- **Calculated from a rule / fixed / seasonal**: from the date rule itself.

Movable festivals carry checked dates for the next occurrence only. Add next year's rows before the current ones pass.

## Adding or changing a festival

1. Research from at least one reference source and, for dates, the most authoritative calendar available (a government, religious body or established almanac).
2. Add the entry to `festivals.ts` and its names, symbols and calendar to `festival-culture.ts`. Link at least one food, place or garment so the Matchmaker can use it.
3. Use `reference(...)` provenance for text, and give each date its honest status.
4. Run `npm test`. The integrity tests check sources, language tags, date sources and links.
5. Regenerate the database seed: `npm run db:seed:generate`.

## Recording an expert review

1. Ask someone with standing in the tradition (a religious leader, community elder, cultural organisation or scholar of it) to read the festival page. Send them the page and this checklist: accuracy of history; wording of beliefs; whether anything shared should not be; etiquette; names and spellings; images or symbols that cause offence.
2. Make their corrections.
3. With their written agreement to be named, add a record to `EXPERT_REVIEWS` in `src/data/reviews.ts`: festival, reviewer, credentials, date, and what they checked. The integrity test rejects a record without these.
4. The page then says who reviewed it, when, and what they checked. Re-review after substantial edits.

Today `EXPERT_REVIEWS` is empty, and every page says it has not been reviewed.
