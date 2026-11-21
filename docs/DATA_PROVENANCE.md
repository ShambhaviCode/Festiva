# Data provenance

FESTIVA's guide is curated by hand and kept deliberately small. This page says where each kind of information comes from and how far it can be trusted.

## Verification statuses

| Status | Meaning |
| --- | --- |
| `verified` | Checked against the cited source on the recorded `lastChecked` date |
| `projected` | A published projection that can still move, such as moon-sighting dependent dates |
| `reference` | Written from general reference knowledge with a link for further reading; not individually audited |
| `unchecked` | Believed correct but not checked during the build; the UI tells people to confirm locally |

The database stores the same information in `source_url`, `verification_status` and `last_checked_at` columns.

## Festival dates

| Kind | How the date is produced | Examples |
| --- | --- | --- |
| Fixed | Calculated | Christmas, Día de Muertos, Songkran, Naadam |
| Weekday rule | Calculated | Thanksgiving, La Tomatina |
| Easter offset | Calculated from the Gregorian computus | Semana Santa, Carnival in Rio |
| Custom rule | Calculated | Oktoberfest, Swedish Midsummer |
| Lunar or regional | Stored table, each row with source and status | Diwali, Holi, Eid, Lunar New Year, Hanukkah |
| Seasonal | No date shown | Hanami |

Movable dates were checked on **16 November 2026** against these sources:

| Festival | Date stored | Status | Source |
| --- | --- | --- | --- |
| Hanukkah 2026 | sunset 4 Dec to 12 Dec 2026 | verified | My Jewish Learning |
| Hanukkah 2027 | sunset 24 Dec 2027 to 1 Jan 2028 | verified | My Jewish Learning |
| Lunar New Year 2027 | 6 Feb (to Lantern Festival, 20 Feb) | verified | China Highlights |
| Eid al-Fitr 2027 | 9 or 10 March | projected | Gulf News, Khaleej Times |
| Holi 2027 | 22 March (Holika Dahan 21 March) | verified | PublicHolidays.in |
| Eid al-Adha 2027 | 16 or 17 May | projected | Gulf News, Khaleej Times |
| Vesak 2027 | 20 May (India, Bangladesh, Cambodia) | verified | Drik Panchang, Office Holidays |
| Dragon Boat Festival 2027 | 9 June | verified | Examine China |
| Matariki 2027 | 25 June | **unchecked** | Reference link only |
| Ganesh Chaturthi 2027 | 4 September | verified | Drik Panchang |
| Onam 2027 | 12 September | verified | Hindu Blog |
| Mid-Autumn Festival 2027 | 15 September | verified | China Highlights |
| Durga Puja 2027 | 4 to 9 October | verified | Drik Panchang, Office Holidays |
| Diwali 2027 | 29 October | verified | Drik Panchang |

Notes recorded with the data: some sources and official holiday lists differ by a day for Holi and for Diwali outside India; Vesak falls on different days in different countries. The interface shows these notes next to the date.

**FESTIVA never extrapolates a lunar date.** When the table has no checked row for the next occurrence, the page says "Date to be confirmed". A unit test enforces this. The tables need a yearly update: add rows to `src/data/festivals.ts`, then run `npm run db:seed:generate`.

## Descriptive text

History, significance, traditions, regional variations and etiquette for festivals, and the summaries for dishes, attire and destinations, are written from general reference knowledge. They have status `reference`.

- Festival entries link their Wikipedia article.
- Food, attire, destination and brand entries link a Wikipedia *lookup* for the subject rather than a hard-coded article address, so a renamed article cannot produce a dead citation. The interface labels these as pointers for further reading, not audited citations.

This text has not been reviewed by cultural or subject experts. A review by people from each tradition is recommended before a public launch.

## Dietary flags

Vegetarian, vegan and "usually contains" flags describe the typical recipe. They are a planning aid, not allergy advice, and the interface says so wherever they appear. A unit test checks the flags are internally consistent (for example, nothing vegan is flagged as containing dairy).

## Shop

Brand names come from the founder's brief. Founding years, origins and descriptions are from general reference knowledge. Official site addresses should be re-checked before launch. Tiers are editorial judgements. There are no prices, ratings, reviews, stock levels or partnerships anywhere in the data, and a unit test and a database check keep it that way.

## Music

Artist, genre, country, language and song names are from general reference knowledge. FESTIVA links to search results on licensed services and hosts no audio.

## What was not invented

No biography, qualification, award or endorsement for the founder; no prices, discounts, ratings, reviews or inventory; no partnerships; no travel prices, opening hours or availability; no performance scores; no citations to documents that were not consulted.

## Added in 1.2.0 (18 November 2026)

**Fifteen festivals** from regions the guide covered thinly. Each has a reference source for its text, and its dates are labelled as follows:

| Festival | Date stored | Status | Basis |
| --- | --- | --- | --- |
| Vodun Days (Benin) | 2–9 January 2027 | verified | Checked against the source cited on the page |
| Loy Krathong (Thailand) | 24 November 2026 | verified | Checked against the source cited on the page |
| Loy Krathong (Thailand) | 13–14 November 2027 | projected | Sources disagree; the full moon of the 12th Thai lunar month is confirmed nearer the time |
| Thaipusam (Malaysia, Singapore, India) | 22 January 2027 | verified | Checked against the source cited on the page |
| Meskel (Ethiopia) | 27–28 September 2027 | projected | 17 Meskerem moves to 28 September in the year before an Ethiopian leap year |
| Guelaguetza (Mexico) | 19 and 26 July 2027 | projected | Rule: the two Mondays after 16 July; the Oaxaca state government confirms |
| Homowo, Garma, Kandy Esala Perahera | Months only | seasonal | Set each year by the Ga traditional areas, the Yothu Yindi Foundation and the Temple of the Tooth |
| Sinulog | Third Sunday of January | rule | Calculated |
| Merrie Monarch | Easter Sunday, for a week | rule | Calculated from Easter |
| Trinidad and Tobago Carnival | Monday and Tuesday before Ash Wednesday | rule | Calculated from Easter |
| Tweede Nuwe Jaar, Sámi National Day, Candelaria, Junkanoo | 2 January, 6 February, 2 February, 26 December | fixed | Calculated |

**Cultural fields** (`src/data/festival-culture.ts`) for all 46 festivals:
- names in original scripts with BCP 47 language tags (`und` where no tag fits, as for Yolŋu Matha);
- symbols and their meanings;
- a description of the calendar system.

These were written from the same reference sources as the festival text and carry the same `reference` status. Wording that rests on tradition rather than record says so (for example "said to").

**Kinds of claim.** Each section of a festival page is labelled by what kind of statement it makes: documented history, belief and interpretation, community practice, or guidance. See [CONTENT_REVIEW.md](CONTENT_REVIEW.md).

**Expert review.** `src/data/reviews.ts` holds `EXPERT_REVIEWS`, which is empty. A record must name the reviewer, their standing, the date and what they checked (enforced by a unit test). Nothing has been reviewed, and the pages say so.

**Left out:** Tsagaan Sar (sources conflict on the 2027 date), NAIDOC Week and National Indigenous Peoples Day (no suitable linked place yet).
