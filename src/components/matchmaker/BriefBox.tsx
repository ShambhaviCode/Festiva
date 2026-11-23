"use client";

import { useState } from "react";
import { matchmakerInputSchema, type MatchmakerInput } from "@/domain/matchmaker/schema";

export interface BriefResult {
  input: MatchmakerInput;
  source: "sarvam" | "rules";
  model: string | null;
  language: string | null;
  english: string | null;
  understood: string[];
  fields: string[];
  notice: string;
}

const EXAMPLES = [
  { label: "English", text: "Diwali with six friends in Bengaluru. Our budget is ₹5,000, two days, vegetarian food, something memorable." },
  { label: "हिन्दी", text: "दिल्ली में परिवार के दस लोगों के साथ होली मनानी है, बजट ₹8,000 है, संगीत और खेल चाहिए।" },
  { label: "ಕನ್ನಡ", text: "ಮೈಸೂರಿನಲ್ಲಿ ಎಂಟು ಸ್ನೇಹಿತರೊಂದಿಗೆ ದಸರಾ ಆಚರಿಸಬೇಕು, ಬಜೆಟ್ ₹6,000." },
];

/** Describe a celebration in your own words (English or an Indian language) and get a full plan. */
export function BriefBox({ base, onPlan }: { base: MatchmakerInput; onPlan: (result: BriefResult) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (value: string) => {
    if (value.trim().length < 3) { setError("Tell FESTIVA a little about the celebration first."); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/matchmaker/brief", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: value, base }) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error ?? "The planner could not read that. Try again.");
      const input = matchmakerInputSchema.safeParse(data.input);
      if (!input.success) throw new Error("The planner returned something unexpected. Try the guided questions below.");
      onPlan({ ...data, input: input.data } as BriefResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="brief-title" className="relative overflow-hidden rounded-[2rem] bg-plum-deep p-6 text-ivory sm:p-8" data-testid="brief-box">
      <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-pink/40 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-saffron/30 blur-3xl" />
      <div className="relative">
        <p className="eyebrow !text-marigold">Fastest way · powered by Sarvam AI</p>
        <h2 id="brief-title" className="display-2 mt-2">Describe your celebration.</h2>
        <p className="mt-2 max-w-2xl text-ivory/80">Write it the way you would say it, in English, हिन्दी, ಕನ್ನಡ, தமிழ் or another Indian language. FESTIVA works out the occasion, people, place and budget, then builds a full plan you can edit.</p>
        <form onSubmit={(e) => { e.preventDefault(); void submit(text); }} className="mt-5">
          <label htmlFor="brief-text" className="sr-only">Describe your celebration</label>
          <textarea
            id="brief-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={600}
            dir="auto"
            placeholder="I want to celebrate Diwali with six friends in Bengaluru. Our budget is ₹5,000 and we have two days."
            className="w-full resize-y rounded-2xl border border-ivory/15 bg-ivory/95 p-4 text-lg text-charcoal outline-none placeholder:text-ink/60 focus:ring-4 focus:ring-saffron/50"
            data-testid="brief-text"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="submit" disabled={busy} className="btn btn-saffron" data-testid="brief-submit">
              {busy ? "Reading your plan…" : "Plan it for me"}
            </button>
            <span className="note !text-ivory/70">Try:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex.label} type="button" disabled={busy} onClick={() => { setText(ex.text); void submit(ex.text); }} className="rounded-full bg-ivory/10 px-3 py-1.5 text-sm font-semibold text-ivory ring-1 ring-ivory/20 transition-colors hover:bg-marigold hover:text-plum-deep">
                {ex.label}
              </button>
            ))}
          </div>
        </form>
        {error && <p role="alert" className="mt-3 font-semibold text-marigold">{error}</p>}
      </div>
    </section>
  );
}

/** Shown above a plan that came from a brief: who read it, and what was understood. */
export function BriefBanner({ result, onDismiss }: { result: BriefResult; onDismiss: () => void }) {
  return (
    <div className="mb-6 rounded-[1.5rem] border border-jade/40 bg-jade/10 p-5" data-testid="brief-banner" role="status">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-emerald-deep">
            {result.source === "sarvam" ? `Read by Sarvam AI${result.model ? ` (${result.model})` : ""}` : "Read by FESTIVA's rules"}
            {result.language ? ` · heard ${result.language}` : ""}
          </p>
          {result.english && <p className="mt-1 text-ink">&ldquo;{result.english}&rdquo;</p>}
          <p className="note mt-1">{result.notice}</p>
        </div>
        <button type="button" className="note font-semibold underline" onClick={onDismiss}>Hide</button>
      </div>
      {result.understood.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {result.understood.map((u) => <li key={u} className="pill-tag bg-ivory text-plum-deep ring-1 ring-jade/30">{u}</li>)}
        </ul>
      )}
    </div>
  );
}
