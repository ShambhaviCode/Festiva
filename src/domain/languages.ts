/**
 * Provider-independent language registry.
 *
 * Each language records what FESTIVA can actually do with it, per provider and
 * model, so the interface never advertises a capability that does not exist.
 * Sarvam coverage is taken from Sarvam's API reference (checked 17 November 2026):
 *   - Speech to text, `saaras:v4` (also `saaras:v3`): 22 Indian languages + Indian English.
 *   - Text translation, `sarvam-translate:v1`: the same 23 codes, formal mode only, 2,000 characters.
 * Sarvam uses `od-IN` for Odia where BCP 47 uses `or-IN`; `providerCode` keeps that mapping.
 *
 * Languages outside Sarvam's coverage are listed for text input only. FESTIVA
 * stores and displays them faithfully but offers no speech or translation for them.
 */

export type InputMethod = "text" | "voice";
export type Direction = "ltr" | "rtl" | "auto";
export type Availability = "available" | "text-only";

export interface ProviderCapability {
  provider: "sarvam";
  /** The code the provider's API expects. */
  providerCode: string;
  speechToText?: { models: string[] };
  translation?: { models: string[]; maxChars: number };
  speechSynthesis?: { models: string[] };
}

export interface Language {
  /** BCP 47 tag used everywhere inside FESTIVA. */
  tag: string;
  name: string;
  nativeName: string;
  script: string;
  direction: Direction;
  inputMethods: InputMethod[];
  providers: ProviderCapability[];
  availability: Availability;
  note?: string;
}

const STT_MODELS = ["saaras:v4", "saaras:v3"];
const TRANSLATE = { models: ["sarvam-translate:v1"], maxChars: 2000 };

function sarvam(tag: string, name: string, nativeName: string, script: string, direction: Direction = "ltr", providerCode = tag, note?: string): Language {
  return {
    tag,
    name,
    nativeName,
    script,
    direction,
    inputMethods: ["text", "voice"],
    providers: [{ provider: "sarvam", providerCode, speechToText: { models: STT_MODELS }, translation: TRANSLATE }],
    availability: "available",
    note,
  };
}

function textOnly(tag: string, name: string, nativeName: string, script: string, direction: Direction = "ltr"): Language {
  return {
    tag,
    name,
    nativeName,
    script,
    direction,
    inputMethods: ["text"],
    providers: [],
    availability: "text-only",
    note: "Typed text is stored as written. Speech input and translation are not available for this language.",
  };
}

export const LANGUAGES: Language[] = [
  sarvam("en-IN", "English (India)", "English", "Latin"),
  sarvam("hi-IN", "Hindi", "हिन्दी", "Devanagari"),
  sarvam("bn-IN", "Bengali", "বাংলা", "Bengali"),
  sarvam("kn-IN", "Kannada", "ಕನ್ನಡ", "Kannada"),
  sarvam("ta-IN", "Tamil", "தமிழ்", "Tamil"),
  sarvam("te-IN", "Telugu", "తెలుగు", "Telugu"),
  sarvam("ml-IN", "Malayalam", "മലയാളം", "Malayalam"),
  sarvam("mr-IN", "Marathi", "मराठी", "Devanagari"),
  sarvam("gu-IN", "Gujarati", "ગુજરાતી", "Gujarati"),
  sarvam("pa-IN", "Punjabi", "ਪੰਜਾਬੀ", "Gurmukhi"),
  sarvam("or-IN", "Odia", "ଓଡ଼ିଆ", "Odia", "ltr", "od-IN"),
  sarvam("as-IN", "Assamese", "অসমীয়া", "Bengali–Assamese"),
  sarvam("ur-IN", "Urdu", "اردو", "Perso-Arabic", "rtl"),
  sarvam("ne-IN", "Nepali", "नेपाली", "Devanagari"),
  sarvam("kok-IN", "Konkani", "कोंकणी", "Devanagari"),
  sarvam("ks-IN", "Kashmiri", "كٲشُر", "Perso-Arabic", "rtl", "ks-IN", "Kashmiri is also written in Devanagari; text direction follows what is typed."),
  sarvam("sd-IN", "Sindhi", "سنڌي", "Perso-Arabic or Devanagari", "auto", "sd-IN", "Sindhi is written in two scripts in India; text direction follows what is typed."),
  sarvam("sa-IN", "Sanskrit", "संस्कृतम्", "Devanagari"),
  sarvam("sat-IN", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ", "Ol Chiki"),
  sarvam("mni-IN", "Manipuri", "ꯃꯤꯇꯩꯂꯣꯟ", "Meetei Mayek", "ltr", "mni-IN", "Manipuri is also written in Bengali script."),
  sarvam("brx-IN", "Bodo", "बड़ो", "Devanagari"),
  sarvam("mai-IN", "Maithili", "मैथिली", "Devanagari"),
  sarvam("doi-IN", "Dogri", "डोगरी", "Devanagari"),
  textOnly("es-ES", "Spanish", "Español", "Latin"),
  textOnly("fr-FR", "French", "Français", "Latin"),
  textOnly("ar", "Arabic", "العربية", "Arabic", "rtl"),
  textOnly("ja-JP", "Japanese", "日本語", "Kanji and kana"),
];

export const LANGUAGE_TAGS = LANGUAGES.map((l) => l.tag) as [string, ...string[]];
export const languageByTag = new Map(LANGUAGES.map((l) => [l.tag, l]));
export const DEFAULT_LANGUAGE = "en-IN";

const sarvamCap = (tag: string) => languageByTag.get(tag)?.providers.find((p) => p.provider === "sarvam");

export function supportsSpeech(tag: string): boolean {
  return Boolean(sarvamCap(tag)?.speechToText);
}

export function supportsTranslation(from: string, to: string): boolean {
  return from !== to && Boolean(sarvamCap(from)?.translation && sarvamCap(to)?.translation);
}

/** The code Sarvam expects for a FESTIVA language tag, or null if Sarvam does not support it. */
export function toSarvamCode(tag: string): string | null {
  return sarvamCap(tag)?.providerCode ?? null;
}

/** Map a code returned by Sarvam (for example `od-IN`) back to the FESTIVA tag. */
export function fromSarvamCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const match = LANGUAGES.find((l) => l.providers.some((p) => p.provider === "sarvam" && p.providerCode === code));
  return match?.tag ?? null;
}

export function languageLabel(tag: string): string {
  const language = languageByTag.get(tag);
  if (!language) return tag;
  return language.name === language.nativeName ? language.name : `${language.nativeName} (${language.name})`;
}

export function directionOf(tag: string): "ltr" | "rtl" | "auto" {
  return languageByTag.get(tag)?.direction ?? "auto";
}
