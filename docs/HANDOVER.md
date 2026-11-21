# FESTIVA handover

Founder: Shambhavi M K. First handover: 16 November 2026 (1.0.0). Current version: 1.2.0 (18 November 2026).

## Update, 18 November 2026: finalist release (version 1.2.0)

**Release:** `FESTIVA-FINALIST.zip`. The 1.1.2 baseline is preserved unchanged: `festiva-1.1.2.zip` (read-only, with a SHA-256 checksum) and Git tag `v1.1.2` in the working copy. Nothing was pushed, deployed, bought or activated.

**Built:**
- **Matchmaker:** observance (religious, cultural or secular) and age groups, with explained effects on the plan.
- **One journey from festival to Gift Circle:** festival page → prefilled Matchmaker → plan → prefilled Gift Circle.
- **Festivals:** 15 researched festivals from underrepresented regions (46 in all, 40 countries).
- **Festival pages:** original names, symbols, calendar systems, claim kinds and expert-review status.
- **Integration evidence mode:** `npm run integrations:evidence`, with redaction and LIVE SERVICE / LOCAL TEST DOUBLE labels, plus a Flagsmith remote-change watcher.
- **Trust:**
  - spoof-resistant rate limiting with fair eviction, paid-call caps and a key-guessing limit;
  - privacy page sections on voice, children and retention;
  - an adults-only note on the join page;
  - a draft privacy policy, and legal and content-review documents.
- **Windows:** Playwright configs that also run from PowerShell and cmd.exe.
- **Documents:** the Windows 11 guide, architecture diagram, three-minute demo, Vercel and Supabase deployment, sponsor evidence guide and CHANGELOG.

**Tests** (all passed, exit code 0): lint and types clean; 170 unit, 40 database, 84 end-to-end (80 desktop, 4 phone) and 7 integration (local test double). `npm audit --omit=dev`: 0 vulnerabilities. A fresh extract of the ZIP installed, built, started with no environment variables and passed its checks ([TESTING.md](TESTING.md)).

**Blocked or not done:**
- live sponsor verification (no network access to the providers, no keys);
- NudgeBee workspace;
- expert review;
- legal review;
- deployment;
- a Windows 11 run;
- Firefox and WebKit tests.

See [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md#finalist-release-120-18-november-2026).

**Continuation point:**
1. Follow [WINDOWS_SETUP.md](WINDOWS_SETUP.md) on your laptop.
2. Add your keys and run `npm run integrations:evidence`, then copy the report into `docs/evidence/`.
3. Rehearse [DEMO_3_MINUTES.md](DEMO_3_MINUTES.md).
4. When ready, deploy with [DEPLOYMENT.md](DEPLOYMENT.md).

## Update, 18 November 2026: hackathon readiness audit (version 1.1.2)

**Fixed:** provider attribution is now proven on the server. Sarvam's transcripts, translations and proposed fields carry a signed receipt, and a preference can only be saved under Sarvam's name with a valid one ([SPONSORS.md](SPONSORS.md#sarvam-ai-multilingual-experience-engine)). New Orleans no longer claims Rio's Carnival. Pongal and Nowruz were labelled "Fixed date" although they move; they now show checked 2027 dates (Thai Pongal is 15 January 2027 in India, Nowruz 21 March 2027). **Tests:** 159 unit, 40 database, 82 end-to-end and 7 integration tests pass. **Still blocked:** every sponsor service is unreachable from this environment and no credentials exist.

## Update, 17 November 2026: visual upgrade (version 1.1.1)

Presentation only; no API, database, flag, provider or business rule changed. See [VISUAL_SYSTEM.md](VISUAL_SYSTEM.md).

**Built:** one artwork language per content type (plates for dishes, textiles for garments, dot-map locators for places, typographic tiles for brands, cover art for games); a Journeys world map whose pins are links; a "year at a glance" month ribbon on Discover; art thumbnails on festival pages; Shop gift ideas grouped by kind; card-to-page morphs with React `ViewTransition`; Gift Circle seats that arrive, a budget meter, and a wrapped Secret Santa reveal; layout-holding skeletons; metric-matched font fallbacks; mobile fixes for admin. **Tests:** 13 new browser tests; all 82 end-to-end, 155 unit, 40 database and 5 integration tests pass. **Continuation:** see the visual limitations at the end of [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md).

## Update, 17 November 2026: FESTIVA Gift Circle and sponsor integrations

Added to the existing application without rebuilding or removing anything.

**Built:** Gift Circle (create with an A/B onboarding experiment, invite, join, typed or spoken preferences, transcript review, translation kept apart from the original, structured wishlists, gift ideas, Secret Santa, contribution commitments, budget insights, cultural context, summary); a provider-independent language layer; `SarvamProvider`, `FlagsmithProvider` (official SDK) and `NudgeBeeIntegration`; real telemetry with Prometheus export; five alert rules; controlled test scenarios; approval-gated runbooks with an audit trail; admin pages for integration status and operations; a `gift_circles` migration with RLS; a live check script; local test doubles; Prometheus, Alertmanager and Kubernetes files.

**Statuses**

| Integration | Status |
| --- | --- |
| Sarvam AI | IMPLEMENTED, CREDENTIALS REQUIRED |
| Flagsmith | IMPLEMENTED, CREDENTIALS REQUIRED |
| NudgeBee | IMPLEMENTED, INFRASTRUCTURE AND CREDENTIALS REQUIRED |
| Gift Circle (file store) | IMPLEMENTED AND VERIFIED |
| Gift Circle (Supabase store) | IMPLEMENTED, CREDENTIALS REQUIRED (SQL verified on PGlite) |

**Tests:** lint and types clean; 155 unit, 40 database, 69 end-to-end and 5 integration (test double) tests passed. Details and the acceptance-criteria table: [TESTING.md](TESTING.md#results-of-the-gift-circle-run-17-november-2026).

**Needed from the founder:** a Sarvam API key; a Flagsmith project with the flags in [SPONSORS.md](SPONSORS.md) and a server-side key; a NudgeBee workspace (Cloud or self-hosted) with an Event Webhook integration, and, for the infrastructure view, a Kubernetes cluster ([NUDGEBEE_DEMO.md](NUDGEBEE_DEMO.md)); a long-running host with a persistent volume, or Supabase with the service-role key; `FESTIVA_ADMIN_TOKEN` and `FESTIVA_METRICS_TOKEN`.

**Continuation point:** put the keys in `.env.local`, run `npm run integrations:check`, fix anything it reports, then run [DEMO.md](DEMO.md) end to end against the real services and record the results in TESTING.md.

---

## What was built

A complete, responsive FESTIVA web application with every module in the brief, in one coherent Next.js + TypeScript codebase, tested and built for production.

- **Brand and design system.** Deep plum, warm ivory, cream, saffron, muted gold and emerald; Bodoni Moda for display and Instrument Sans for text; an arch frame and original generated rosette artwork for every festival, dish, garment, place and brand.
- **Three signature experiences.** A WebGL globe of festival lights (Three.js with custom shaders, with 2D and static fallbacks); editorial discovery; the Matchmaker concierge with a live preview.
- **Eleven modules.** Discover, Journeys, Taste, Wear, Shop, Wishes, Play (five games), Sound, Intelligence, Matchmaker, plus Account, Saved, My plans, About and Privacy.
- **Backend.** A Supabase schema of 30 tables with constraints, triggers and Row Level Security on every table; a seed generated from the app's dataset; an AI provider layer; sharing with revocation; first-party analytics.
- **Quality.** 81 unit tests, 33 database checks, 58 end-to-end tests including accessibility, mobile, WebGL fallback and security; measured performance.

## Working user journeys

Each of these is exercised by an automated test against the production build.

1. Land on the homepage, see what is next on the world's calendar, open a festival.
2. Search and filter festivals; read history, meaning, traditions, variations and etiquette; see the next date with its source and how certain it is; save it.
3. Follow a festival to its food, dress, music and destinations, and to its country.
4. Answer six questions in the Matchmaker and get a plan with schedule, food, gifts, attire, decorations, activities, music, greetings, destinations, context and a budget that adds up.
5. Edit, replace, remove and regenerate recommendations; edit budget lines and watch totals update; read why each item was chosen.
6. Save the plan, reopen it, export it as text, JSON or PDF (print), share it by link, and revoke the link.
7. Make a greeting card, download it as an image, copy or share it.
8. Play five games with scoring, reset and completion, by mouse, touch or keyboard.
9. Search music by artist, song, country, language or genre; keep favourites; open official releases on licensed services.
10. Ask the assistant a question and get an answer grounded in the guide, with facts, suggestions and sources separated.
11. Do all of the above on a phone.

## Technologies

Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), Tailwind CSS 4, Framer Motion, Three.js with GLSL, Zod 4, Supabase (PostgreSQL, Auth, RLS), Jest, Playwright, axe-core, PGlite. Fonts: Bodoni Moda and Instrument Sans, self-hosted.

## Tests executed and results

Last full run, `PLAYWRIGHT_CHANNEL=chrome npm run test:all`, exit code 0:

| Check | Result |
| --- | --- |
| ESLint | 0 errors, 0 warnings |
| TypeScript | 0 errors |
| Jest unit tests | 81 of 81 passed |
| Database checks (migration, seed, RLS on PGlite) | 33 of 33 passed |
| Playwright end-to-end (production build) | 58 of 58 passed (54 desktop, 4 mobile) |
| Production build | Succeeded |

Detail, including which of the brief's 24 QA items are fully or only partly verified, is in `TESTING.md`. Performance measurements are in `PERFORMANCE.md`.

## What is honestly not done

Full list in `KNOWN_LIMITATIONS.md`. The headlines:

1. **No native mobile app.** Web only, responsive, with reusable domain logic. See `MOBILE.md`.
2. **Not deployed.** No GitHub push, no Vercel project.
3. **Supabase and AI code paths have never run against live services.** The schema and policies are verified on a real PostgreSQL engine with a shim; the provider code is verified with fakes. Sign-in has never been executed.
4. **The guide is small and has not had expert cultural review.**
5. **English interface only.**
6. **No real products, prices or embedded music playback**, by design, pending approved data sources.

## Credentials and approvals needed

None were used and none were purchased. To go further the founder needs: a GitHub repository, a Vercel account and domain, a Supabase project, an Anthropic or OpenAI key with a spending limit, a licence decision, and, for later phases, product-feed approvals, music-service developer access and app-store developer accounts.

## Run it

```bash
npm install
npm run dev                      # http://localhost:3000
# or
npm run build && npm run start
```

No environment variables are required.

## Deploy it

Follow `DEPLOYMENT.md`: push to GitHub, import into Vercel, set `NEXT_PUBLIC_SITE_URL`; then, optionally, create a Supabase project, apply `supabase/migrations/…_festiva_core.sql` and `supabase/seed.sql`, and set the two Supabase variables; then, optionally, add one AI provider key.

## Continuation point

The codebase is complete for the web scope. Do not start over; the next work, in suggested order, is:

1. **Deploy** (GitHub → Vercel) with `NEXT_PUBLIC_SITE_URL` only, and smoke-test demo mode.
2. **Connect Supabase**, apply the migration and seed, then manually test sign-up, sign-in, magic link, plan sync, share and revoke. Add end-to-end tests for those flows using a test project. Files: `src/components/AccountPanel.tsx`, `src/lib/plans.ts`, `src/lib/share-store.ts`.
3. **Add an AI key**, test `/intelligence` and "Rewrite the introduction with AI" by hand, and confirm or change the default model names in `src/lib/env.server.ts`.
4. **Content review and growth.** Have each festival entry reviewed; add festivals in `src/data/festivals.ts` (the unit test `data-integrity.test.ts` will flag broken references); add 2028 rows to the lunar date tables; verify Matariki 2027.
5. **Harden for traffic.** Shared rate-limit store; nonce-based Content-Security-Policy; legal privacy policy and terms.
6. **Translate the interface.** Extract strings and add message catalogues, starting with Hindi.
7. **Native app.** Follow `MOBILE.md`.
8. **Shop and Sound integrations**, once product-feed and music-API approvals exist.

## Where things are

| To change | Edit |
| --- | --- |
| Colours, type scale, components | `src/app/globals.css` |
| Festivals, dates, sources | `src/data/festivals.ts` |
| Food, attire, places, brands, gifts, music, quiz | `src/data/*.ts` |
| How plans are chosen | `src/domain/matchmaker/engine.ts` |
| Budget split | `src/domain/budget.ts` |
| Date rules | `src/domain/dates.ts` |
| AI prompts and guard | `src/lib/intelligence-service.ts`, `src/app/api/matchmaker/concept/route.ts`, `src/lib/ai/` |
| Database | `supabase/migrations/`, then `npm run db:seed:generate` and `npm run db:verify` |
| Navigation and site details | `src/lib/site.ts` |
