# Visual system (FESTIVA 1.1)

How FESTIVA looks and moves, and the rules that keep it consistent. This pass changed presentation only: no API, database, flag, provider or business rule changed.

## Palette and type

| Token | Hex | Used for |
| --- | --- | --- |
| ivory | `#fbf6ea` | Page background |
| cream | `#f2e7cf` | Quiet panels, skeletons, the budget track |
| charcoal | `#241f27` | Body text |
| ink | `#574f5c` | Secondary text |
| saffron / saffron-deep | `#f0a030` / `#9a5005` | Primary action; accent text on light surfaces |
| gold / gold-soft | `#b9995e` / `#dcc898` | Rules, frames, text on plum |
| plum / plum-deep | `#33143a` / `#1e0a23` | Dark heroes, header, footer, secondary action |
| emerald | `#0e5a48` | Premium tier, "paid" in the budget meter |
| vermilion | `#b93626` | Warnings only |

Display type is Bodoni Moda; text is Instrument Sans. Both are self-hosted, and both now have metric-matched local fallbacks (`Bodoni Moda Fallback`, `Instrument Sans Fallback` in `globals.css`), so text does not move when the web fonts arrive. Line lengths use `rem`, not `ch`, for the same reason.

## One artwork language per kind of content

Every illustration is SVG drawn from code (no image files, no stock art, no logos). The frame shape says what kind of thing you are looking at, so a card is recognisable before its title is read.

| Content | Art | Frame | Code |
| --- | --- | --- | --- |
| Festival | Arch rosette | Arch, 4:5 | `Motif` |
| Dish | Plate seen from above; food arranged by course; sweets take the shape the dish's description gives (balls, diamonds, pieces) | Circle | `Plate` in `art/Art.tsx` |
| Garment | Woven textile swatch with fringe | Cloth, 4:5 | `Textile` |
| Place | Dot-map locator around the real coordinates, with a pin | Rounded 4:3 | `Locator` |
| Brand | The name set in FESTIVA's own type on a tier colour; never the brand's logo | Rounded 4:3 | `BrandTile` |
| Game | A sketch of how the game is played | Rounded 4:3 | `art/GameCover.tsx` |

All artwork is `aria-hidden`; the title next to it carries the meaning. Related rows on festival pages use the same art as small thumbnails in fixed-size frames.

## Motion

Every animation answers a question or marks a moment; none loops forever.

| Motion | Where | Why |
| --- | --- | --- |
| Shared-element morph (React `ViewTransition`) | Catalogue card → detail page, home feature → Diwali | Shows that the page you opened is the card you chose |
| Pins arrive west to east | Journeys world map | Shows how widely the guide spreads |
| Locator ripple (3 times, then still) | Destination detail | Marks the exact spot |
| Seats arrive | Gift Circle ring | A person joining takes their seat |
| Budget bar grows once; widths transition on change | Gift Circle budget | Shows the commitment change |
| Gift lid lifts, card rises | Secret Santa reveal | The match stays wrapped until the person chooses to look |
| Skeleton shimmer | Gift Circle and admin loading | Shows the page shape while data loads |

Under `prefers-reduced-motion: reduce` every animation and transition collapses to an instant and view-transition morphs are switched off. A browser test checks this.

No animation library was added. The homepage globe is the only WebGL (unchanged); it already stops off-screen and falls back to a static map without WebGL.

## Layout rules

- Loading states hold the final layout and at least a screen of height (`PageSkeleton`), so the footer never jumps.
- Wide tables scroll inside their own box; long technical strings (`code`) wrap anywhere. Nothing scrolls sideways at 390 px.
- Grids that hold tables use `minmax(0, 1fr)` tracks.
- Numbers are not used as decoration: numbered markers appear only for real sequences (the Gift Circle steps).

## Checking it

- `node scripts/visual-audit.mjs http://localhost:3000 /tmp/visual` seeds a circle, signs in to admin with the test token, and takes full-page screenshots of 29 pages at 1440, 768 and 390 px, printing layout shift and sideways overflow for each.
- `tests/e2e/visual.spec.ts` (sections 24 and 25) checks art per module, the year ribbon, map links, game covers, gift grouping, accessibility on the new pages, reduced motion, and layout shift below 0.1 with no overflow on key pages including Gift Circle and admin.
- Screenshots from the final audit are in `docs/screenshots/visual/`.
