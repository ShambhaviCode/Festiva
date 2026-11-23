/** Greeting composition for the Wishes studio. All templates are original to FESTIVA. */

export const WISH_LANGUAGES = ["English", "Hindi", "Spanish", "French"] as const;
export type WishLanguage = (typeof WISH_LANGUAGES)[number];

export const WISH_TONES = ["warm", "formal", "playful"] as const;
export type WishTone = (typeof WISH_TONES)[number];

export const TONE_LABELS: Record<WishTone, string> = { warm: "Warm", formal: "Formal", playful: "Playful" };

const TEMPLATES: Record<WishLanguage, Record<WishTone, string>> = {
  English: {
    warm: "Dear {name}, wishing you a {festival} filled with light, good food and the people you love.",
    formal: "Dear {name}, with warm regards and best wishes to you and your family on the occasion of {festival}.",
    playful: "{name}! Happy {festival}! May the sweets be plenty and the washing-up be someone else's.",
  },
  Hindi: {
    warm: "प्रिय {name}, {festival} की हार्दिक शुभकामनाएँ। आपका घर खुशियों और रोशनी से भरा रहे।",
    formal: "आदरणीय {name}, {festival} के शुभ अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ।",
    playful: "{name}! {festival} मुबारक! मिठाइयाँ खूब हों और मस्ती उससे भी ज़्यादा।",
  },
  Spanish: {
    warm: "Para {name}: que {festival} te traiga luz, buena mesa y la compañía de quienes más quieres.",
    formal: "Para {name}: reciba mis mejores deseos para usted y su familia con motivo de {festival}.",
    playful: "¡{name}! ¡Feliz {festival}! Que sobren los dulces y falten las preocupaciones.",
  },
  French: {
    warm: "Pour {name} : que {festival} t'apporte lumière, bons plats et la présence de ceux que tu aimes.",
    formal: "Pour {name} : je vous adresse, ainsi qu'à votre famille, mes meilleurs vœux à l'occasion de {festival}.",
    playful: "{name} ! Belle fête de {festival} ! Que les douceurs soient nombreuses et les soucis bien rares.",
  },
};

const FALLBACK_NAME: Record<WishLanguage, string> = { English: "friend", Hindi: "मित्र", Spanish: "amistad", French: "ami" };

export interface WishInput {
  festival: string;
  recipient: string;
  language: WishLanguage;
  tone: WishTone;
}

export function composeWish(input: WishInput): string {
  const name = input.recipient.trim() || FALLBACK_NAME[input.language];
  return TEMPLATES[input.language][input.tone].replaceAll("{name}", name).replaceAll("{festival}", input.festival.trim() || "the celebration");
}

export const CARD_LAYOUTS = ["arch", "mandala", "border", "plain"] as const;
export type CardLayout = (typeof CARD_LAYOUTS)[number];
export const LAYOUT_LABELS: Record<CardLayout, string> = { arch: "Doorway", mandala: "Rosette", border: "Frame", plain: "Plain" };

export const CARD_FONTS = [
  { id: "display", label: "Bricolage Grotesque", css: '"Bricolage Grotesque Variable", "Arial Black", sans-serif' },
  { id: "sans", label: "Instrument Sans", css: '"Instrument Sans Variable", system-ui, sans-serif' },
  { id: "serif", label: "Classic serif", css: 'Georgia, "Times New Roman", serif' },
] as const;
export type CardFontId = (typeof CARD_FONTS)[number]["id"];

export const CARD_PALETTES = [
  { id: "plum", label: "Plum and gold", bg: "#33143a", ink: "#fbf6ea", accent: "#f0a030" },
  { id: "ivory", label: "Ivory and saffron", bg: "#fbf6ea", ink: "#241f27", accent: "#9a5005" },
  { id: "emerald", label: "Emerald and cream", bg: "#0e5a48", ink: "#fbf6ea", accent: "#dcc898" },
  { id: "vermilion", label: "Vermilion and ivory", bg: "#b93626", ink: "#fbf6ea", accent: "#dcc898" },
  { id: "night", label: "Night blue and gold", bg: "#152046", ink: "#fbf6ea", accent: "#dca92b" },
] as const;
export type CardPaletteId = (typeof CARD_PALETTES)[number]["id"];

/** Break text into lines that fit `maxWidth`, using a caller-supplied measuring function (canvas or test stub). */
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (measure(next) <= maxWidth || !line) line = next;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}
