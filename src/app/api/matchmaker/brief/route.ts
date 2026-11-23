import { z } from "zod";
import { countries } from "@/data/countries";
import { destinations } from "@/data/destinations";
import { festivals } from "@/data/festivals";
import { GENERIC_OCCASIONS } from "@/data/matchmaker";
import { CURRENCY_CODES, type CurrencyCode } from "@/domain/currency";
import { cleanPatch, describePatch, mergeBrief, parseBrief, type BriefCatalog, type BriefPatch } from "@/domain/matchmaker/brief";
import { DEFAULT_INPUT, matchmakerInputSchema } from "@/domain/matchmaker/schema";
import { json, readJson } from "@/lib/http";
import { getSarvam, SarvamError } from "@/lib/integrations/sarvam";
import { getControls } from "@/lib/ops/controls";
import { recordProcessing } from "@/lib/ops/metrics";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  text: z.string().trim().min(3).max(600),
  /** The answers already on screen; the brief only changes what it mentions. */
  base: matchmakerInputSchema.optional(),
});

/** Well-known Indian cities (and their older names) that are not in the destinations list. */
const INDIAN_CITIES = ["bengaluru", "bangalore", "mysuru", "mysore", "chennai", "hyderabad", "pune", "ahmedabad", "lucknow", "chandigarh", "bhopal", "indore", "surat", "nagpur", "patna", "guwahati", "bhubaneswar", "thiruvananthapuram", "kozhikode", "mangaluru", "goa", "delhi", "new delhi", "gurugram", "noida", "mumbai", "kolkata", "kochi", "jaipur", "varanasi", "amritsar", "udaipur"];

function catalog(): BriefCatalog {
  const cities: Record<string, string> = {};
  for (const d of destinations) if (d.kind === "city") cities[d.name.toLowerCase()] = d.country;
  for (const c of INDIAN_CITIES) cities[c] = "IN";
  return {
    occasions: [
      ...festivals.map((f) => ({ id: f.slug, names: [f.name, ...(f.localName ? [f.localName] : []), f.slug.replace(/-/g, " ")] })),
      ...GENERIC_OCCASIONS.map((o) => ({ id: o.id, names: [o.id, o.label] })),
    ],
    countries: countries.map((c) => ({ code: c.code, name: c.name })),
    cities,
  };
}

/** A country's own currency, when the brief names a place but no currency. */
function currencyFor(code: string | undefined): CurrencyCode | undefined {
  const cur = countries.find((c) => c.code === code)?.currency;
  return cur && (CURRENCY_CODES as readonly string[]).includes(cur) ? (cur as CurrencyCode) : undefined;
}

/**
 * POST /api/matchmaker/brief: turn a celebration described in plain words into Matchmaker answers.
 * Sarvam AI reads it (in English or an Indian language) unless AI structuring has been paused by an
 * approved operations runbook; FESTIVA's rules always read it too. Every value is validated, and the
 * plan itself, including all budget arithmetic, is built by FESTIVA's deterministic engine.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "matchmaker-brief"), 20, 5 * 60_000);
  if (!limit.ok) return json({ error: "Too many requests. Try again in a moment." }, 429, { "retry-after": String(limit.retryAfterSeconds) });
  const body = await readJson(request, bodySchema, 8_000);
  if ("response" in body) return body.response;
  const { text, base = DEFAULT_INPUT } = body.data;

  const cat = catalog();
  const rules = parseBrief(text, cat);
  const sarvam = getSarvam();
  const paused = (await getControls()).aiStructuringPaused;
  let ai: BriefPatch | null = null;
  let language: string | null = null;
  let english: string | null = null;
  let notice: string;

  if (sarvam && !paused) {
    try {
      const raw = await sarvam.readCelebrationBrief(text, cat.occasions.map((o) => o.id));
      ai = cleanPatch(raw, new Set(cat.occasions.map((o) => o.id)));
      language = raw.language || null;
      english = raw.english || null;
      recordProcessing({ job: "matchmaker_brief", ok: true, code: "sarvam" });
      notice = "Understood by Sarvam AI. FESTIVA built the plan and did the budget arithmetic.";
    } catch (error) {
      recordProcessing({ job: "matchmaker_brief", ok: false, code: error instanceof SarvamError ? error.code : "unexpected" });
      notice = "Sarvam AI could not read this just now, so FESTIVA's rules read it. They understand English best.";
    }
  } else {
    recordProcessing({ job: "matchmaker_brief", ok: true, code: paused ? "rules_paused" : "rules" });
    notice = paused
      ? "AI reading is paused by an administrator (an approved operations runbook), so FESTIVA's rules read this. They understand English best."
      : "Sarvam AI is not configured here, so FESTIVA's rules read this. They understand English best.";
  }

  // Rules fill in anything the model left out; the model wins where both found a valid value.
  const patch: BriefPatch = { ...rules.patch, ...(ai ?? {}) };
  if (!patch.currency && patch.countryCode) {
    const cur = currencyFor(patch.countryCode);
    if (cur) patch.currency = cur;
  }
  const input = mergeBrief(base, patch);
  const found = Object.keys(patch).length;
  return json({
    input,
    source: ai ? "sarvam" : "rules",
    model: ai ? sarvam?.models.chat ?? null : null,
    language,
    english,
    understood: describePatch(patch, (id) => cat.occasions.find((o) => o.id === id)?.names[0]),
    fields: Object.keys(patch),
    notice: found === 0 ? "Nothing in this could be matched to the planner's questions. Try naming the festival, the people and a budget." : notice,
  });
}
