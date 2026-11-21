# Sponsor integrations: Sarvam AI, Flagsmith, NudgeBee

FESTIVA Gift Circle uses three sponsor technologies for three connected parts of one problem: a family organising a festival gift exchange across languages.

| Sponsor | Actual use in FESTIVA | Proof available | Status |
| --- | --- | --- | --- |
| **Sarvam AI** | Speech-to-text for voice preferences (`saaras:v4`), translation between 22 Indian languages and English (`sarvam-translate:v1`), structuring preferences and cultural suggestions (`sarvam-105b`, JSON-schema output) | **Live, 20 November 2026:** translation (`sarvam-translate:v1`) and speech-to-text (`saaras:v4`) answered from `api.sarvam.ai` with Sarvam request IDs; signed attribution receipts verified. Report: [evidence/integration-evidence-2026-11-20-live.md](evidence/integration-evidence-2026-11-20-live.md). The full voice → review → translate → save journey is also covered against a local test double. | **CONNECTED, LIVE SERVICE VERIFIED** |
| **Flagsmith** | Ten feature flags that gate real behaviour on the server and in the UI, validated remote configuration (`gift_circle_config`), and an onboarding A/B experiment (multivariate flag) | The official `@flagsmith/nodejs` SDK evaluates a real Flagsmith environment document (offline mode) in unit tests, and polls a local test double in end-to-end tests, where a flag change switches voice and Gift Circle off and on with no redeploy. **Live, 20 November 2026:** a real Flagsmith project (Development environment, ten flags) is evaluated by the running app through `edge.api.flagsmith.com` with a server-side key; `/api/flags` reports `"source": "flagsmith"`. | **CONNECTED, LIVE SERVICE VERIFIED** |
| **NudgeBee** | Receives FESTIVA's alerts through its documented Event Webhook; FESTIVA reads them back through NudgeBee's GraphQL API; a NudgeBee workflow can propose (never run) a FESTIVA runbook; Prometheus metrics and alert rules for the NudgeBee agent path | Telemetry, alert rules, controlled tests, approval-gated runbooks and the audit trail run for real in FESTIVA. Event delivery and GraphQL reads are verified against a local test double. **Live, 21 November 2026:** NudgeBee Community 1.14.0, self-hosted with its official Helm chart on a k3s cluster (AWS EC2, Sydney), accepted FESTIVA's controlled-test event through its Event Webhook (HTTP 200, firing then resolved). Report: [evidence/integration-evidence-2026-11-21-live.md](evidence/integration-evidence-2026-11-21-live.md). GraphQL read-back is not configured. | **CONNECTED, LIVE SERVICE VERIFIED (EVENT WEBHOOK)** |

All three sponsors were verified against live services on 21 November 2026 (`npm run integrations:evidence`: 5 passed, 0 failed, 1 skipped). NudgeBee Cloud sign-up is closed (onboarding by request), so NudgeBee runs as the self-hosted Community edition, installed with `helm install nudgebee oci://ghcr.io/nudgebee/charts/nudgebee` on a 16 GiB k3s node. FESTIVA needed no code change: only `NUDGEBEE_EVENT_WEBHOOK_URL` and `NUDGEBEE_EVENT_WEBHOOK_TOKEN`.

---

## How to verify live, in five minutes

For a step-by-step guide that also produces a shareable, redacted evidence report (`npm run integrations:evidence`), see [SPONSOR_EVIDENCE.md](SPONSOR_EVIDENCE.md).

1. Copy `.env.example` to `.env.local` and fill in the keys you have (sections below).
2. Run:

   ```bash
   npm run integrations:check
   ```

   It makes a few small, real requests through the same provider code the app uses and prints `PASS`, `FAIL` or `SKIP` per integration, without printing secrets. Any provider URL on `localhost` is labelled as a local test double.
3. Start the app (`npm run build && npm start`), sign in at `/admin/integrations` with `FESTIVA_ADMIN_TOKEN`, and press each connection test. A badge says **Connected** only after a genuine request has succeeded.

---

## Sarvam AI: multilingual experience engine

**Code:** `src/lib/integrations/sarvam.ts` (`SarvamProvider`), `src/domain/languages.ts` (language layer), routes under `src/app/api/circles/[id]/{voice,translate,structure,cultural}`.

**What it does in the product**

1. A participant chooses a language (or automatic detection) and ticks a consent box.
2. They record (MediaRecorder, up to the configured limit, at most 30 s) or upload a recording.
3. The server checks size (2 MB), the real format from the file's bytes (WebM, Ogg, WAV, MP3, M4A, FLAC), WAV duration, consent, rate limits (6 per minute per participant, 30 per hour per client) and the flags, then sends it to `POST https://api.sarvam.ai/speech-to-text` with `model=saaras:v4` and the `api-subscription-key` header. The audio is never written to disk or logged.
4. The transcript comes back in the original language and script. The participant corrects it.
5. Optionally, `POST /translate` (`sarvam-translate:v1`, formal mode) produces a translation into the organiser's language. It is stored **beside** the original, in its own field, with its own "edited" marker. It never replaces the original.

**Provider receipts.** Every Sarvam response that can end up saved (a transcript, a translation, proposed fields) carries a receipt signed by FESTIVA's server: an HMAC over the circle, the participant, the model, the request ID, the language and a SHA-256 of exactly what Sarvam returned. The signing key is derived with HKDF from `SARVAM_API_KEY`, so there is no extra setting and it exists only when Sarvam is configured. When a preference is saved, the server checks the receipt and takes the model, request ID and language details from it, never from the browser, and works out itself whether the participant edited the text. A transcript or translation without a valid receipt for that circle and participant is refused; a translation whose original has since changed is refused; fields claimed as Sarvam's that do not match its receipt are saved as the participant's own. Receipts expire after six hours. Code: `src/lib/circles/receipts.ts`; tests: `tests/unit/receipts.test.ts` and the forgery test in `tests/e2e-integrations/sponsors.spec.ts`.
6. The approved preference is turned into structured wishlist fields: by `sarvam-105b` with `response_format: json_schema` (validated with Zod, URLs stripped, prompt-injection guard) when configured, or by FESTIVA's own rules otherwise. The participant edits the fields before saving.
7. AI cultural suggestions (behind `cultural_context_enabled`) are grounded in FESTIVA's guide entry for the festival and labelled "AI suggestion … Not verified". The guide entry itself is shown separately with its sources.

Text-to-speech (Bulbul) is not used: reading text back aloud would not improve this flow.

**Language coverage.** 23 languages (22 scheduled Indian languages plus Indian English) for speech and translation, from Sarvam's API reference. Odia is `or-IN` inside FESTIVA and `od-IN` for Sarvam; the mapping is explicit. Spanish, French, Arabic and Japanese are listed as typing-only, with no Sarvam features advertised. Urdu, Kashmiri and Arabic render right-to-left; Sindhi uses `dir="auto"` because it is written in two scripts.

**Credential**

| | |
| --- | --- |
| Variable | `SARVAM_API_KEY` (secret, server only) |
| Where from | dashboard.sarvam.ai → API keys |
| Test | `npm run integrations:check`, or **Run connection test** on `/admin/integrations` (one ~40-character translation) |
| Rotate | Create a new key in Sarvam, replace the variable, restart, run the test, then delete the old key |
| Disable | Remove the variable (voice and translation show "not configured"; typing keeps working), or switch off `sarvam_voice_enabled` in Flagsmith, or approve the **Pause voice capture** runbook |

Optional: `SARVAM_STT_MODEL` (`saaras:v4` or `saaras:v3`), `SARVAM_TIMEOUT_MS`.

Cost: Sarvam bills speech-to-text per second and translation per character (see their pricing page). New accounts receive free credit. Set your own limits in Sarvam's dashboard.

---

## Flagsmith: feature control and experimentation

**Code:** `src/lib/integrations/flagsmith.ts` (`FlagsmithProvider`), `src/lib/flags/definitions.ts`, `GET /api/flags`, `src/lib/circles/experiment.ts`.

**Flags and what they actually change** (all enforced by the API, not just hidden in the UI):

| Flag | Default | When off |
| --- | --- | --- |
| `gift_circle_enabled` | on | Navigation link disappears; pages say Gift Circle is paused; every Gift Circle API answers 403 |
| `sarvam_voice_enabled` | on | Speak control disabled with a reason; voice API answers 403; typing stays |
| `multilingual_onboarding_enabled` | on | Language pickers hidden; English (India) used for new circles and joins |
| `gift_recommendations_enabled` | on | Suggestions hidden and their API answers 403; manual wishlists work |
| `secret_santa_enabled` | on | Drawing names answers 403; participants' matches are not shown |
| `cultural_context_enabled` | on | AI suggestions hidden and their API answers 403; guide information still shown |
| `group_budget_insights_enabled` | on | Server stops computing insights; contributions still recorded |
| `premium_gifting_experience_enabled` | off | Elite-tier gift ideas left out |
| `matchmaker_experiment_enabled` | off | Summary links to the Matchmaker instead of drafting a plan inline |
| `new_gift_circle_onboarding_enabled` | on | Experiment off: everyone gets guided onboarding, no exposures recorded |

**Remote configuration:** feature `gift_circle_config`, value a JSON object, each field range-checked; invalid fields fall back to defaults and are reported on the admin page.

```json
{ "max_participants": 30, "max_recording_seconds": 30, "recommendation_count": 4, "invite_expiry_days": 14 }
```

`max_recording_seconds` cannot exceed 30, Sarvam's synchronous limit. No secrets go in remote configuration. Rollout percentages and per-environment availability are set in Flagsmith itself (segments with percentage splits, and separate environments); FESTIVA sends each visitor as an anonymous identity, so those work unchanged.

**The experiment.** `new_gift_circle_onboarding_enabled` is a multivariate flag with two variants, `guided` (four short steps) and `single_page`. Each visitor's variant comes from Flagsmith's percentage split for their anonymous identity, and is fixed for that visit. FESTIVA counts, per variant: onboarding started (sample size), circles created, completion rate, median time to create, invitations created and opened, joins, join conversion, and joiners who added a preference. It shows raw counts, and says "not enough data" until each variant has 30 starts; only then does it show a two-proportion test. Events are anonymous (hashed identifier) and are not counted when the browser sends Do Not Track or Global Privacy Control. With `FLAGSMITH_ENABLE_EVENTS=true`, exposures and conversions are also sent to Flagsmith's events API through the SDK.

**Refresh behaviour (what a judge sees after flipping a flag).** With a server-side key, the SDK downloads the environment document and refreshes it every `FLAGSMITH_REFRESH_SECONDS` (default 15). Browsers re-check `/api/flags` every 10 seconds and on focus. A change shows up within about 25 seconds, with no redeploy and no reload. With a client-side key, each evaluation calls Flagsmith, cached for 5 seconds.

**Failure behaviour.** If Flagsmith is unreachable or rejects the key, every evaluation returns FESTIVA's defaults, says why on the admin page, and records the failure. No page depends on Flagsmith being up.

**Setup**

1. In Flagsmith, create a project and an environment, and add the ten flags above plus `gift_circle_config`. Make `new_gift_circle_onboarding_enabled` multivariate with variations `guided` and `single_page` (for example 50/50), control value `guided`.
2. Environment settings → Keys → create a **server-side key** (`ser.…`).

| | |
| --- | --- |
| Variable | `FLAGSMITH_ENVIRONMENT_KEY` (secret, server only) |
| Test | `npm run integrations:check`, or **Evaluate flags now** on `/admin/integrations` |
| Rotate | Create a new server-side key, replace, restart, test, revoke the old key |
| Disable | Remove the variable: defaults apply and cannot change at runtime |

Admin access: only an administrator signed in with `FESTIVA_ADMIN_TOKEN` can see flag values and experiment data. Nobody can change a flag from FESTIVA at all; flags change only in Flagsmith.

---

## NudgeBee: operations intelligence and reliability

NudgeBee is an AI SRE and CloudOps platform for Kubernetes and cloud estates. It runs as NudgeBee Cloud (app.nudgebee.com) or self-hosted (Community edition, Helm on Kubernetes; the docs plan for 4 CPU / 16 GiB for a default install). It is not used here as a chatbot or for product features.

**What the current infrastructure is.** FESTIVA is a single Next.js server with optional Supabase. It is not deployed, not on Kubernetes, and has no Prometheus. `/admin/integrations` reports these prerequisites from what the running server can actually observe (for example whether `KUBERNETES_SERVICE_HOST` is set).

**What FESTIVA provides, all running for real:**

1. **Telemetry** (`src/lib/ops/metrics.ts`): every Gift Circle and admin API request (route template, status, duration), every provider call (outcome code, duration), every preference-structuring step, and a storage health probe. Exposed in Prometheus format at `GET /api/ops/metrics` with `Authorization: Bearer $FESTIVA_METRICS_TOKEN`. No personal content.
2. **Alert rules** (`src/lib/ops/alerts.ts`), evaluated every 30 seconds and on demand, mirrored as Prometheus rules in `ops/prometheus/festiva-alerts.yml`:
   - Gift Circle API latency (p95 > 1.5 s over 5 min, ≥ 5 requests)
   - Voice transcription failing (≥ 3 failures and ≥ 50% of attempts in 10 min)
   - Storage unhealthy (probe fails or > 1 s)
   - API error rate (≥ 10% 5xx over 5 min, ≥ 20 requests)
   - Preference processing failing (≥ 3 failed structuring steps in 10 min)
3. **Delivery to NudgeBee** through the documented **Event Webhook** (`POST https://<nudgebee-domain>/api/webhooks/event`, `Authorization: Bearer <token>`), with `id`, `fingerprint`, `status` (firing/resolved), `title`, `rule_name`, `severity`, `description` (FESTIVA's evidence), `subject`, `source_tool`, `url` back to the operations centre, and labels including `controlled_test`. NudgeBee creates, enriches and triages the event, and investigates it with its own tools.
4. **Read-back**: with a Platform API token, the operations centre lists FESTIVA's events from NudgeBee through the documented GraphQL `events_list` action (read-only).
5. **Human-approved runbooks** (`src/lib/ops/runbooks.ts`): pause or resume voice capture, switch structuring to FESTIVA's rules or back, re-check storage, end controlled tests. Each is narrow and reversible; none restarts, deletes, deploys, rolls back or touches credentials. An alert proposes; an administrator approves with a written reason; only then does it run; every step goes to the audit trail. A NudgeBee workflow (HTTP task, bearer `FESTIVA_OPS_WEBHOOK_TOKEN`) can call `POST /api/ops/runbook-proposals` to propose one; that token cannot approve or execute anything.
6. **Controlled test scenarios** (admin only): add 1.8 s to Gift Circle API requests, or fail the next five voice requests before they reach Sarvam, for up to 10 minutes. Everything they cause is labelled "[Controlled test]" in FESTIVA and in the events sent to NudgeBee.

FESTIVA's own "findings" come from its built-in checks and are labelled as such. Investigation by NudgeBee happens in NudgeBee's interface, linked from the admin pages.

**Credentials**

| Variable | Secret? | From | Purpose |
| --- | --- | --- | --- |
| `NUDGEBEE_EVENT_WEBHOOK_URL` | URL | NudgeBee → Admin → Integrations → Webhooks → Event Webhook | Where alerts go |
| `NUDGEBEE_EVENT_WEBHOOK_TOKEN` | yes | Same screen | Bearer token for the webhook |
| `NUDGEBEE_API_URL`, `NUDGEBEE_API_TOKEN` | token yes | NudgeBee → avatar → API Tokens → Platform, limited to Events | Read events back (optional) |
| `FESTIVA_METRICS_TOKEN` | yes | Generate (`openssl rand -base64 32`) | Prometheus scraping |
| `FESTIVA_OPS_WEBHOOK_TOKEN` | yes | Generate | NudgeBee workflows proposing runbooks (optional) |

Test: `npm run integrations:check` sends one labelled test event (firing, then resolved) and, if configured, one GraphQL read. Rotate: regenerate the webhook or API token in NudgeBee, replace, restart, re-test. Disable: remove the variables; alerts stay in FESTIVA's operations centre.

**Smallest real demonstration environment** (needs your approval: it uses accounts and possibly paid services): see [NUDGEBEE_DEMO.md](NUDGEBEE_DEMO.md).

---

## Security summary

- Every sponsor key is a server-only variable, read in `src/lib/env.server.ts`, never imported by client code, never logged, never shown on the admin page (only "configured" or not).
- Admin pages need `FESTIVA_ADMIN_TOKEN`; sessions are HMAC-signed, HttpOnly, SameSite=Strict, 8 hours; writes are same-origin only; sign-in is rate-limited and audited.
- Participants and organisers use per-circle keys (stored as SHA-256 hashes); they have no admin rights and cannot change flags.
- Audio is validated by its bytes, size-capped, sent to Sarvam only after consent, and never stored.
- Logs and metrics carry outcomes, codes and durations, never preferences, transcripts or recordings.
