# Testing

## How to run

```bash
npm run lint           # ESLint (Next.js core-web-vitals + TypeScript rules)
npm run typecheck      # route type generation, then tsc --noEmit
npm test               # Jest unit tests
npm run db:verify      # migration + seed + RLS behaviour on PGlite
npm run test:e2e       # Playwright, builds and serves the production build itself (demo mode)
npm run test:integrations  # Playwright against local test doubles for Sarvam, Flagsmith and NudgeBee
npm run test:all       # everything above, in that order
npm run integrations:check # live requests to the real providers, with your credentials (not part of test:all)
npm run integrations:evidence # the same, plus a redacted, labelled report in evidence/
npm run perf           # lab performance numbers; start the server first
```

Playwright needs a browser. Either run `npx playwright install chromium` once, or use an installed Chrome:

```bash
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

The end-to-end suite expects demo mode (no Supabase or AI variables set).

## Verification report: 1.2.0 finalist release (18 November 2026)

`PLAYWRIGHT_CHANNEL=chrome CI=1 npm run test:all` on Linux, Node.js 22.23, against the final 1.2.0 code. **Exit code 0.**

| Check | Result | What it proves | What it does not prove |
| --- | --- | --- | --- |
| ESLint | 0 errors, 0 warnings | Code style and React/Next rules | Behaviour |
| TypeScript (strict, with route types) | 0 errors | Types line up across routes and modules | Behaviour |
| Unit tests (Jest) | **170 passed**, 0 failed, 10 suites | Domain logic, Matchmaker rules (including 6 new observance and age tests), budget arithmetic, dates, data integrity and provenance (sources, language tags, review records), receipts, rate limiting (including header spoofing and flood eviction), provider request shapes with fake `fetch` | Real provider behaviour |
| Database checks (PGlite) | **40 passed**, 0 failed | Both migrations, the 1,320-statement seed and every RLS policy on a real Postgres engine | A hosted Supabase project |
| End-to-end, demo mode (Playwright, production build, Chrome) | **84 passed**, 0 failed: 80 desktop, 4 phone (Pixel 7) | Every module's journeys, the new festival → Matchmaker → Gift Circle journey, rejection of bad prefill values, axe accessibility checks on key pages, no secrets in browser bundles, layout stability at 1440/768/390 px | Other browsers; a real phone; screen-reader use by a person |
| Sponsor code paths (Playwright against local test doubles) | **7 passed**, 0 failed | Request shapes, headers, errors, receipts (forgery refused), flag changes with no redeploy, alert delivery, approval-gated runbooks | That the real Sarvam, Flagsmith and NudgeBee accept FESTIVA's requests |
| Evidence mode, no credentials | 4 SKIP, all NOT CONFIGURED; no secrets in the output | Honest reporting when nothing is configured | Anything live |
| Evidence mode, against local test doubles | 6 PASS, all labelled LOCAL TEST DOUBLE or LOCAL CHECK; `--watch-flag` saw on → off → on | The labelling cannot present a stand-in as live | Anything live |
| `npm audit --omit=dev` | **0 vulnerabilities** in production dependencies | No known advisories in shipped code | Unknown issues |
| `npm audit` (all) | 50 advisories (9 moderate, 41 high), all in development tooling: `glob`, `minimatch` and `picomatch` under `jest` and `eslint-config-next` | Nothing ships to users | — npm's suggested fix downgrades those tools to old majors, so it was not applied |

### Fresh install from the release ZIP

`FESTIVA-FINALIST.zip` was extracted into an empty folder and run with **no environment variables at all** (`env -i`), following [WINDOWS_SETUP.md](WINDOWS_SETUP.md) on Linux:

| Step | Result |
| --- | --- |
| Contents | 399 files; no `.env.local` or other `.env*` file except `.env.example`; no `node_modules`, `.next`, `.git`, `evidence/` or test output. A planted fake key in `.env.local` and a planted `evidence/` file were both absent from the ZIP; a pattern scan for API-key, JWT and private-key formats found nothing |
| `npm ci` | 651 packages, about 780 MB, exit 0 |
| `npm run build` | Succeeded |
| Browser bundles | No secret values. Variable *names* appear only in the setup instructions on the admin pages, which tell an operator what to set; the public-bundle test checks that no secret names reach public pages |
| `npx next start`, no variables | `/api/health`: AI, Supabase, Sarvam, Flagsmith and NudgeBee all `false`, sharing `demo`. All 21 module routes tried answered 200, including prefilled Matchmaker and Gift Circle links; an unknown festival answered 404; an invalid circle request answered 400 |
| `lint`, `typecheck`, `npm test`, `db:verify`, `test:e2e`, `test:integrations` from the extract | 0 errors; **170**, **40**, **84** and **7** passed; exit code 0 |

### Not run, and why

| Check | Status |
| --- | --- |
| Live Sarvam, Flagsmith, NudgeBee | **BLOCKED**: the network proxy refuses `api.sarvam.ai`, `edge.api.flagsmith.com` and `app.nudgebee.com`, and there are no credentials. Run `npm run integrations:evidence` on your machine ([SPONSOR_EVIDENCE.md](SPONSOR_EVIDENCE.md)) |
| Firefox and WebKit | **BLOCKED**: `npx playwright install firefox` failed to download (the download host is not reachable from this environment). Chrome only |
| Windows 11 | **Not run**: no Windows machine. The Windows guide's commands were run on Linux from a fresh extract of the ZIP (below); the Playwright server commands were made shell-independent so they also work from PowerShell and cmd.exe |
| Manual accessibility audit, screen readers | Not done; automated axe checks only |
| Load testing | Not done |

## Results of the first full run (1.0.0)

Run on 16 November 2026 with `PLAYWRIGHT_CHANNEL=chrome npm run test:all`, on Node.js 22, against the final code in this archive. Exit code 0.

| Check | Result |
| --- | --- |
| ESLint | 0 errors, 0 warnings |
| TypeScript (`tsc --noEmit`, strict) | 0 errors |
| Unit tests (Jest) | **81 passed**, 0 failed, 6 suites |
| Database checks (PGlite) | **33 passed**, 0 failed |
| End-to-end tests (Playwright, production build) | **58 passed**, 0 failed: 54 desktop, 4 mobile |
| Production build (`next build`) | Succeeded |

## Results of the hackathon readiness audit (18 November 2026, version 1.1.2)

`PLAYWRIGHT_CHANNEL=chrome npm run test:all`, Node.js 22, exit code 0:

| Check | Result |
| --- | --- |
| ESLint | 0 errors, 0 warnings |
| TypeScript (strict) | 0 errors |
| Unit tests (Jest) | **159 passed** of 159 (155 existing + 4 for provider receipts), 10 suites |
| Database checks (PGlite) | **40 passed** of 40 |
| End-to-end, demo mode (production build) | **82 passed** of 82 |
| End-to-end, sponsor code paths against local test doubles | **7 passed** of 7 (5 existing + receipt forgery + flag-by-flag server enforcement) |
| Production build | Succeeded |

Beyond the suite, the audit drove every module in a real browser with inputs the tests do not use, ran a four-person Gift Circle to the Secret Santa reveal (no self-draws, everyone received once), generated 3,000 random Matchmaker plans (every budget summed exactly, no dietary violations), spot-checked five festival date sources against the live pages, and started the production build with no environment variables at all (every module returned 200 and a circle could be created).

## Results of the visual upgrade run (17 November 2026, version 1.1.1)

`PLAYWRIGHT_CHANNEL=chrome npm run test:all`, Node.js 22, exit code 0:

| Check | Result |
| --- | --- |
| ESLint | 0 errors, 0 warnings |
| TypeScript (strict) | 0 errors |
| Unit tests (Jest) | **155 passed** of 155 |
| Database checks (PGlite) | **40 passed** of 40 |
| End-to-end, demo mode (production build) | **82 passed** of 82: 78 desktop, 4 mobile (69 existing + 13 new in `tests/e2e/visual.spec.ts`) |
| End-to-end, sponsor code paths against local test doubles | **5 passed** of 5 |
| Production build | Succeeded |

New visual tests (sections 24 and 25): art kind per module; the year ribbon filters by month and toggles off; every world-map pin is a keyboard-reachable link to its destination; a cover per game; gift ideas grouped by kind; axe on `/journeys`, `/shop` and `/circles`; animations collapse under reduced motion; layout shift below 0.1 and no sideways overflow on 11 public pages at 1440, 768 and 390 px, and on the Gift Circle organiser and summary pages and `/admin/integrations` on a phone.

One existing test changed, and only by adding steps: the Secret Santa journey in `gift-circle.spec.ts` now checks that the match starts wrapped, clicks **Unwrap your match**, and checks that it stays open after a reload. Its original assertions are unchanged. No test was removed, skipped or weakened.

Visual audit (`node scripts/visual-audit.mjs`, 29 pages × 3 widths = 87 captures): no page scrolls sideways; layout shift at most 0.042 (one capture, `/about` at 768 px) and at most 0.01 on the other 86. Before the pass: Gift Circle and admin pages 0.10–0.25, Quiz 0.107, `/admin/integrations` 334 px of sideways scroll on a phone.

## Results of the Gift Circle run (17 November 2026)

`PLAYWRIGHT_CHANNEL=chrome npm run test:all`, Node.js 22, exit code 0:

| Check | Result |
| --- | --- |
| ESLint | 0 errors, 0 warnings |
| TypeScript (strict) | 0 errors |
| Unit tests (Jest) | **155 passed** of 155 (81 existing + 74 new), 9 suites |
| Database checks (PGlite) | **40 passed** of 40 (33 existing + 7 for `gift_circles`) |
| End-to-end, demo mode (production build) | **69 passed** of 69: 65 desktop, 4 mobile (58 existing + 11 new; the mobile overflow check now also covers `/circles`, `/circles/new`, `/admin`) |
| End-to-end, sponsor code paths against local test doubles | **5 passed** of 5 |
| Production build | Succeeded |

No existing test was removed, skipped or weakened.

**Not run here:** `npm run integrations:check` against the real Sarvam, Flagsmith and NudgeBee services (no credentials, and the build environment's proxy refuses those hosts). It was run without credentials (4 skipped) and against the local test doubles (5 passed, each line labelled as a test double).

### Acceptance criteria for the sponsor integrations

| Area | Criterion | Where | Result |
| --- | --- | --- | --- |
| Sarvam | Valid audio request (multipart, model, language code, key header) | unit `integrations.test.ts`; integrations e2e | Passed (fake fetch / test double) |
| Sarvam | Invalid audio rejected (bytes sniffed; non-audio 415; too long 400) | unit; integrations e2e | Passed |
| Sarvam | Supported-language handling (23 languages, `or-IN`↔`od-IN`, auto-detect, unsupported refused before any call) | unit | Passed |
| Sarvam | Transcript preservation; translation stored separately; correction recorded | unit `circle.test.ts`; integrations e2e | Passed |
| Sarvam | Provider timeout; HTTP 403/429/503/400 mapping; invalid output | unit | Passed |
| Sarvam | Missing credential: honest "not configured", typing still works | demo e2e | Passed |
| Sarvam | Rate limiting (7th request in a minute refused) | integrations e2e | Passed |
| Sarvam | Real request to Sarvam | — | **Not run** |
| Flagsmith | Flag evaluation with the official SDK (environment document) | unit (offline mode); integrations e2e (local evaluation, polling) | Passed |
| Flagsmith | Enabled and disabled behaviour (voice, whole Gift Circle) enforced by API and UI, no redeploy | integrations e2e | Passed |
| Flagsmith | Missing service fallback (closed port) and missing configuration | unit | Passed |
| Flagsmith | Remote configuration validation (ranges, unknown keys, bad JSON, Sarvam's 30 s cap) | unit | Passed |
| Flagsmith | Experiment assignment (stable per visitor, both variants, off means not enrolled) and analysis (counts, insufficient-data rule, z-test) | unit; demo e2e (both variants create circles) | Passed |
| Flagsmith | Access restrictions (admin only; participant key is not admin; cross-site writes refused) | unit; demo e2e | Passed |
| Flagsmith | Real Flagsmith project | — | **Not run** |
| NudgeBee | Configuration validation (documented path, token placement, prerequisites) | unit | Passed |
| NudgeBee | Observability prerequisites reported from what the server observes | unit; demo e2e | Passed |
| NudgeBee | Event handling through the documented Event Webhook (shape, Bearer token, 400 errors) | unit; integrations e2e | Passed (test double) |
| NudgeBee | Investigation status read back (GraphQL `events_list`, read-only) | unit; integrations e2e | Passed (test double) |
| NudgeBee | Approval requirement (nothing runs without a reasoned approval; single decision; NudgeBee can only propose) | unit `ops.test.ts`; both e2e suites | Passed |
| NudgeBee | Audit logging | unit; both e2e suites | Passed |
| NudgeBee | Failure and unavailable states | unit; demo e2e | Passed |
| NudgeBee | Real NudgeBee workspace and Kubernetes agent | — | **Not run** |
| End to end | Create, join, submit a preference, review a transcript, generate a wishlist, change a flag, complete an approval | demo e2e + integrations e2e | Passed |
| Accessibility | axe-core WCAG 2.1 A/AA on Gift Circle pages and the operations centre | demo e2e | Passed, no serious violations |

### Defects found while building and testing Gift Circle, now fixed

1. The Gift Circle pages could stay on "Loading" for ever: a component that mounted after the flags arrived never received them. Rebuilt the hook on `useSyncExternalStore`.
2. Opening a second invitation link in the same tab did nothing (only the URL fragment changed).
3. The `gift_circles` table accepted secrets with no organiser hash (a CHECK on NULL passes). Constraint fixed with `coalesce`.
4. Instrumented GET routes were prerendered at build time, which would have baked a 500 into `/api/flags`. They now opt out of prerendering.
5. The Prometheus label `job` on processing metrics clashed with Prometheus's reserved scrape label; renamed to `step`.
6. The participant composer could save a preference whose language was "Detect automatically".
7. One end-to-end test failed only when run after others: the voice alert correctly did not fire because earlier successful calls kept the failure ratio under 50%. The test now produces enough failures; the rule was not loosened.

## What the 24 QA items rest on

| # | Item | Verified by | Status |
| --- | --- | --- | --- |
| 1 | Homepage | e2e: title, headline, founder credit and links, upcoming list, call to action | Passed |
| 2 | Navigation | e2e: all nine module links, active state, 404 for five unknown addresses | Passed |
| 3 | Festival search | e2e: text search, diacritic-insensitive match, region and month filters, empty state, clear. Unit: search scoring | Passed |
| 4 | Festival details | e2e: all sections, date with certainty and source link, projected and seasonal labels, save | Passed |
| 5 | Country discovery | e2e: country page links festivals and places | Passed |
| 6 | Destination pages | e2e: landmarks, itinerary note, map link, search | Passed |
| 7 | Food and attire discovery | e2e: dietary filter, dietary notes, attire search and respect note. Unit: dietary flag consistency | Passed |
| 8 | Shop filters | e2e: tier, category, brand search, wishlist, no price text anywhere, official link, non-affiliation notice | Passed |
| 9 | Matchmaker generation | e2e: full wizard, all ten sections, reasons, live preview, validation message. Unit: determinism, schema, counts, generic occasions | Passed |
| 10 | Budget arithmetic | Unit: 500 randomised allocations sum exactly, largest remainder, zero and invalid inputs, minor units. e2e: lines sum to budget, edit a line, over-budget state, reset | Passed |
| 11 | Recommendation editing | e2e and unit: replace, edit, remove, regenerate, rebuild schedule | Passed |
| 12 | Plan saving | e2e: save, list, reopen, text and JSON export, delete, refresh survival | Passed |
| 13 | Plan sharing and revocation | e2e: create link, open in a separate browser context, read-only, noindex, revoke, link stops working. Unit: tokens, revoke key. Database: owner-only revoke | Passed (demo store and SQL). Supabase-backed path not run against a live project |
| 14 | Wishes export | e2e: form drives the card, canvas is painted, PNG download, copy to clipboard. Unit: composition, wrapping | Passed |
| 15 | Game scoring | e2e: all five games, scores, best score, reset, completion, keyboard. Unit: scoring rules, solvable shuffles | Passed |
| 16 | Music search | e2e: language, country, song and genre search, listening links, favourites persist, no embedded media | Passed |
| 17 | Authentication | e2e: honest "not configured" state | **Partly.** The sign-in flow has not been executed; it needs a Supabase project |
| 18 | Private data access | Database: 33 checks including cross-user reads, updates, inserts, anonymous access, cascade delete. e2e: unguessable and unrevocable-by-strangers share links | Passed on PGlite with an auth shim. Not run on real Supabase |
| 19 | Mobile navigation | e2e (Pixel 7 profile): menu open, Escape, navigate, no horizontal overflow on nine pages, Matchmaker and a game by touch | Passed |
| 20 | WebGL fallback | e2e: WebGL path, forced no-WebGL path falls back to 2D and the site stays usable, reduced motion freezes the canvas | Passed |
| 21 | AI missing credentials | e2e: health flags, assistant states no model is connected and answers from the guide, API routes degrade | Passed |
| 22 | AI errors and invalid output | Unit: non-JSON, wrong shape, timeout, HTTP error, injection attempt, ungrounded answer, URL stripping, all with fake providers | Passed with fakes. **No real provider call has been made** |
| 23 | Accessibility | e2e: axe-core WCAG 2.1 A and AA on 18 page states with zero serious or critical violations; skip link; keyboard operation | Passed automatically. No manual screen-reader testing |
| 24 | Production build | `next build` succeeds; every e2e test runs against it | Passed |

## Defects the tests found and that were fixed

Kept here because they show the tests are doing real work:

1. Greeting card download never fired: a promise resolved with `null` before the canvas produced its image.
2. Unknown festival addresses returned HTTP 200 instead of 404. Fixed with `src/proxy.ts`.
3. Festival pages lost their social preview image because a nested Open Graph block replaced the inherited one.
4. Buttons whose accessible name did not contain their visible label (Sound favourites, schedule rebuild), and a definition list broken by a `role` on a `<dd>`.
5. The assistant reused the previous question as context for an unrelated one.
6. Large layout shifts on four pages (CLS up to 0.40), from loading placeholders shorter than their content.
7. The entire dataset and the names of secret environment variables were being pulled into browser bundles through shared modules.

## Not covered

- Supabase Auth flows, cloud plan sync and Supabase-backed sharing against a live project.
- Real AI provider calls.
- Safari and Firefox. Tests ran in Chrome only.
- Screen-reader testing by people, and usability testing of any kind.
- Load testing.
- Native mobile, which does not exist.
