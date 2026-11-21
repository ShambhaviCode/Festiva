import type { DateRule } from "@/domain/types";

/**
 * Names in the original languages and scripts, symbols, and the calendar each
 * festival follows. Written from general reference knowledge (the same
 * "reference" standard as the rest of the festival text): useful orientation,
 * not expert-reviewed scholarship. See docs/CONTENT_REVIEW.md.
 */

export interface OriginalName {
  name: string;
  /** Language name in English, for display. */
  language: string;
  /** BCP 47 tag, so screen readers and fonts treat the text correctly. */
  lang: string;
  romanized?: string;
}

export interface FestivalSymbol {
  symbol: string;
  meaning: string;
}

export interface FestivalCulture {
  originalNames: OriginalName[];
  /** Shown when a festival has no single original-language name. */
  namesNote?: string;
  symbolism: FestivalSymbol[];
  /** Overrides the calendar description derived from the date rule. */
  calendarSystem?: string;
}

const n = (name: string, language: string, lang: string, romanized?: string): OriginalName => ({ name, language, lang, romanized });
const s = (symbol: string, meaning: string): FestivalSymbol => ({ symbol, meaning });

export const FESTIVAL_CULTURE: Record<string, FestivalCulture> = {
  diwali: {
    originalNames: [n("दीपावली", "Hindi and Sanskrit", "hi", "Dīpāvalī"), n("தீபாவளி", "Tamil", "ta", "Tīpāvaḷi")],
    symbolism: [s("Diya (oil lamp)", "Light overcoming darkness, and welcome to the home"), s("Rangoli", "A decorated threshold that welcomes guests and good fortune"), s("Lakshmi", "Prosperity and well-being, honoured in many homes on the main night")],
  },
  holi: {
    originalNames: [n("होली", "Hindi", "hi", "Holī")],
    symbolism: [s("Coloured powder (gulal)", "Spring, play and the setting aside of social distance for a day"), s("Holika bonfire", "The victory of devotion and good over arrogance, from the story of Prahlad")],
  },
  "durga-puja": {
    originalNames: [n("দুর্গাপূজা", "Bengali", "bn", "Durgā Pūjā")],
    symbolism: [s("Durga slaying Mahishasura", "Righteous power overcoming destructive force"), s("Immersion (bisarjan)", "The goddess returning home; the cycle of arrival and parting")],
  },
  "ganesh-chaturthi": {
    originalNames: [n("गणेश चतुर्थी", "Marathi and Hindi", "mr", "Gaṇeśa Caturthī")],
    symbolism: [s("Ganesha", "Remover of obstacles, honoured at the start of new ventures"), s("Modak", "The sweet said to be Ganesha's favourite, offered to him")],
  },
  onam: {
    originalNames: [n("ഓണം", "Malayalam", "ml", "Ōṇaṁ")],
    symbolism: [s("Pookalam (flower carpet)", "Welcome for King Mahabali's yearly visit"), s("Onasadya feast", "Abundance and equality, shared by all")],
    calendarSystem: "Malayalam solar calendar (the month of Chingam)",
  },
  pongal: {
    originalNames: [n("பொங்கல்", "Tamil", "ta", "Poṅkal")],
    symbolism: [s("The pot boiling over", "Abundance; the festival's name means 'to boil over'"), s("Sugarcane and new rice", "The year's first harvest")],
  },
  "eid-al-fitr": {
    originalNames: [n("عيد الفطر", "Arabic", "ar", "ʿĪd al-Fiṭr")],
    symbolism: [s("The new crescent moon", "The end of Ramadan and the start of the month of Shawwal"), s("Zakat al-fitr (charity)", "Making sure everyone can share in the celebration")],
  },
  "eid-al-adha": {
    originalNames: [n("عيد الأضحى", "Arabic", "ar", "ʿĪd al-Aḍḥā")],
    symbolism: [s("The sacrifice", "Ibrahim's (Abraham's) willingness to obey God, and sharing meat with family, neighbours and those in need"), s("The Hajj", "The festival coincides with the pilgrimage to Mecca")],
  },
  "lunar-new-year": {
    originalNames: [n("春节", "Chinese", "zh", "Chūnjié"), n("Tết Nguyên Đán", "Vietnamese", "vi"), n("설날", "Korean", "ko", "Seollal")],
    symbolism: [s("Red", "Good fortune and protection"), s("Red envelopes", "Wishes for luck, usually given by elders to younger family"), s("The zodiac animal", "The character of the coming year in the twelve-year cycle")],
  },
  "mid-autumn-festival": {
    originalNames: [n("中秋节", "Chinese", "zh", "Zhōngqiū jié"), n("Tết Trung Thu", "Vietnamese", "vi")],
    symbolism: [s("The full moon", "Reunion and completeness"), s("Mooncakes", "Round like the moon; shared with family and friends")],
  },
  "dragon-boat-festival": {
    originalNames: [n("端午节", "Chinese", "zh", "Duānwǔ jié")],
    symbolism: [s("Dragon boats", "Remembered as the search for the poet Qu Yuan"), s("Zongzi", "Rice parcels said to have been thrown into the river for Qu Yuan")],
  },
  hanami: {
    originalNames: [n("花見", "Japanese", "ja", "hanami")],
    symbolism: [s("Cherry blossom (sakura)", "Beauty and the brevity of life")],
  },
  "gion-matsuri": {
    originalNames: [n("祇園祭", "Japanese", "ja", "Gion Matsuri")],
    symbolism: [s("Yamaboko floats", "Neighbourhood pride and centuries of craft"), s("Purification", "The festival began as a rite to calm epidemics")],
  },
  songkran: {
    originalNames: [n("สงกรานต์", "Thai", "th", "Songkran")],
    symbolism: [s("Water", "Cleansing and renewal for the new year"), s("Pouring water on elders' hands (rot nam dam hua)", "Respect and asking for blessings")],
    calendarSystem: "Thai solar new year, fixed on 13 to 15 April",
  },
  vesak: {
    originalNames: [n("වෙසක්", "Sinhala", "si", "Vesak"), n("วิสาขบูชา", "Thai", "th", "Wisakha Bucha")],
    symbolism: [s("Lanterns", "The light of the Buddha's teaching"), s("The full moon of Vesakha", "The birth, enlightenment and passing of the Buddha, remembered together")],
  },
  nowruz: {
    originalNames: [n("نوروز", "Persian", "fa", "Nowruz")],
    symbolism: [s("Haft-sin table", "Seven items beginning with 's', each a wish for the year"), s("Sabzeh (sprouted grain)", "Rebirth and growth")],
  },
  hanukkah: {
    originalNames: [n("חנוכה", "Hebrew", "he", "Ḥanukkah")],
    symbolism: [s("The menorah (hanukkiah)", "The rededication of the Temple and the oil that lasted eight days"), s("Foods fried in oil", "Remembering the oil")],
  },
  christmas: {
    originalNames: [],
    namesNote: "Christmas has a name in every language where it is kept, from Navidad to Noël to Weihnachten, rather than one original name.",
    symbolism: [s("The nativity", "The birth of Jesus"), s("Evergreen tree and lights", "Life and light in winter; a custom that spread from Germany")],
    calendarSystem: "Gregorian calendar (25 December); Orthodox churches that follow the Julian calendar keep it on 7 January",
  },
  "semana-santa": {
    originalNames: [n("Semana Santa", "Spanish", "es")],
    symbolism: [s("Pasos (processional floats)", "Scenes of the Passion carried through the streets"), s("Nazarenos' robes and hoods", "Penitence")],
  },
  "rio-carnival": {
    originalNames: [n("Carnaval", "Portuguese", "pt")],
    symbolism: [s("The samba school parade", "A community's year of work and its story for the year"), s("Masks and costume", "Licence to play before the restraint of Lent")],
  },
  "dia-de-muertos": {
    originalNames: [n("Día de Muertos", "Spanish", "es")],
    symbolism: [s("Ofrenda (altar)", "Welcome for the dead who return to visit"), s("Cempasúchil (marigold)", "Colour and scent said to guide the dead home"), s("Calaveras (skulls)", "Death treated with familiarity and humour")],
  },
  oktoberfest: {
    originalNames: [n("Oktoberfest", "German", "de"), n("d'Wiesn", "Bavarian", "bar")],
    symbolism: [s("Tracht (dirndl and lederhosen)", "Bavarian regional identity"), s("The mayor tapping the first keg", "The official opening: 'O'zapft is!'")],
  },
  "la-tomatina": {
    originalNames: [n("La Tomatina", "Spanish", "es")],
    symbolism: [s("Tomatoes", "Pure play: the festival has no religious meaning")],
  },
  "st-patricks-day": {
    originalNames: [n("Lá Fhéile Pádraig", "Irish", "ga")],
    symbolism: [s("Shamrock", "Said to have been used by Patrick to explain the Trinity; now a symbol of Ireland"), s("Green", "Ireland and Irish identity")],
  },
  timkat: {
    originalNames: [n("ጥምቀት", "Amharic", "am", "Ṭimqet")],
    symbolism: [s("Tabot", "A replica of the Ark of the Covenant, carried in procession"), s("Water blessing", "The baptism of Jesus in the Jordan")],
    calendarSystem: "Ethiopian calendar (11 Ter), shown here in Gregorian dates",
  },
  "inti-raymi": {
    originalNames: [n("Inti Raymi", "Quechua", "qu")],
    symbolism: [s("Inti, the sun", "The source of life; the festival marks the winter solstice in the southern hemisphere")],
    calendarSystem: "Fixed on 24 June, near the southern winter solstice",
  },
  thanksgiving: {
    originalNames: [],
    namesNote: "An English-language holiday; Canada's Thanksgiving is in October.",
    symbolism: [s("The shared table", "Gratitude and family"), s("Turkey and harvest foods", "Autumn plenty")],
  },
  midsummer: {
    originalNames: [n("Midsommar", "Swedish", "sv")],
    symbolism: [s("The maypole (midsommarstång)", "Summer and fertility"), s("Flower crowns", "The season's flowers; seven kinds under the pillow, by custom, for dreams of a future spouse")],
  },
  naadam: {
    originalNames: [n("Наадам", "Mongolian", "mn", "Naadam")],
    symbolism: [s("The three games of men", "Wrestling, horse racing and archery, Mongolia's traditional skills")],
  },
  kwanzaa: {
    originalNames: [],
    namesNote: "Created in 1966 by Maulana Karenga; the name comes from the Swahili 'matunda ya kwanza', first fruits.",
    symbolism: [s("Kinara", "Seven candles for the seven principles (Nguzo Saba)"), s("Mazao (crops)", "Harvest and the rewards of shared work")],
  },
  matariki: {
    originalNames: [n("Matariki", "Te reo Māori", "mi")],
    symbolism: [s("The Matariki star cluster", "Remembrance, celebrating the present and planning for the year ahead")],
  },

  // Added in FESTIVA 1.2
  meskel: {
    originalNames: [n("መስቀል", "Amharic and Ge'ez", "am", "Mäsqäl")],
    symbolism: [s("Demera (bonfire)", "The smoke said to have shown Empress Helena where the True Cross was buried"), s("Meskel daisies (adey abeba)", "Spring after the rains; used to decorate the Demera")],
    calendarSystem: "Ethiopian calendar (17 Meskerem), shown here in Gregorian dates",
  },
  homowo: {
    originalNames: [n("Hɔmɔwɔ", "Ga", "gaa", "Homowo")],
    symbolism: [s("Kpokpoi sprinkling", "Sharing the harvest with ancestors and the community"), s("The ban on drumming", "A quiet season while crops grow, ended by the festival")],
    calendarSystem: "Ga traditional calendar; each traditional area sets its own dates, mostly in August",
  },
  "vodun-days": {
    originalNames: [n("Vodun Days", "French and English (official name)", "fr"), n("Vodún", "Fon", "fon")],
    symbolism: [s("Zangbeto", "Guardians of the night, in raffia costumes"), s("Egungun", "Masquerades that embody returning ancestors")],
  },
  "tweede-nuwe-jaar": {
    originalNames: [n("Tweede Nuwe Jaar", "Afrikaans", "af")],
    symbolism: [s("The ghoema drum", "The sound of the Cape Malay and Cape Coloured musical tradition"), s("The parade route from District Six", "Return to a neighbourhood whose residents were forcibly removed under apartheid")],
  },
  "loy-krathong": {
    originalNames: [n("ลอยกระทง", "Thai", "th", "Loi Krathong")],
    symbolism: [s("The krathong", "A float of banana leaves, flowers, a candle and incense, sent away with misfortune"), s("Water", "Gratitude to the water goddess, Phra Mae Khongkha")],
  },
  sinulog: {
    originalNames: [n("Sinulog", "Cebuano", "ceb")],
    symbolism: [s("The Santo Niño", "The image of the Child Jesus given in Cebu in 1521"), s("The two steps forward, one step back", "The dance said to move like the river current (sulog)")],
  },
  thaipusam: {
    originalNames: [n("தைப்பூசம்", "Tamil", "ta", "Taippūcam")],
    symbolism: [s("Kavadi", "A burden carried as a vow to Murugan"), s("The vel (spear)", "The spear given to Murugan to defeat the demon Soorapadman")],
  },
  garma: {
    originalNames: [n("Garma", "Yolŋu Matha", "und")],
    symbolism: [s("Bunggul (dance)", "Ceremony and story held by each clan"), s("Yidaki", "The Yolŋu instrument known elsewhere as the didgeridoo")],
    calendarSystem: "Dates set each year by the Yothu Yindi Foundation, usually around the start of August",
  },
  "merrie-monarch": {
    originalNames: [n("Merrie Monarch Festival", "English", "en")],
    symbolism: [s("Hula kahiko and hula ʻauana", "Ancient and modern hula, judged on separate nights"), s("King David Kalākaua", "The 'Merrie Monarch' who revived hula in the 19th century")],
  },
  "sami-national-day": {
    originalNames: [n("Sámi álbmotbeaivi", "Northern Sámi", "se")],
    symbolism: [s("The Sámi flag", "Red for the sun and blue for the moon in its circle"), s("Gákti", "Traditional dress whose colours and cut show where the wearer is from")],
  },
  "candelaria-puno": {
    originalNames: [n("Festividad de la Virgen de la Candelaria", "Spanish", "es"), n("Mamacha Candelaria", "Quechua and Spanish", "qu")],
    symbolism: [s("The Virgin of Candelaria", "Puno's patron, joined to Andean reverence for the earth (Pachamama)"), s("The diablada", "A dance of devils and angels, good against evil")],
  },
  guelaguetza: {
    originalNames: [n("Guelaguetza", "Zapotec (as used in Spanish)", "zap")],
    symbolism: [s("Guelaguetza itself", "Reciprocal giving: each region's delegation offers gifts to the audience"), s("The Danza de la Pluma", "A feather-crowned dance retelling the conquest")],
  },
  junkanoo: {
    originalNames: [n("Junkanoo", "English", "en")],
    symbolism: [s("Goatskin drums, cowbells and whistles", "The rhythm of the rush, the parade"), s("Crêpe-paper costumes", "A year of a group's work, shown for one night")],
  },
  "trinidad-carnival": {
    originalNames: [n("Carnival", "English", "en"), n("J'ouvert", "French Creole", "fr", "jour ouvert, daybreak")],
    symbolism: [s("Canboulay", "Burning cane, remembered in the pre-dawn J'ouvert"), s("Steelpan", "An instrument invented in Trinidad in the 20th century")],
  },
  "kandy-esala-perahera": {
    originalNames: [n("ඇසළ පෙරහැර", "Sinhala", "si", "Äsaḷa Perahära")],
    symbolism: [s("The Maligawa tusker", "The elephant that carries the relic casket at the head of the procession"), s("Diya Kepeema (water cutting)", "The closing rite at the Mahaweli river")],
    calendarSystem: "Sinhala lunar month of Esala; dates set each year by the Temple of the Tooth",
  },
};

/** A plain description of how the festival's date is set, from its date rule unless overridden. */
export function calendarSystemOf(slug: string, rule: DateRule): string {
  const override = FESTIVAL_CULTURE[slug]?.calendarSystem;
  if (override) return override;
  switch (rule.kind) {
    case "fixed":
      return "Gregorian calendar (fixed date)";
    case "nth-weekday":
      return "Gregorian calendar (set by weekday)";
    case "easter-offset":
      return "Western Christian calendar (moves with Easter)";
    case "custom":
      return "Gregorian calendar (set by a local rule)";
    case "table":
      return rule.calendar;
    case "seasonal":
      return "Seasonal, with no fixed calendar date";
  }
}
