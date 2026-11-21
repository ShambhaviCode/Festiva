/** Supported display currencies. FESTIVA never converts between them: no exchange rates are invented. */
export const CURRENCIES = [
  { code: "INR", name: "Indian rupee", digits: 2 },
  { code: "USD", name: "US dollar", digits: 2 },
  { code: "EUR", name: "Euro", digits: 2 },
  { code: "GBP", name: "Pound sterling", digits: 2 },
  { code: "AED", name: "UAE dirham", digits: 2 },
  { code: "SGD", name: "Singapore dollar", digits: 2 },
  { code: "AUD", name: "Australian dollar", digits: 2 },
  { code: "CAD", name: "Canadian dollar", digits: 2 },
  { code: "JPY", name: "Japanese yen", digits: 0 },
  { code: "CNY", name: "Chinese yuan", digits: 2 },
  { code: "KRW", name: "South Korean won", digits: 0 },
  { code: "THB", name: "Thai baht", digits: 2 },
  { code: "BRL", name: "Brazilian real", digits: 2 },
  { code: "MXN", name: "Mexican peso", digits: 2 },
  { code: "ZAR", name: "South African rand", digits: 2 },
  { code: "NGN", name: "Nigerian naira", digits: 2 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [CurrencyCode, ...CurrencyCode[]];

export function currencyDigits(code: string): number {
  return CURRENCIES.find((c) => c.code === code)?.digits ?? 2;
}

/** Convert a major-unit amount (e.g. 1250.5) into integer minor units (e.g. 125050). */
export function toMinor(amount: number, code: string): number {
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError("Amount must be a non-negative number");
  return Math.round(amount * 10 ** currencyDigits(code));
}

export function fromMinor(minor: number, code: string): number {
  return minor / 10 ** currencyDigits(code);
}

export function formatMoney(minor: number, code: string, locale = "en"): string {
  const digits = currencyDigits(code);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(fromMinor(minor, code));
}

export const LOCALES = [
  { code: "en-IN", label: "English (India)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "en-US", label: "English (United States)" },
  { code: "hi-IN", label: "हिन्दी (भारत)" },
  { code: "es-ES", label: "Español (España)" },
  { code: "fr-FR", label: "Français (France)" },
  { code: "de-DE", label: "Deutsch (Deutschland)" },
  { code: "ja-JP", label: "日本語 (日本)" },
  { code: "ar-AE", label: "العربية (الإمارات)" },
  { code: "pt-BR", label: "Português (Brasil)" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];
