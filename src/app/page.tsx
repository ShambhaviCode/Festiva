import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";
import { UpcomingRail, type RailPhoto } from "@/components/home/UpcomingRail";
import { Rosette } from "@/components/Logo";
import { WorldMap } from "@/components/WorldMap";
import { CATEGORY_LABELS, festivalBySlug, festivalCountryCount, festivals } from "@/data/festivals";
import { indiaDivisions, linksForDivision } from "@/data/geo-india";
import { ATTIRE_PHOTOS, DISH_PHOTOS, FESTIVAL_PHOTOS, PLACE_PHOTOS, type Photo } from "@/data/photos";
import { imageFor } from "@/data/photo-fallbacks";
import { BUDGET_LABELS } from "@/domain/budget";
import { formatMoney } from "@/domain/currency";
import { generatePlan } from "@/domain/matchmaker/engine";
import { DEFAULT_INPUT } from "@/domain/matchmaker/schema";
import { mapCountries, mapFestivals, mapIndia } from "@/lib/map-data";
import { datedFestivals, SAMPLE_NOW } from "@/lib/view";

const HERO = [
  { slug: "diwali", area: "[grid-area:a]" },
  { slug: "holi", area: "[grid-area:b]" },
  { slug: "lunar-new-year", area: "[grid-area:c]" },
  { slug: "rio-carnival", area: "[grid-area:d]" },
  { slug: "loy-krathong", area: "[grid-area:e]" },
];
const INDIA_FEATURED = [
  { region: "IN-KL", slug: "onam" },
  { region: "IN-WB", slug: "durga-puja" },
  { region: "IN-AS", slug: "bihu" },
  { region: "IN-OR", slug: "rath-yatra" },
  { region: "IN-MH", slug: "ganesh-chaturthi" },
  { region: "IN-TN", slug: "pongal" },
  { region: "IN-KA", slug: "dussehra" },
  { region: "IN-GJ", slug: "navratri" },
];
const TICKER = ["Diwali", "Lunar New Year", "Día de Muertos", "Holi", "Carnival", "Songkran", "Onam", "Nowruz", "Hanami", "Durga Puja", "Loy Krathong", "Inti Raymi", "Bihu", "Timkat", "Midsummer", "Matariki", "Hornbill", "Eid al-Fitr", "Christmas", "Vesak"];
const TICKER_DOTS = ["#ff9f1c", "#e5157a", "#19c39a", "#12b5c4", "#ffc23d", "#ff6b4a"];

function Credit({ photo }: { photo: Photo }) {
  return (
    <>
      <a href={photo.source} className="underline decoration-charcoal/30 underline-offset-2 hover:decoration-charcoal" rel="noopener" target="_blank">{photo.artist}</a>
      {", "}
      {photo.licenseUrl ? <a href={photo.licenseUrl} className="underline decoration-charcoal/30 underline-offset-2" rel="noopener license" target="_blank">{photo.license}</a> : photo.license}
    </>
  );
}

export default function HomePage() {
  const sample = generatePlan({ ...DEFAULT_INPUT, dietary: ["vegetarian"] }, { id: "sample", now: SAMPLE_NOW });
  const schedule = (sample.sections.find((s) => s.key === "schedule")?.items ?? []).slice(0, 3);
  const budgetTop = [...sample.budget.lines].sort((a, b) => b.amountMinor - a.amountMinor).slice(0, 4);
  const budgetMax = Math.max(...budgetTop.map((l) => l.amountMinor), 1);
  const railItems = datedFestivals.map((d) => ({ ...d, category: CATEGORY_LABELS[festivalBySlug.get(d.slug)!.category] }));
  const railPhotos: Record<string, RailPhoto> = Object.fromEntries(festivals.flatMap((f) => { const p = imageFor("rosette", f.slug); return p ? [[f.slug, { src: p.src, width: p.width, height: p.height }]] : []; }));
  const india = indiaDivisions.map((d) => ({ ...d, n: new Set(linksForDivision(d.id).map((l) => l.festival)).size }));

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-marigold/35 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-pink/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-turquoise/20 blur-3xl" />
        <div className="shell relative grid items-center gap-10 pb-14 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pb-20 lg:pt-14">
          <div className="min-w-0">
            <p className="rise inline-flex items-center gap-2 rounded-full bg-plum-deep px-3.5 py-1.5 text-sm font-semibold text-ivory" style={{ "--i": 0 } as React.CSSProperties}>
              <Rosette size={18} /> {festivals.length} festivals · {festivalCountryCount} countries
            </p>
            <h1 className="display-hero rise mt-6" style={{ "--i": 1 } as React.CSSProperties}>
              Discover the world.{" "}
              <span className="block bg-[linear-gradient(95deg,var(--color-saffron),var(--color-pink)_55%,var(--color-plum))] bg-clip-text text-transparent">Celebrate every culture.</span>
            </h1>
            <p className="lede rise mt-6 max-w-xl text-ink" style={{ "--i": 2 } as React.CSSProperties}>
              The festivals, food, dress, music and stories that bring the world together, on a real map, with an AI that answers from a sourced guide, and a planner that turns it all into your own celebration.
            </p>
            <div className="rise mt-8 max-w-xl" style={{ "--i": 3 } as React.CSSProperties}>
              <HeroSearch />
            </div>
            <div className="rise mt-7 flex flex-wrap items-center gap-3" style={{ "--i": 4 } as React.CSSProperties}>
              <Link href="/world" className="btn btn-plum">Explore the world map</Link>
              <Link href="/matchmaker" className="btn btn-saffron">Plan a celebration</Link>
            </div>
          </div>

          <div className="fade-in grid h-[26rem] grid-cols-6 grid-rows-6 gap-3 [grid-template-areas:'a_a_a_b_b_b''a_a_a_b_b_b''a_a_a_c_c_c''a_a_a_c_c_c''d_d_d_d_e_e''d_d_d_d_e_e'] sm:h-[32rem] lg:h-[36rem]">
            {HERO.map(({ slug, area }, i) => {
              const f = festivalBySlug.get(slug)!;
              const p = FESTIVAL_PHOTOS[slug];
              return (
                <Link key={slug} href={`/discover/${slug}`} className={`photo-zoom card-lift float-soft group relative overflow-hidden rounded-[1.75rem] bg-plum ${area}`} style={{ animationDelay: `${i * 0.7}s` }}>
                  {p && <Image src={p.src} alt={`${f.name}: ${p.title.replace(/\.(jpe?g|png)$/i, "").replace(/_/g, " ")}`} fill priority={i < 2} sizes="(min-width: 1024px) 26vw, 50vw" className="object-cover" />}
                  <span className="absolute bottom-3 left-3 rounded-full bg-ivory/95 px-3 py-1 text-sm font-bold text-plum-deep shadow">
                    {f.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <p className="shell note pb-4 text-[0.75rem]">
          Photos via Wikimedia Commons:{" "}
          {HERO.map(({ slug }, i) => FESTIVAL_PHOTOS[slug] && (
            <span key={slug}>{i > 0 && "; "}{festivalBySlug.get(slug)!.name} by <Credit photo={FESTIVAL_PHOTOS[slug]} /></span>
          ))}
          .
        </p>
      </section>

      {/* ---------------- Ticker ---------------- */}
      <div className="overflow-hidden bg-plum-deep py-4 text-ivory" aria-hidden="true">
        <div className="marquee flex w-max gap-8 whitespace-nowrap font-[family-name:var(--font-display)] text-2xl font-[750] tracking-[-0.03em]">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-8">
              {t}
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: TICKER_DOTS[i % TICKER_DOTS.length] }} />
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- Happening soon ---------------- */}
      <section className="shell py-16 lg:py-20" aria-labelledby="home-soon">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Happening soon</p>
            <h2 id="home-soon" className="display-1 mt-2">Next on the world&rsquo;s calendar</h2>
          </div>
          <Link href="/discover/calendar" className="btn btn-line btn-sm">Open the full calendar</Link>
        </div>
        <UpcomingRail items={railItems} photos={railPhotos} />
      </section>

      {/* ---------------- World ---------------- */}
      <section className="bg-[linear-gradient(180deg,var(--color-ivory),#e6f7f6)] py-16 lg:py-20" aria-labelledby="home-world">
        <div className="shell grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal">
            <p className="eyebrow">A real map, not a picture</p>
            <h2 id="home-world" className="display-1 mt-2">Spin the world. <span className="mark">Land anywhere.</span></h2>
            <p className="mt-4 text-lg text-ink">
              Every country on Natural Earth&rsquo;s boundaries, coloured by how many festivals the guide holds there. Open a country to see its festivals; open India to go state by state.
            </p>
            <ul className="mt-5 grid gap-2 text-ink">
              <li className="flex gap-2"><span className="text-jade">●</span> {festivalCountryCount} countries, from Japan to Jamaica</li>
              <li className="flex gap-2"><span className="text-pink">●</span> India&rsquo;s 28 states and 8 union territories</li>
              <li className="flex gap-2"><span className="text-saffron">●</span> Shareable links to any country or state</li>
            </ul>
            <Link href="/world" className="btn btn-plum mt-7">Open the world map</Link>
          </div>
          <div className="reveal">
            <WorldMap festivals={mapFestivals()} countries={mapCountries()} india={mapIndia()} compact />
          </div>
        </div>
      </section>

      {/* ---------------- India ---------------- */}
      <section className="shell py-16 lg:py-24" aria-labelledby="home-india">
        <div className="max-w-3xl">
          <p className="eyebrow">India, state by state</p>
          <h2 id="home-india" className="display-1 mt-2">One country. <span className="mark">Thirty-six</span> ways to celebrate.</h2>
          <p className="mt-4 text-lg text-ink">Onam in Kerala is not Durga Puja in Kolkata, and Bihu in Assam is not Pongal in Madurai. FESTIVA links each festival to the states its sourced record names, no more.</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {INDIA_FEATURED.map(({ region, slug }, i) => {
            const f = festivalBySlug.get(slug)!;
            const p = FESTIVAL_PHOTOS[slug];
            const d = indiaDivisions.find((x) => x.id === region)!;
            return (
              <li key={region} className={`reveal ${i === 0 || i === 5 ? "lg:col-span-2" : ""}`}>
                <Link href={`/world?country=IN&region=${region}`} className="photo-zoom card-lift group relative block aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-plum">
                  {p && <Image src={p.src} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-deep/90 via-plum-deep/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-ivory">
                    <p className="text-sm font-semibold text-marigold">{f.name}</p>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-[750] leading-none tracking-[-0.03em] sm:text-3xl">{d.name}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex flex-wrap gap-2">
          {india.map((d) => (
            <Link key={d.id} href={`/world?country=IN&region=${d.id}`} className={`chip text-sm ${d.n ? "border-jade bg-jade/10 font-semibold" : ""}`}>
              {d.name}{d.n ? ` · ${d.n}` : ""}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Planner ---------------- */}
      <section className="relative overflow-hidden bg-pink text-white" aria-labelledby="home-plan">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-plum/40 blur-3xl" />
        <div className="shell relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="reveal">
            <p className="eyebrow !text-white">The celebration planner</p>
            <h2 id="home-plan" className="display-1 mt-2">A whole celebration, planned in a minute.</h2>
            <p className="mt-4 max-w-lg text-lg text-white">Six quick questions. Out comes a schedule, food for every diet, gifts, dress, décor, music and greetings. Edit any line. The budget always adds up, because the arithmetic runs in code, never in an AI model.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/matchmaker" className="btn bg-white text-pink hover:bg-marigold hover:text-plum-deep">Plan a celebration</Link>
              <Link href="/intelligence" className="btn btn-line">Ask FESTIVA AI</Link>
            </div>
          </div>
          <div className="reveal rounded-[2rem] bg-ivory p-6 text-charcoal shadow-[0_40px_80px_-40px_rgba(23,8,51,0.6)] sm:p-8">
            <p className="eyebrow">Sample plan</p>
            <h3 className="mt-2 text-3xl leading-tight">{sample.title}</h3>
            <ol className="mt-5 grid gap-3">
              {schedule.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="pill-tag h-fit shrink-0 bg-plum-deep text-ivory">{item.time ?? "•"}</span>
                  <span className="font-semibold">{item.title}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 grid gap-2.5">
              {budgetTop.map((l, i) => (
                <div key={l.category}>
                  <div className="flex justify-between text-sm font-semibold"><span>{BUDGET_LABELS[l.category]}</span><span>{formatMoney(l.amountMinor, sample.budget.currency)}</span></div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-cream">
                    <div className="meter-grow h-full rounded-full" style={{ width: `${(l.amountMinor / budgetMax) * 100}%`, background: ["#ff9f1c", "#e5157a", "#12b5c4", "#19c39a"][i] }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="note mt-4">Total {formatMoney(sample.budget.totalMinor, sample.budget.currency)} · worked out by FESTIVA&rsquo;s code</p>
          </div>
        </div>
      </section>

      {/* ---------------- Culture ---------------- */}
      <section className="shell py-16 lg:py-24" aria-labelledby="home-culture">
        <p className="eyebrow">Culture</p>
        <h2 id="home-culture" className="display-1 mt-2">Taste it. Wear it. <span className="mark">Hear it.</span></h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { href: "/taste", title: "Taste", text: "Festival dishes and sweets, with vegetarian, vegan and allergen notes.", photo: DISH_PHOTOS["onam-sadya"] ?? DISH_PHOTOS["modak"], tint: "from-coral/90" },
            { href: "/wear", title: "Wear", text: "Saris, hanbok, kimono and more, with the craft behind them.", photo: ATTIRE_PHOTOS["kasavu"] ?? ATTIRE_PHOTOS["sari"], tint: "from-pink/90" },
            { href: "/journeys", title: "Journeys", text: "Cities and heritage sites where festivals come alive.", photo: PLACE_PHOTOS["varanasi"] ?? PLACE_PHOTOS["jaipur"], tint: "from-turquoise/90" },
          ].map((t) => (
            <Link key={t.href} href={t.href} className="reveal photo-zoom card-lift group relative block aspect-[4/5] overflow-hidden rounded-[2rem] bg-plum">
              {t.photo && <Image src={t.photo.src} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />}
              <div className={`absolute inset-0 bg-gradient-to-t ${t.tint} via-transparent to-transparent`} />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="font-[family-name:var(--font-display)] text-5xl font-[800] tracking-[-0.045em]">{t.title}</p>
                <p className="mt-2 max-w-xs font-medium">{t.text}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { href: "/sound", title: "Sound", text: "Sixteen genres, from Bollywood to Afrobeats", bg: "bg-turquoise" },
            { href: "/wishes", title: "Wishes", text: "Design a greeting card in a minute", bg: "bg-marigold" },
            { href: "/play", title: "Play", text: "Five games built from real culture", bg: "bg-jade" },
          ].map((t) => (
            <Link key={t.href} href={t.href} className={`reveal card-lift flex items-center justify-between gap-4 rounded-[1.75rem] ${t.bg} p-6 text-plum-deep`}>
              <span>
                <span className="block font-[family-name:var(--font-display)] text-3xl font-[800] tracking-[-0.04em]">{t.title}</span>
                <span className="mt-1 block font-medium">{t.text}</span>
              </span>
              <span aria-hidden="true" className="text-3xl">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Sponsors ---------------- */}
      <section className="on-dark bg-plum-deep py-16 text-ivory lg:py-24" aria-labelledby="home-built">
        <div className="shell">
          <p className="eyebrow">Built with</p>
          <h2 id="home-built" className="display-1 mt-2 max-w-3xl">Real integrations, doing real work.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { name: "Sarvam AI", color: "text-marigold", text: "FESTIVA Intelligence answers on Sarvam's chat model, grounded in the guide. In Gift Circle, Sarvam turns spoken wishes in Indian languages into text and translates them for the organiser.", href: "/intelligence", cta: "Ask FESTIVA" },
              { name: "Flagsmith", color: "text-turquoise", text: "Server-enforced feature flags switch Gift Circle, voice capture and AI structuring on and off live, without a redeploy. The Gift Circle link in the menu follows its flag.", href: "/circles", cta: "Open Gift Circle" },
              { name: "NudgeBee", color: "text-jade", text: "When an integration starts failing, FESTIVA raises an alert to NudgeBee and proposes a reversible fix, which runs only after a human approves it.", href: "https://github.com/ShambhaviCode/Festiva/blob/main/docs/SPONSORS.md", cta: "How it works" },
            ].map((s) => (
              <div key={s.name} className="reveal flex flex-col rounded-[1.75rem] border border-ivory/15 bg-ivory/5 p-6">
                <p className={`font-[family-name:var(--font-display)] text-3xl font-[800] tracking-[-0.04em] ${s.color}`}>{s.name}</p>
                <p className="mt-3 flex-1 text-ivory/85">{s.text}</p>
                <Link href={s.href} className="link mt-5 font-semibold text-marigold">{s.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
