# Operational runbooks

Linked from FESTIVA's alerts (and from `runbook_url` in `ops/prometheus/festiva-alerts.yml`). Every action below that changes something is proposed in `/admin/operations` and runs only after an administrator approves it with a reason. All actions are reversible.

## Gift Circle API latency is high

1. Check whether a controlled latency test is running (operations centre, Switches). If so, approve **End controlled tests**.
2. Look at the slowest routes in the alert's findings. Voice and structuring routes wait on Sarvam: check `festiva_provider_request_duration_seconds` for `provider="sarvam"`.
3. If Sarvam's chat model is slow, approve **Use FESTIVA's rules for preference structuring**. Reverse with **Resume AI structuring**.
4. Otherwise check the server's CPU and memory, and the storage probe time.

## Voice transcription is failing

1. Read the failure codes in the findings: `auth` (key rejected: check `SARVAM_API_KEY`), `quota` (rate limit or credit), `provider_unavailable` or `timeout` (Sarvam side), `controlled_test` (a test is running).
2. Approve **Pause voice capture** while it is investigated. Participants keep typing; nothing is lost.
3. When `npm run integrations:check` passes again, approve **Resume voice capture**.

## Circle storage is unhealthy

1. Approve **Re-check storage** to probe again and record the result.
2. File store: check that `FESTIVA_DATA_DIR` exists, is writable by the server user and has free space.
3. Supabase store: check the project status and that `SUPABASE_SERVICE_ROLE_KEY` is valid.

## API error rate is high

1. Read the "by route" breakdown. 503 with `not_configured` means a provider is not set up, not a fault.
2. End any controlled test. Check the server logs (`scope: festiva.api`) for the error names on those routes.

## Preference processing is failing

Each failure already fell back to FESTIVA's rules, so no preference was lost.

1. Read the codes: `invalid_response` (model output did not match the schema), `timeout`, `quota`.
2. Approve **Use FESTIVA's rules for preference structuring** until it recovers.
