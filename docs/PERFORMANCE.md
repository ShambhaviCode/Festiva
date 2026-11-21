# Performance

Measured, not estimated. These are **lab measurements** taken with `npm run perf` on the build machine: one load per page in headless Chrome against the production build served by `next start` on localhost. They are not field data and not Lighthouse scores, and FESTIVA claims no Lighthouse score. A real network, a real device and a CDN will give different numbers.

Measured at 2026-11-17T17:24:29.408Z, after the 1.1 visual upgrade. Raw output: `docs/performance-results.json`.

## Page loads

| Page | Viewport | FCP | LCP | CLS | Slowest interaction | Long tasks | Transferred | of which JS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 1366x900 | 172 ms | 172 ms | 0.0006 | 80 ms | 4 | 780 KB | 428 KB |
| `/discover` | 1366x900 | 144 ms | 144 ms | 0.0006 | 16 ms | 1 | 661 KB | 283 KB |
| `/discover/diwali` | 1366x900 | 144 ms | 144 ms | 0.0041 | 16 ms | 0 | 681 KB | 281 KB |
| `/matchmaker` | 1366x900 | 156 ms | 156 ms | 0.0006 | 16 ms | 1 | 708 KB | 371 KB |
| `/wishes` | 1366x900 | 104 ms | 104 ms | 0.0006 | 16 ms | 0 | 599 KB | 278 KB |
| `/sound` | 1366x900 | 120 ms | 120 ms | 0.0006 | 16 ms | 0 | 599 KB | 278 KB |
| `/` | 390x844 | 120 ms | 120 ms | 0 | 24 ms | 2 | 638 KB | 333 KB |

How to read this:

- **FCP and LCP** are low because the server is on localhost with no network latency. They show there is no render-blocking problem; they do not predict real-world LCP.
- **CLS** is below 0.01 on every page measured here. The wider visual audit (`scripts/visual-audit.mjs`, 29 pages at 1440, 768 and 390 px) also stays at or below 0.01; before the 1.1 visual pass, Gift Circle and admin pages measured 0.10 to 0.25. An earlier run measured up to 0.40 on `/sound` and `/wishes`, caused by small loading placeholders being replaced by tall content. Space is now reserved for that content.
- **Slowest interaction** is the longest event duration seen during one hover and one click. It is an indication, not a true INP figure, which needs real user sessions.
- **Transferred** is compressed bytes on the wire, including fonts and the route chunks Next.js prefetches for links in view.
- The homepage's long tasks come from compiling shaders and starting WebGL in software rendering.

## Change since the previous run

The previous recorded run (16 November, before Gift Circle and before the visual upgrade) is kept for comparison. Both passes landed between the two runs, so the difference below cannot be split exactly between them.

| Page | Viewport | Transferred | of which JS | CLS |
| --- | --- | --- | --- | --- |
| `/` | 1366x900 | 665 → 780 KB | 399 → 428 KB | 0.0003 → 0.0006 |
| `/discover` | 1366x900 | 542 → 661 KB | 254 → 283 KB | 0.0201 → 0.0006 |
| `/discover/diwali` | 1366x900 | 515 → 681 KB | 252 → 281 KB | 0.0099 → 0.0041 |
| `/matchmaker` | 1366x900 | 589 → 708 KB | 335 → 371 KB | 0.001 → 0.0006 |
| `/wishes` | 1366x900 | 487 → 599 KB | 249 → 278 KB | 0.0011 → 0.0006 |
| `/sound` | 1366x900 | 487 → 599 KB | 249 → 278 KB | 0.0011 → 0.0006 |
| `/` | 390x844 | 545 → 638 KB | 319 → 333 KB | 0.0001 → 0 |

What the visual pass added to the browser: the illustration components (plates, textiles, dot-map locators, brand tiles, game covers), the 5 KB land grid behind the locators, the year ribbon, the budget meter and the gift reveal. All artwork is SVG drawn from code; there are no image files. No animation library was added: motion is CSS keyframes, CSS transitions and React's built-in `ViewTransition`. The Journeys world map is a server component, so its 6,858 land dots arrive as markup and add no JavaScript. Fonts now have metric-matched local fallbacks, which removed the shift when web fonts arrive.

## Globe

| Measure | Result |
| --- | --- |
| Renderer used in the test | webgl |
| Frame rate | 38 frames per second |

Headless Chrome on this machine renders WebGL in software (SwiftShader) with no GPU, so this is a floor. GPU usage could not be measured here. The render loop stops when the globe is off screen or the tab is hidden, and never starts when reduced motion is requested; an end-to-end test confirms the canvas does not change under reduced motion.

## Memory

The globe was mounted and unmounted 15 times by client-side navigation between `/` and `/discover`, with garbage collection forced before each reading.

| Measure | Result |
| --- | --- |
| JS heap before | 13.1 MB |
| JS heap after | 13.6 MB |
| Growth | 0.4 MB |
| Canvases on the homepage afterwards | 1 |

No leak is evident. On unmount the scene disposes its geometries and materials, disconnects its observers and listeners, and releases the WebGL context.

## API latency

| Route | Samples | Median | 95th percentile |
| --- | --- | --- | --- |
| POST /api/intelligence (no AI provider) | 20 | 4 ms | 9 ms |

This is the grounded, in-process path with no AI provider. With a provider configured, latency is dominated by the provider and capped by `AI_TIMEOUT_MS`. That path was not measured because no credentials were available.

## Bundle size

From the production build, uncompressed:

| Asset | Size |
| --- | --- |
| All JavaScript chunks | 2,227 KB (1,941 KB at 1.0) |
| Largest single chunk (Three.js, loaded lazily on the homepage only) | 530 KB |
| CSS | 55 KB (43 KB at 1.0) |
| Fonts (all subsets; browsers download only the ranges they need) | 331 KB |

## What was done for performance

- Catalogue pages are prerendered; only configuration-dependent fragments stream.
- Three.js and the globe's land data load after first paint, during idle time, and only on the homepage.
- The Supabase SDK is imported lazily and never downloads when Supabase is not configured.
- Server-only modules (AI providers, server environment) are kept out of client bundles; search helpers used by client components do not pull in the dataset.
- Device pixel ratio for the globe is capped at 2, and at 1.5 on narrow screens.
- Fonts are self-hosted with `font-display: swap`. No third-party requests are made on any page.
- The app queries no database at request time in demo mode. With Supabase, tables are indexed on their lookup columns (see the migration).

## Not measured

Lighthouse scores, field Core Web Vitals, true INP, GPU utilisation, database query latency against a real Supabase project, and AI provider latency.
