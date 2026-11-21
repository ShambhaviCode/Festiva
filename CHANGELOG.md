# Changelog

All notable changes to FESTIVA. Versions follow [Semantic Versioning](https://semver.org/). Dates are when each version was built.

## 1.2.0, hackathon finalist release (18 November 2026)

Built on 1.1.2 without removing any module or feature. Saved plans from earlier versions still open.

### Added
- **Matchmaker: how the celebration is kept.** A new choice of religious, cultural or secular observance. Secular plans leave out rites; religious plans give rites priority and add a "Prayer or rites" block to the schedule.
- **Matchmaker: ages coming.** Optional age groups (under 5, 5 to 12, 13 to 17, adults, over 65). When anyone under 18 is coming, no alcohol is suggested. Children's activities rank higher, and a "Quiet time" block is added for under-5s on longer days. Each change is explained in the plan's reasoning.
- **One journey from festival to gift exchange.** A festival page opens a Matchmaker plan prefilled for that festival, and a finished plan has a **Start a Gift Circle** button. Gift Circle then opens with the festival, the next date, the currency, the per-gift budget, the group size and the gift style already filled in. Every link value is checked, and bad ones are ignored.
- **15 researched festivals from underrepresented regions:** Meskel, Homowo, Vodun Days, Tweede Nuwe Jaar, Loy Krathong, Sinulog, Thaipusam, Garma, Merrie Monarch, Sámi National Day, Fiesta de la Candelaria, Guelaguetza, Junkanoo, Trinidad and Tobago Carnival, and Kandy Esala Perahera. That makes 46 festivals across 40 countries, with 9 new countries, 11 new places and a new dish.
- **Cultural detail on every festival page:**
  - names in their original scripts, with language tags;
  - symbols and their meanings;
  - how the date is set (the calendar system);
  - what kind of information each section holds: documented history, belief and interpretation, community practice, or guidance;
  - the page's expert-review status. Every page says it has not yet been reviewed, because no expert has reviewed any of them.
- **Integration evidence mode:** `npm run integrations:evidence` writes a timestamped Markdown and JSON report to `evidence/`. Each result is labelled LIVE SERVICE, LOCAL TEST DOUBLE, NOT CONFIGURED or LOCAL CHECK, and secrets are redacted. With `--watch-flag <name>`, it records a Flagsmith flag being switched in the dashboard.
- **Documentation:**
  - a Windows 11 and VS Code guide;
  - an architecture diagram;
  - a three-minute demo script;
  - Vercel and Supabase deployment steps;
  - a sponsor evidence guide;
  - a draft privacy policy;
  - legal and expert review questions;
  - the content review workflow;
  - a testing and verification report.

### Security and privacy
- Rate limiting can no longer be bypassed by sending a fake `X-Forwarded-For` header. The trusted header is chosen by `FESTIVA_TRUST_PROXY` (on Vercel, `x-real-ip`).
- A flood of new addresses no longer clears everyone's limits. Only the oldest entries are dropped.
- Translation and AI structuring are each capped at 300 calls per hour per address, on top of the per-participant limits, which bounds the Sarvam bill.
- Guessing circle keys is limited to 30 failed attempts per minute per address.
- The privacy page now explains voice recordings in detail, children's data (the DPDP Rules 2025 require verifiable parental consent for under-18s), and how long data is kept and how to delete it. The join page says that Gift Circle is for adults.

### Changed
- The region "Latin America" is now "Latin America and the Caribbean".
- Knowledge Challenge no longer asks about a festival whose name gives away its country.

## 1.1.2, hackathon readiness audit (18 November 2026)

### Fixed
- Provider attribution is proven on the server. Sarvam transcripts, translations and suggested fields carry a signed receipt. A preference can only be saved under Sarvam's name with a valid receipt, and edited originals invalidate a stale translation.
- New Orleans no longer claims Rio's Carnival.
- Pongal and Nowruz show checked 2027 dates instead of being labelled "fixed date".

## 1.1.1, visual upgrade (17 November 2026)

### Changed
- Presentation only. Added:
  - one artwork language per content type;
  - the Journeys world map;
  - the "year at a glance" ribbon;
  - card-to-page transitions;
  - Gift Circle seats, a budget meter and the Secret Santa reveal;
  - skeletons and font fallbacks;
  - mobile fixes for the admin pages.

## 1.1.0, Gift Circle and sponsor integrations (17 November 2026)

### Added
- **FESTIVA Gift Circle:**
  - an A/B onboarding experiment;
  - invitations;
  - typed or spoken preferences in 27 languages;
  - transcript review;
  - translations kept apart from the original;
  - structured wishlists and gift ideas;
  - Secret Santa;
  - contribution commitments and budget insights;
  - a printable summary.
- **Sponsor integrations:**
  - Sarvam AI, for speech to text, translation and structuring;
  - Flagsmith, for server-enforced flags, remote configuration and the experiment;
  - NudgeBee, for Event Webhook alerts and the GraphQL read-back.
- **Operations:**
  - telemetry with Prometheus export;
  - alert rules and controlled tests;
  - approval-gated runbooks with an audit trail;
  - admin pages.
- The `gift_circles` table with Row Level Security, local test doubles, and a live check script.

## 1.0.0, first release (16 November 2026)

### Added
- **The modules:** Discover, Journeys, Taste, Wear, Shop, Wishes, Play, Sound, Intelligence, the Matchmaker (with plans and share links) and Account.
- **Platform:**
  - the WebGL globe;
  - the Supabase schema with Row Level Security;
  - the deterministic Matchmaker engine;
  - unit, database and end-to-end tests.
