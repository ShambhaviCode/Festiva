<div align="center">

# FESTIVA

**Global festival discovery and AI-assisted celebration planning.**

[Live demo](https://festiva-eta.vercel.app) · [Architecture](docs/ARCHITECTURE.md) · [Sponsor evidence](docs/evidence/integration-evidence-2026-11-21-live.md)

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_strict-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_RLS-3ecf8e?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-555555?style=flat-square)



</div>

## Overview

FESTIVA covers 149 festivals across 157 countries: history, traditions, food, dress, music and destinations, with a sourced next date for every movable festival. A deterministic **Matchmaker** turns six answers into a complete celebration plan, and **Gift Circle** lets a group organise a gift exchange across languages, by voice or text.

## What it does for users

| Need | How FESTIVA solves it |
|---|---|
| **Understand a celebration** | Each festival page explains meaning, history, regional variations and etiquette, and gives the next date with its source and how certain it is. |
| **Plan one, fast** | The Matchmaker asks six questions (occasion, place and people, budget, food, style and time, interests) and returns an editable plan: schedule, food, gifts, attire, décor, music and greetings, with a budget that always adds up. |
| **Eat right** | Every dish lists vegetarian and vegan status and common allergens, and plans respect dietary needs. |
| **Gift as a group** | Gift Circle collects everyone's wishes by voice or text in their own language, translates them, suggests gifts, draws Secret Santa and tracks who has contributed. |
| **Travel and explore** | A world map of 35 places where festivals come alive, with landmarks, experiences and a short itinerary for each. |
| **Share and keep** | Save plans, export them as text, JSON or PDF, share a link and revoke it later. Greeting cards download as images. |

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/app/home.jpg" alt="Home page with the festival globe" /><br /><sub><b>Home:</b> a WebGL globe of festival lights</sub></td>
    <td width="50%"><img src="docs/screenshots/app/festival.jpg" alt="Diwali festival page" /><br /><sub><b>Festival page:</b> meaning, sourced next date and a one-click plan</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/app/matchmaker.jpg" alt="Matchmaker" /><br /><sub><b>Matchmaker:</b> six questions with a live plan preview</sub></td>
    <td><img src="docs/screenshots/app/gift-circle.jpg" alt="Gift Circle" /><br /><sub><b>Gift Circle:</b> multilingual group gifting powered by Sarvam AI</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/app/discover.jpg" alt="Discover festivals" /><br /><sub><b>Discover:</b> 149 festivals with search and filters</sub></td>
    <td><img src="docs/screenshots/app/taste.jpg" alt="Festival food" /><br /><sub><b>Taste:</b> festival dishes with diet and allergen notes</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/app/journeys.jpg" alt="Journeys map" /><br /><sub><b>Journeys:</b> an interactive map of festival destinations</sub></td>
    <td align="center"><img src="docs/screenshots/app/mobile.jpg" width="45%" alt="Mobile view" /><br /><sub><b>Mobile:</b> fully responsive</sub></td>
  </tr>
</table>

## Sponsor integrations, verified live

| | Integration | Verified |
|---|---|---|
| **Sarvam AI** | Speech-to-text (`saaras:v4`), translation (`sarvam-translate:v1`), structured preference extraction (`sarvam-105b`, JSON schema). Every AI-derived field carries an HMAC-signed provenance receipt, verified on the server. | Live |
| **Flagsmith** | Official server SDK with local evaluation. Ten flags enforced in both UI and API, validated remote config, and a multivariate onboarding experiment. No redeploy needed for any change. | Live |
| **NudgeBee** | Five alert rules over real telemetry, delivered to NudgeBee's Event Webhook. Runbooks are approval-gated, reversible and audited. Runs on a self-hosted Community install (Helm on k3s). | Live |


## Engineering

- **Architecture:** Next.js 16 App Router with Cache Components and partial prerendering (582 static pages). Pure domain logic sits in `src/domain`, curated data in `src/data`, and integrations are isolated in `src/lib/integrations`.
- **Correctness:** budget arithmetic in integer minor units; no model ever computes a total. Zod 4 validates every input and environment variable.
- **Security:** strict CSP and security headers, server-only secrets, spoof-resistant rate limiting, signed admin sessions, and Row Level Security on all 30 Supabase tables.
- **Resilience:** every external service has an honest fallback, so the app runs fully with zero configuration.
- **Frontend:** React 19, Tailwind CSS 4, a WebGL globe (Three.js and GLSL) with 2D fallback, view transitions, and accessibility tested with axe-core.

## Quick start

```bash
npm ci
npm run dev            # http://localhost:3000
```



## Quality

```bash
npm run lint && npm run typecheck   # ESLint, strict TypeScript
npm test                            # 416 unit tests
npm run db:verify                   # migrations and RLS on embedded Postgres
npm run test:e2e                    # Playwright end-to-end and accessibility
```

## Documentation

[Architecture](docs/ARCHITECTURE.md) · [Deployment](docs/DEPLOYMENT.md) · [Sponsors](docs/SPONSORS.md) · [Testing](docs/TESTING.md) · [Demo script](docs/DEMO_3_MINUTES.md) · [Known limitations](docs/KNOWN_LIMITATIONS.md)



---

<div align="center">

Built by **Shambhavi M K** · [GitHub](https://github.com/ShambhaviCode) · MIT License

</div>
