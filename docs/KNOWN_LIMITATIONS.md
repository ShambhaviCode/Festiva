# Known limitations

Stated plainly, so nobody is surprised later.

## Not built

- **Native mobile app.** No React Native or Expo project exists. The web app is responsive and tested at phone size. See `MOBILE.md` for what is reusable and what remains.
- **Deployment.** Nothing has been deployed to Vercel or anywhere else, and no GitHub repository was created or pushed.
- **Translated interface.** The interface is English only. Dates, numbers and currencies follow the chosen locale, greetings carry their own language, and Wishes writes in four languages, but UI strings are not extracted into message catalogues.
- **File uploads and Supabase Storage.** Not used. There is nothing to upload in the current product.
- **Embedded music playback.** Sound links out to YouTube, Spotify and Apple Music searches. Embedded players and "official video" lookups need those services' licensed APIs and keys.
- **Maestro tests, GSAP/ScrollTrigger, React Three Fiber, shadcn/ui.** Evaluated and not used; see `ARCHITECTURE.md` for why.

## Built but not verified against live services

No credentials were available during the build, and none were requested.

| Feature | What was verified | What was not |
| --- | --- | --- |
| Supabase schema and RLS | Migration and seed apply cleanly and idempotently, and 33 behaviour checks pass on PGlite (real PostgreSQL compiled to WebAssembly) with a shim for Supabase's `auth` schema and roles | Never applied to a real Supabase project |
| Supabase Auth (sign-in, sign-up, magic link, sign-out) | Code compiles and the "not configured" state is tested | The sign-in flow itself has never been executed |
| Cloud plan sync and Supabase-backed share links | Code compiles; the equivalent SQL behaviour is covered by the database checks | Never executed against a live project |
| Anthropic and OpenAI providers | Request shape, header handling, timeouts, invalid output, HTTP errors and prompt-injection handling are unit-tested with fake `fetch` and fake providers | No real model call has ever been made, so answer quality and the default model names are untested |
| Analytics sink | Endpoint validation is tested; inserting is covered by a database check | No dashboard or reporting exists |

Treat these as code-complete and unproven. Budget time to test each one when the credentials exist.

## Limits of what is built

- **The guide is small.** 31 festivals, 50 dishes, 18 attire entries, 24 destinations, 14 brands, 22 gift ideas, 49 artists. Many traditions are missing, and coverage is uneven across regions. The Matchmaker can only recommend what the guide holds and says so when it has nothing.
- **Content has not had expert review.** Descriptions are written from general reference knowledge. Before a public launch they should be reviewed by people from each tradition. See `DATA_PROVENANCE.md`.
- **Movable dates need yearly upkeep.** Lunar dates are stored through 2027 only. After that, pages show "Date to be confirmed" until new checked rows are added. Matariki's 2027 date is marked unchecked.
- **Dates use the Gregorian calendar and a single date per festival-year.** Per-country observance tables are not modelled, though notes describe known differences.
- **Imagery is generative artwork**, not photography. Licensed photography would need sourcing and rights clearance.
- **Shop has no products in the retail sense.** No prices, stock, ratings or checkout, by design, because there is no approved product feed. "Budget selection" is handled by tiers and by handing the budget to the Matchmaker.
- **The Matchmaker is rules-based.** It is consistent and explainable, but it does not understand free-text wishes. With an AI key, only the plan introduction can be rewritten by a model.
- **Intelligence without an AI key is retrieval, not conversation.** It matches a festival and a topic and returns guide entries. It handles simple follow-ups only.
- **Demo share links are held in server memory.** They vanish on restart and are unreliable across serverless instances. Use Supabase in production.
- **Rate limiting is in-memory and per instance.** Adequate for one server; use a shared store (for example Redis) behind a load balancer or on serverless.
- **Content-Security-Policy allows inline scripts** (`script-src 'unsafe-inline'`), because Next.js emits inline bootstrap scripts. A nonce-based policy is a recommended hardening step.
- **Accessibility was tested automatically** (axe-core on 18 page states, plus keyboard and focus checks). It has not been tested with screen-reader users. The WebGL globe is decorative and hidden from assistive technology. Free-hand drawing in the Rangoli Designer needs a pointer; ring buttons provide a keyboard path.
- **Performance figures are lab measurements** from one machine with software-rendered WebGL. There is no field data and no Lighthouse score. See `PERFORMANCE.md`.
- **Privacy page is descriptive, not legal.** A public deployment needs a real privacy policy and terms.
- **Analytics events are collected only when Supabase is configured**, and there is no reporting UI. "Returning users" and "referral visits" have event names reserved but are not yet emitted by the client.

## Approvals and credentials needed from the founder

| Needed | For |
| --- | --- |
| GitHub repository | Hosting the code |
| Vercel account and domain | Deployment |
| Supabase project | Accounts, cloud plans, durable sharing, analytics |
| Anthropic or OpenAI API key, with a spending limit | AI-written answers and plan introductions |
| Decision on a licence | Whether and how others may reuse the code |
| Product-feed or affiliate approvals | Real products and prices in Shop |
| YouTube / Spotify / Apple developer access | Embedded playback in Sound |
| Apple and Google developer accounts | A native app |

## Gift Circle and sponsor integrations (added 17 November 2026)

**No sponsor integration has been verified against the real service.** The build environment's proxy refused connections to Sarvam, Flagsmith and NudgeBee, and no credentials were provided. What was verified instead:

| Integration | Verified | Not verified |
| --- | --- | --- |
| Sarvam AI | Request shapes, headers, error mapping, timeouts and output validation with fake `fetch`; the whole voice → transcript → correction → translation → structuring → save journey against a local test double | That Sarvam accepts the requests and returns usable transcripts; real latency; real language detection quality; cost |
| Flagsmith | The official SDK evaluating a real environment-document format offline (flags, remote config, 50/50 multivariate split, stable assignment); local-evaluation polling against a test double, including live flag changes with no redeploy; unreachable-service fallback against a closed port | A real Flagsmith project, real key, real analytics and events delivery |
| NudgeBee | Telemetry, alert rules, controlled tests, approvals, audit trail (all real, in FESTIVA); Event Webhook and GraphQL request formats against a test double, following NudgeBee's published docs | A real NudgeBee workspace receiving and investigating the events; NudgeBee's agent observing FESTIVA in Kubernetes; any NudgeBee workflow calling FESTIVA |

Other limits:

- **Single instance by default.** The file store, in-memory rate limits, in-memory metrics and the alert loop assume one server process. Use `FESTIVA_CIRCLE_STORE=supabase` and a shared rate-limit store before running several instances; metrics are then per instance. On Vercel and other serverless hosts the file store does not persist, and background alert evaluation only runs while an instance is alive.
- **Supabase circle store** is implemented and its SQL and RLS are verified on PGlite, but the TypeScript adapter has never run against a live project. Experiment events, alerts and the audit trail use files even in Supabase mode.
- **No accounts for circles.** Access is by keys held in one browser. A person who clears their browser data or changes device loses access to that circle (the organiser can re-invite them). There is no key recovery.
- **Voice duration** is enforced exactly only for WAV; for WebM, Ogg, MP3 and M4A it is bounded by the recorder's own limit and the 2 MB cap. Sarvam rejects anything over 30 seconds.
- **Rules-based structuring reads English only.** Non-English preferences are structured from a Sarvam translation, or left for the person to fill in when Sarvam is not configured.
- **Gift ideas carry no prices**, by design: FESTIVA has no product feed. "Budget-aware" means tier-aware, plus figures people type themselves.
- **Contributions are commitments only.** FESTIVA does not process, hold or verify payments.
- **Experiment analysis** counts events; with fewer than 30 starts per variant it shows counts only. The z-test is shown as one signal, not a decision. Assignment without Flagsmith uses a labelled local hash.
- **Kubernetes manifests and the Dockerfile** (`ops/kubernetes/festiva.yaml`, `Dockerfile`) were never built or applied. The Prometheus rules were checked as YAML only, not with `promtool`.
- **Interface text is English.** Preferences can be in any language; the Gift Circle interface itself is not translated.
- **Accessibility**: axe-core finds no serious violations on the Gift Circle and admin pages. Recording needs a microphone; uploading a file and typing are the alternatives.

## Visual upgrade (FESTIVA 1.1, 17 November 2026)

- **Shared-element morphs depend on the browser.** React's `ViewTransition` uses the View Transitions API. Chrome, Edge and Safari 18+ animate the card into the detail page; other browsers change page instantly, which is the intended fallback.
- **The Journeys world map crowds in South Asia on phones.** Eight destinations sit within a few degrees of each other, so at 390 px their pins overlap. Every destination is also in the list directly below the map, which is the reliable way in on a small screen.
- **Plates and textiles are generated, not drawn from each real dish or garment.** Course and description decide the plate (a dumpling is drawn round, a diamond-cut sweet as diamonds), and the palette comes from the festival, but the art is a stylised sign of the kind of thing, not a picture of it.
- **Fallback font metrics were measured against Times New Roman and Arial.** On systems that have neither (nor Liberation, Tinos or Arimo), the browser uses another fallback and a small shift on font load can return. The visual audit measured layout shift of at most 0.042, and at most 0.01 on 86 of 87 page and width combinations, on this machine.
- **Visual checks ran in one browser.** Screenshots and layout measurements are from headless Google Chrome on Linux at 1440, 768 and 390 px. Safari and Firefox were not available here; no real phones were used.
- **Admin tables scroll sideways inside their own box on phones.** The page itself no longer scrolls sideways, but the flag and experiment tables are wider than a phone and scroll within their frame.

## Hackathon readiness audit (18 November 2026)

- **Sponsor services remain unreached.** In this environment `api.sarvam.ai`, `edge.api.flagsmith.com` and `app.nudgebee.com` could not be reached (connection refused by the network proxy), and no credentials exist. Every sponsor path is verified only against local test doubles.
- **Festival dates run out after 2027.** Movable festivals (13 of 31, now including Pongal and Nowruz) carry checked dates for the next occurrence only. After those dates pass, their pages fall back to "usually in" months until 2028 rows are added in `src/data/festivals.ts`.
- **Festival descriptions are reference text, not audited.** Each festival links one reference article and is labelled "reference" on its page; only the dates of movable festivals were checked against published calendars.
- **Matariki 2027 is shown as "not yet checked".** The date (25 June 2027) comes from a reference article, not the New Zealand government's published list.
- **Mardi Gras is not in the guide.** New Orleans is listed as a destination with no festival linked; it previously pointed at Rio's Carnival, which was wrong.
- **Rule-based preference reading is approximate.** Without Sarvam, a typed "tea set" was categorised as "Sweets and gourmet" in the audit. The participant reviews and can correct every field before saving.

## Finalist release 1.2.0 (18 November 2026)

What is **blocked**, and who can unblock it:

| Item | Status | Needs |
| --- | --- | --- |
| Live Sarvam AI, Flagsmith and NudgeBee | **BLOCKED**: unreachable from the build environment; no credentials | The founder's keys, then `npm run integrations:evidence` on her machine ([SPONSOR_EVIDENCE.md](SPONSOR_EVIDENCE.md)) |
| NudgeBee investigation of FESTIVA's events | **BLOCKED** | A NudgeBee workspace; for the infrastructure view, a Kubernetes cluster (a decision about cost) |
| Expert review of festival content | **NOT DONE** | Named cultural or religious experts ([CONTENT_REVIEW.md](CONTENT_REVIEW.md)); `EXPERT_REVIEWS` is empty and every page says "Not yet reviewed" |
| Legal review | **NOT DONE** | A lawyer, for the privacy policy, terms, children's consent and transfers ([LEGAL_REVIEW.md](LEGAL_REVIEW.md)) |
| Public deployment | **NOT DONE**, by instruction | The founder's Vercel and Supabase accounts and her decision ([DEPLOYMENT.md](DEPLOYMENT.md)) |
| Windows 11 run | **NOT RUN** here | Any Windows machine; follow [WINDOWS_SETUP.md](WINDOWS_SETUP.md) |
| Firefox and Safari (WebKit) tests | **BLOCKED**: browser download refused here | `npx playwright install firefox webkit` on a normal network, then run with a Firefox or WebKit project |

Limits of the 1.2 additions:

- **Observance and ages are coarse.** Three ways of keeping a festival and five age groups. They change what is suggested and why, but cannot capture every family; the plan stays fully editable.
- **"No alcohol when under-18s attend" is a default, not a law check.** It removes alcohol from suggestions; it does not encode any country's licensing rules.
- **The 15 new festivals are reference-sourced, not expert-reviewed.** Dates: 3 checked against published calendars (Vodun Days 2027, Loy Krathong 2026, Thaipusam 2027); 3 projected (Meskel 2027, because of the Ethiopian leap year; Loy Krathong 2027, where sources disagree; Guelaguetza 2027, derived from its "Mondays after 16 July" rule); 3 seasonal (Homowo, Garma, Kandy Esala Perahera, whose dates are set each year by the community or temple); the rest fixed or computed from a rule.
- **Some proposed festivals were left out on purpose.** Tsagaan Sar (sources conflict on the 2027 date), NAIDOC Week and National Indigenous Peoples Day (no linked place in the guide yet). Better a smaller honest list.
- **Coverage is still uneven.** 46 festivals: South Asia 8, Europe 7, Latin America and the Caribbean 7, East Asia 5, Africa 5, Middle East 4, Southeast Asia 4, Oceania 3, North America 2, Central Asia 1.
- **Original-script names depend on the reader's fonts.** Ge'ez, Thai, Sinhala, Tamil and Northern Sámi characters show as boxes where the device lacks a font; the romanised name is always shown beside them.
- **Prefill links are convenience, not state.** A Matchmaker or Gift Circle link carries only public plan values (festival, currency, budget, group size, tier); nothing personal, and every value is re-validated.
- **Rate limits are still in memory.** They are now spoof-resistant and evict fairly, but remain per instance; on Vercel each instance counts separately.
- **Privacy page and draft policy are not legal advice** and have not been reviewed by a lawyer.
