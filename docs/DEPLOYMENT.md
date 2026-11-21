# Deployment: Vercel and Supabase

**Nothing in this repository has been deployed.** These steps need the founder's own accounts, and each one is the founder's decision. None of them was carried out during the build. The free tiers of Vercel (Hobby) and Supabase (Free) are enough for a hackathon demo. Do not upgrade either plan without deciding to.

## Choose a shape

| Shape | Good for | What you give up |
| --- | --- | --- |
| **Vercel, demo mode** (no Supabase) | A public link to show judges the 11 modules | Share links live in one serverless instance's memory, so they are unreliable. Gift Circle data is lost when an instance recycles |
| **Vercel and Supabase** (recommended) | Durable share links, accounts, saved plans and Gift Circles | Operations records (alerts, audit trail, integration status) are kept per instance in `/tmp`, so they are not durable |
| **One long-running server** (VM, container or Render/Railway/Fly with a volume) | The full operations centre, durable file store and metrics | You run the server yourself |

## 1. Put the code on GitHub (private)

```bash
git init                     # skip if the folder is already a repository
git add .
git commit -m "FESTIVA 1.2.0"
git branch -M main
git remote add origin https://github.com/<you>/festiva.git   # create an EMPTY private repository first
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `.next`, `.festiva-data`, `evidence/` and every `.env*` file except `.env.example`. Before pushing, run `git status` and check that `.env.local` is not listed. Keep the repository **private** until you decide otherwise.

## 2. Supabase

1. Create a project at <https://supabase.com> on the Free plan, and choose a region near your users (for India, Mumbai).
2. Apply the schema. In **SQL Editor**, run these files in this order:
   1. `supabase/migrations/20261116000000_festiva_core.sql`: catalogue, plans, share links and analytics, with Row Level Security;
   2. `supabase/migrations/20261117000000_gift_circles.sql`: Gift Circle storage, with RLS on and no client policies;
   3. `supabase/seed.sql`, optionally: the catalogue, generated from `src/data`. It can safely be run again.

   With the Supabase CLI instead: `supabase link --project-ref <ref>`, then `supabase db push`.
3. **Authentication → URL Configuration:**
   - set **Site URL** to your production URL;
   - add `https://<your-domain>/account` to **Redirect URLs**.
4. **Project Settings → API:** copy the **Project URL**, the **anon public** key and the **service_role** key. The service_role key is secret: it goes only into Vercel's server environment variables, never into code or chat.

`npm run db:verify` replays the same SQL on an embedded Postgres engine (PGlite). It is how the migrations and RLS policies were verified: 40 checks.

## 3. Vercel

1. Go to <https://vercel.com>, choose **Add New → Project**, and import the GitHub repository. The framework preset is Next.js; keep the default build command and output directory.
2. **Environment Variables** (Production). Every one is optional except the site URL:

| Variable | Value | Secret | Why |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>` | no | Canonical links, sitemap, social cards |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | no | Accounts, plans, share links |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | no (RLS protects data) | Same |
| `FESTIVA_CIRCLE_STORE` | `supabase` | no | Durable Gift Circles on serverless |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **yes** | Server-only access to `gift_circles` |
| `FESTIVA_DATA_DIR` | `/tmp/festiva` | no | Vercel's only writable folder, used for per-instance operations records |
| `FESTIVA_TRUST_PROXY` | `vercel` (detected automatically) | no | Rate limits read `x-real-ip` |
| `FESTIVA_ADMIN_TOKEN` | 32+ random characters | **yes** | Opens `/admin` |
| `SARVAM_API_KEY`, `FLAGSMITH_ENVIRONMENT_KEY`, `NUDGEBEE_*` | from [SPONSOR_EVIDENCE.md](SPONSOR_EVIDENCE.md) | **yes** | Sponsor features |
| `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` | provider key | **yes** | Optional AI answers in Intelligence |

   Never give a secret a `NEXT_PUBLIC_` prefix: that would put it in the browser bundle. FESTIVA validates its variables at start-up and refuses obviously wrong ones.
3. Press **Deploy**.
4. Open `https://<your-domain>/api/health`. Expect `"supabase": true` and `"sharing": "supabase"`, plus the integrations you configured.
5. Sign in at `/admin/integrations` and run each connection test. A badge says **Connected** only after a real request succeeds.

### Known limits on Vercel

- **Rate limits** are per serverless instance (in memory), so a busy deployment allows more than the stated limits. For real traffic, move them to a shared store such as Upstash Redis or a Supabase table. That is a new dependency, so it was left as a decision ([KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)).
- **The operations centre's** alert loop runs inside a long-lived process. On serverless it runs only while an instance is warm, and its records are per instance. For a NudgeBee demo, use one long-running server, or run `npm run start` locally with your keys.
- **Voice uploads** are capped at 2 MB, under Vercel's 4.5 MB request-body limit.

## 4. One long-running server (alternative)

```bash
npm ci
npm run build
FESTIVA_DATA_DIR=/var/lib/festiva FESTIVA_TRUST_PROXY=1 npm run start   # behind one HTTPS reverse proxy
```

- **`FESTIVA_TRUST_PROXY`:** use `1` when exactly one reverse proxy you control sets `X-Forwarded-For`, and `none` when nothing sits in front of the server.
- **`FESTIVA_DATA_DIR`:** put it on a persistent volume.
- **Prometheus:** see `ops/prometheus/`.
- **Kubernetes:** an untested manifest is in `ops/kubernetes/`.

## 5. Before a public launch

These are decisions for the founder, not code:

- **Privacy and terms.** Publish a privacy policy and terms reviewed by a lawyer. Start from [PRIVACY_POLICY_DRAFT.md](PRIVACY_POLICY_DRAFT.md); the open questions are in [LEGAL_REVIEW.md](LEGAL_REVIEW.md).
- **Spending limits.** Set them in the Sarvam, Flagsmith, NudgeBee and AI-provider dashboards.
- **Cultural review.** Ask cultural experts to review the most sensitive festival pages ([CONTENT_REVIEW.md](CONTENT_REVIEW.md)).
- **Shared rate limiting.** Replace the in-memory rate limiter with a shared store if you expect real traffic.
- **Date checks.** Check the movable-festival dates for the coming year (`DATES_CHECKED` in `src/data/festivals.ts`).

## Rolling back

In Vercel, open **Deployments**, choose the previous deployment, and select **Promote to Production**. Migrations only add tables and policies; neither one drops data. The 1.1.2 release is preserved unchanged as `festiva-1.1.2.zip` and as Git tag `v1.1.2`.
