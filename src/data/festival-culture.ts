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

  // Indian festivals added 22 November 2026 (festivals-india.ts).
  "makar-sankranti": {
    originalNames: [n("मकर संक्रान्ति", "Hindi", "hi", "Makar Saṅkrānti"), n("ઉત્તરાયણ", "Gujarati", "gu", "Uttarāyaṇ")],
    symbolism: [s("Kites", "The sun's northward journey and the open skies of a new season"), s("Til-gul (sesame and jaggery)", "Warmth in winter and the wish to speak sweetly")],
  },
  lohri: {
    originalNames: [n("ਲੋਹੜੀ", "Punjabi", "pa", "Lohṛī")],
    symbolism: [s("The bonfire", "Warmth, the end of the coldest nights and the coming harvest"), s("Rewri, peanuts and popcorn", "Thanks offered to the fire for the season's crops")],
    calendarSystem: "Solar calendar; the night before Makar Sankranti",
  },
  "vasant-panchami": {
    originalNames: [n("वसंत पंचमी", "Hindi", "hi", "Vasant Pañcamī"), n("সরস্বতী পূজা", "Bengali", "bn", "Saraswatī Pūjā")],
    symbolism: [s("The colour yellow", "Mustard fields in bloom and the arrival of spring"), s("Books and instruments before Saraswati", "Knowledge, music and the arts")],
  },
  "maha-shivaratri": {
    originalNames: [n("महाशिवरात्रि", "Hindi", "hi", "Mahāśivarātri")],
    symbolism: [s("Bel (bilva) leaves", "An offering especially dear to Shiva"), s("The night vigil", "Overcoming darkness and ignorance")],
  },
  "ugadi-gudi-padwa": {
    originalNames: [n("ఉగాది", "Telugu", "te", "Ugādi"), n("ಯುಗಾದಿ", "Kannada", "kn", "Yugādi"), n("गुढीपाडवा", "Marathi", "mr", "Guḍhīpāḍavā")],
    symbolism: [s("Ugadi pachadi", "Six tastes for the mix of joy, sorrow, anger, fear, disgust and surprise a year will bring"), s("The gudi", "Victory and prosperity, raised high outside the home")],
  },
  vaisakhi: {
    originalNames: [n("ਵਿਸਾਖੀ", "Punjabi", "pa", "Visākhī"), n("बैसाखी", "Hindi", "hi", "Baisākhī")],
    symbolism: [s("Nishan Sahib", "The Sikh flag, renewed with a fresh cloth at Vaisakhi"), s("Ripe wheat", "The harvest and the farmer's year")],
  },
  vishu: {
    originalNames: [n("വിഷു", "Malayalam", "ml", "Viṣu")],
    symbolism: [s("Vishukkani", "Golden konna flowers, rice, fruit and a lamp: prosperity seen first in the new year"), s("Vishukkaineetam", "Coins given by elders as a blessing for the year")],
  },
  bihu: {
    originalNames: [n("ৰঙালী বিহু", "Assamese", "as", "Rôngali Bihu"), n("ব'হাগ বিহু", "Assamese", "as", "Bôhag Bihu")],
    symbolism: [s("Gamosa", "The woven cloth of respect and Assamese identity"), s("Pepa", "The buffalo-horn pipe whose sound means spring and youth")],
  },
  "ram-navami": {
    originalNames: [n("राम नवमी", "Hindi", "hi", "Rām Navamī")],
    symbolism: [s("A cradle with baby Rama", "His birth at midday in Ayodhya"), s("Panakam", "A cooling drink for the hot season, offered to the deity")],
  },
  "rath-yatra": {
    originalNames: [n("ରଥଯାତ୍ରା", "Odia", "or", "Rathajātrā")],
    symbolism: [s("The three chariots", "The deities coming out among all people"), s("Chhera Pahanra", "The king sweeping the chariots: everyone is equal before God")],
  },
  "raksha-bandhan": {
    originalNames: [n("रक्षा बंधन", "Hindi", "hi", "Rakṣā Bandhan")],
    symbolism: [s("The rakhi thread", "A bond of affection and a promise of care"), s("Tilak and sweets", "Blessings and sweetness between siblings")],
  },
  janmashtami: {
    originalNames: [n("कृष्ण जन्माष्टमी", "Hindi", "hi", "Kṛṣṇa Janmāṣṭamī"), n("दहीहंडी", "Marathi", "mr", "Dahīhaṇḍī")],
    symbolism: [s("The pot of butter and curd", "Krishna's mischievous childhood as the butter thief"), s("Midnight", "The hour of his birth")],
  },
  navratri: {
    originalNames: [n("नवरात्रि", "Hindi", "hi", "Navarātri"), n("નવરાત્રી", "Gujarati", "gu", "Navarātrī")],
    symbolism: [s("The garbo", "A pierced clay pot with a lamp: life and the goddess's energy within"), s("Nine forms of Durga", "One form of the goddess honoured each night")],
  },
  dussehra: {
    originalNames: [n("दशहरा", "Hindi", "hi", "Daśaharā"), n("विजयादशमी", "Sanskrit", "sa", "Vijayādaśamī"), n("ದಸರಾ", "Kannada", "kn", "Dasarā")],
    symbolism: [s("Ravana's effigy", "Burned to mark the victory of good over evil"), s("Shami or apta leaves", "Exchanged as 'gold' for prosperity")],
  },
  "karva-chauth": {
    originalNames: [n("करवा चौथ", "Hindi", "hi", "Karvā Cauth")],
    symbolism: [s("The karva", "A clay pot used in the puja and exchanged between women"), s("The moon seen through a sieve", "The moment the fast ends")],
  },
  "chhath-puja": {
    originalNames: [n("छठ पूजा", "Hindi", "hi", "Chhaṭh Pūjā")],
    symbolism: [s("The soop", "A bamboo winnowing basket of fruit and thekua offered to the sun"), s("Standing in water at sunset and sunrise", "Gratitude to the sun as the source of life")],
  },
  "guru-nanak-jayanti": {
    originalNames: [n("ਗੁਰਪੁਰਬ", "Punjabi", "pa", "Gurpurab"), n("ਪ੍ਰਕਾਸ਼ ਪੁਰਬ", "Punjabi", "pa", "Prakāsh Purab")],
    symbolism: [s("Langar", "Equality and service: everyone eats together"), s("Ik Onkar", "The oneness of God, the first words of the Guru Granth Sahib")],
  },
  "hornbill-festival": {
    originalNames: [],
    namesNote: "Named in English after the great hornbill; each of Nagaland's tribes has its own language and festivals.",
    symbolism: [s("Hornbill feathers", "Valour and honour in Naga traditions"), s("The morung", "The communal house where young people learned their tribe's lore")],
    calendarSystem: "Gregorian calendar; 1 to 10 December, from Nagaland's Statehood Day",
  },

  // World festivals added 22 November 2026 (festivals-world.ts).
  "fete-de-la-musique": {
    originalNames: [n("Fête de la Musique", "French", "fr")],
    symbolism: [s("The summer solstice", "The longest day, given over to music"), s("Free concerts", "Music as something everyone can make and share")],
  },
  "kings-day": {
    originalNames: [n("Koningsdag", "Dutch", "nl")],
    symbolism: [s("The colour orange", "The royal House of Orange-Nassau"), s("The vrijmarkt", "A free market where anyone may sell, a sign of the day's informality")],
  },
  "barranquilla-carnival": {
    originalNames: [n("Carnaval de Barranquilla", "Spanish", "es")],
    symbolism: [s("The Marimonda mask", "A big-eared, long-nosed figure mocking the powerful"), s("Joselito Carnaval", "His mock burial ends the carnival")],
  },
  maslenitsa: {
    originalNames: [n("Масленица", "Russian", "ru", "Maslenitsa")],
    symbolism: [s("Blini", "Round and golden like the returning sun"), s("The straw effigy", "Burned to say goodbye to winter")],
  },
  "orthodox-easter-greece": {
    originalNames: [n("Πάσχα", "Greek", "el", "Páscha")],
    symbolism: [s("Red eggs", "The blood of Christ and new life"), s("The Holy Light", "Passed from candle to candle at midnight: the Resurrection")],
  },
  thingyan: {
    originalNames: [n("သင်္ကြန်", "Burmese", "my", "Thingyan")],
    symbolism: [s("Water", "Washing away the misdeeds and misfortunes of the old year"), s("Padauk flowers", "Golden blossoms that bloom only at this season")],
  },
  "bon-om-touk": {
    originalNames: [n("បុណ្យអុំទូក", "Khmer", "km", "Bon Om Tuk")],
    symbolism: [s("The racing boats", "The river's bounty and the naval strength of the Khmer kings"), s("Ambok and the full moon", "Thanks for the rice harvest")],
  },
  "sao-joao-porto": {
    originalNames: [n("São João do Porto", "Portuguese", "pt")],
    symbolism: [s("Plastic hammers", "Playful blows that replaced the old leeks and garlic flowers"), s("Manjericos (basil pots)", "Love and friendship, given with a short poem")],
  },
  vendimia: {
    originalNames: [n("Fiesta Nacional de la Vendimia", "Spanish", "es")],
    symbolism: [s("The first bunch of grapes", "Offered at the Bendición de los Frutos"), s("The Vendimia Queen", "Representing the departments of Mendoza")],
  },
  "quebec-winter-carnival": {
    originalNames: [n("Carnaval de Québec", "French", "fr")],
    symbolism: [s("Bonhomme Carnaval", "The snowman mascot and king of the carnival"), s("The ceinture fléchée", "The arrow-patterned sash of French-Canadian voyageurs")],
  },
  "osun-osogbo": {
    originalNames: [n("Ọdún Ọ̀ṣun Òṣogbo", "Yoruba", "yo", "Odun Osun Osogbo")],
    symbolism: [s("The Arugba's calabash", "Offerings carried to the goddess by a young woman of the royal family"), s("The river", "Osun's waters of fertility and healing")],
  },
  "fes-sacred-music": {
    originalNames: [n("مهرجان فاس للموسيقى العالمية العريقة", "Arabic", "ar", "Mahrajān Fās lil-Mūsīqā al-ʿĀlamiyya al-ʿArīqa")],
    symbolism: [s("Sufi chant (sama)", "Music as a path to the divine"), s("Bab Al Makina", "A royal courtyard turned into a stage for many faiths")],
  },
  "santiago-de-cuba-carnival": {
    originalNames: [n("Carnaval de Santiago de Cuba", "Spanish", "es")],
    symbolism: [s("The corneta china", "The Chinese trumpet that calls the conga"), s("Paper farolas", "Lanterns carried high through the night parades")],
  },
  "carnival-of-binche": {
    originalNames: [n("Carnaval de Binche", "French", "fr")],
    symbolism: [s("The Gille", "A masked dancer whose costume carries the lion of Belgium"), s("Oranges", "Thrown to the crowd as gifts of good fortune")],
  },
  "basel-fasnacht": {
    originalNames: [n("Basler Fasnacht", "Swiss German", "gsw")],
    symbolism: [s("The Morgestraich lanterns", "Light and satire in the darkened city"), s("Piccolos and drums", "The marching music of the cliques")],
  },

  // Second world batch, added 22 November 2026 (festivals-world-2.ts).
  "smigus-dyngus": {
    originalNames: [n("Śmigus-dyngus", "Polish", "pl"), n("Lany Poniedziałek", "Polish", "pl")],
    symbolism: [s("Water", "Cleansing and new life in spring"), s("Pisanki", "Decorated eggs: rebirth and the Resurrection")],
  },
  "kupala-night": {
    originalNames: [n("Івана Купала", "Ukrainian", "uk", "Ivana Kupala")],
    symbolism: [s("Bonfire", "Purification and the power of the midsummer sun"), s("Flower wreaths on the water", "Love and fortune, read from the wreath's journey")],
  },
  masopust: {
    originalNames: [n("Masopust", "Czech", "cs")],
    symbolism: [s("The bear and the horse masks", "Strength and fertility leading the procession"), s("Burying the double bass", "The end of dancing until Easter")],
  },
  busojaras: {
    originalNames: [n("Busójárás", "Hungarian", "hu")],
    symbolism: [s("Carved willow masks", "Frightening winter away"), s("The burning coffin", "Winter carried off and burned")],
  },
  "baba-marta": {
    originalNames: [n("Баба Марта", "Bulgarian", "bg", "Baba Marta"), n("Мартеница", "Bulgarian", "bg", "Martenitsa")],
    symbolism: [s("Red thread", "Health and life"), s("White thread", "Purity and long life")],
  },
  "sankt-hans": {
    originalNames: [n("Sankt Hans aften", "Danish", "da")],
    symbolism: [s("The bonfire", "Light at the shortest night of the year"), s("The straw witch", "Sent off to the Brocken, taking bad luck with her")],
  },
  "taiwan-lantern-festival": {
    originalNames: [n("元宵節", "Mandarin", "zh-Hant-TW", "Yuánxiāo jié")],
    symbolism: [s("Sky lanterns", "Wishes carried up to the heavens"), s("Tangyuan", "Round dumplings for family togetherness")],
  },
  "paro-tsechu": {
    originalNames: [n("ཚེས་བཅུ", "Dzongkha", "dz", "Tshechu")],
    symbolism: [s("The thongdrel", "A giant thangka of Guru Rinpoche whose sight brings liberation"), s("Cham masks", "Deities and protectors who drive away evil")],
  },
  "lamu-cultural-festival": {
    originalNames: [n("Tamasha la Utamaduni la Lamu", "Swahili", "sw")],
    symbolism: [s("The dhow", "The Swahili coast's seafaring heritage"), s("Carved doors", "The craftsmanship of Lamu's old town")],
  },
  "sauti-za-busara": {
    originalNames: [n("Sauti za Busara", "Swahili", "sw")],
    symbolism: [s("The name, 'sounds of wisdom'", "Music as a carrier of knowledge"), s("The Old Fort", "A colonial fortress turned into a stage for African music")],
  },
  "saint-louis-jazz": {
    originalNames: [n("Festival international de jazz de Saint-Louis", "French", "fr")],
    symbolism: [s("The Faidherbe Bridge", "The city's link between island and mainland"), s("Jam sessions", "Musicians of many nations playing together")],
  },
  "fiestas-patrias-chile": {
    originalNames: [n("Fiestas Patrias", "Spanish", "es"), n("Dieciocho", "Spanish", "es")],
    symbolism: [s("The cueca handkerchief", "Courtship in the national dance"), s("Volantines (kites)", "Spring skies and childhood")],
  },
  "oruro-carnival": {
    originalNames: [n("Carnaval de Oruro", "Spanish", "es")],
    symbolism: [s("La Diablada", "Devils defeated by the Archangel Michael"), s("The Virgen del Socavón", "Patroness of the miners")],
  },
  "dia-de-los-difuntos-ecuador": {
    originalNames: [n("Día de los Difuntos", "Spanish", "es"), n("Aya Markay Killa", "Kichwa", "qu")],
    symbolism: [s("Colada morada", "Purple maize drink shared in memory of the dead"), s("Guaguas de pan", "Bread babies, the cycle of life")],
  },
  "goroka-show": {
    originalNames: [],
    namesNote: "Known by its English name; the groups taking part speak many of Papua New Guinea's more than 800 languages.",
    symbolism: [s("Bird-of-paradise plumes", "Status and beauty in highland dress"), s("The Asaro Mudmen", "A legend of warriors covered in clay to frighten their enemies")],
  },

  // Third world batch, added 22 November 2026 (festivals-world-3.ts).
  krampuslauf: {
    originalNames: [n("Krampuslauf", "German", "de")],
    symbolism: [s("The Krampus mask", "Winter's wild spirits, tamed by Saint Nicholas"), s("Bells", "Noise to drive away the darkness")],
  },
  janu: {
    originalNames: [n("Jāņi", "Latvian", "lv"), n("Līgo", "Latvian", "lv")],
    symbolism: [s("Oak wreaths", "Strength, worn by men"), s("Caraway cheese", "Its round yellow shape is the sun")],
  },
  uzgavenes: {
    originalNames: [n("Užgavėnės", "Lithuanian", "lt")],
    symbolism: [s("Lašininis and Kanapinis", "Fat winter and lean spring in a mock battle"), s("Morė", "The straw effigy burned to end winter")],
  },
  thjodhatid: {
    originalNames: [n("Þjóðhátíð í Vestmannaeyjum", "Icelandic", "is")],
    symbolism: [s("The bonfire", "Lit on the first night of the festival"), s("Brekkusöngur", "Thousands singing together on the hillside")],
  },
  martisor: {
    originalNames: [n("Mărțișor", "Romanian", "ro")],
    symbolism: [s("Red and white string", "Winter and spring, life and purity"), s("The charm", "Good luck for the year")],
  },
  nauryz: {
    originalNames: [n("Наурыз", "Kazakh", "kk", "Nauryz")],
    symbolism: [s("Nauryz kozhe", "Seven ingredients for seven blessings"), s("The yurt", "Home and hospitality on the steppe")],
  },
  "jerash-festival": {
    originalNames: [n("مهرجان جرش للثقافة والفنون", "Arabic", "ar", "Mahrajān Jarash lil-Thaqāfa wal-Funūn")],
    symbolism: [s("The Roman theatres", "Ancient stages brought back to life"), s("Dabke", "The line dance of community")],
  },
  "boun-bang-fai": {
    originalNames: [n("ບຸນບັ້ງໄຟ", "Lao", "lo", "Boun Bang Fai")],
    symbolism: [s("Bamboo rockets", "Messages to the rain god Phaya Thaen"), s("The naga", "The serpent of water and fertility")],
  },
  "kwita-izina": {
    originalNames: [n("Kwita Izina", "Kinyarwanda", "rw")],
    symbolism: [s("Naming", "Welcoming a newborn into the community"), s("The mountain gorilla", "Rwanda's conservation success")],
  },
  "festival-on-the-niger": {
    originalNames: [n("Festival sur le Niger", "French", "fr")],
    symbolism: [s("The river Niger", "The source of life and culture in Mali"), s("Sogo bo puppets", "Animals and spirits of Bambara theatre")],
  },
  "accompong-maroon-festival": {
    originalNames: [],
    namesNote: "Known by its English name; Maroon traditions keep words and songs from Akan and other African languages.",
    symbolism: [s("The abeng", "A cow-horn trumpet once used to send signals"), s("The Kindah tree", "Maroon unity and kinship")],
  },
  "haitian-kanaval": {
    originalNames: [n("Kanaval", "Haitian Creole", "ht")],
    symbolism: [s("Papier-mâché masks", "Jacmel's artistry and satire"), s("Rara vaksin trumpets", "Bamboo music of the streets")],
  },
  "diablos-danzantes-de-yare": {
    originalNames: [n("Diablos Danzantes de Yare", "Spanish", "es")],
    symbolism: [s("Devil masks", "Evil that submits to the sacred"), s("Kneeling devils", "The triumph of good")],
  },
  "desfile-de-llamadas": {
    originalNames: [n("Desfile de Llamadas", "Spanish", "es")],
    symbolism: [s("Candombe drums", "Afro-Uruguayan heritage, played in three voices"), s("The mama vieja", "An elder figure of the comparsa")],
  },
  "teuila-festival": {
    originalNames: [n("Teuila", "Samoan", "sm")],
    symbolism: [s("The teuila flower", "Red ginger, Samoa's national flower"), s("The fire knife", "Skill and courage of Samoan warriors")],
  },

  // Fourth world batch, added 22 November 2026 (festivals-world-4.ts).
  "feast-of-saint-blaise": {
    originalNames: [n("Festa svetoga Vlaha", "Croatian", "hr")],
    symbolism: [s("The saint's relics", "Protection for the city"), s("White doves", "Peace and freedom")],
  },
  "guca-trumpet-festival": {
    originalNames: [n("Драгачевски сабор трубача", "Serbian", "sr", "Dragačevski sabor trubača")],
    symbolism: [s("The Golden Trumpet", "The prize for the best band"), s("The kolo", "The circle dance of community")],
  },
  kurentovanje: {
    originalNames: [n("Kurentovanje", "Slovene", "sl")],
    symbolism: [s("The kurent's bells", "Driving winter away"), s("The red tongue and horns", "A spirit of spring and fertility")],
  },
  jaanipaev: {
    originalNames: [n("Jaanipäev", "Estonian", "et"), n("Jaaniõhtu", "Estonian", "et")],
    symbolism: [s("The bonfire", "Light and protection"), s("The fern blossom", "A legendary flower of luck, found only on this night")],
  },
  "dita-e-veres": {
    originalNames: [n("Dita e Verës", "Albanian", "sq")],
    symbolism: [s("Verore bracelets", "Red and white thread for health"), s("Ballokume", "The festival's sweet")],
  },
  rtveli: {
    originalNames: [n("რთველი", "Georgian", "ka", "Rtveli")],
    symbolism: [s("The qvevri", "Clay vessels buried in the earth, Georgia's ancient way of making wine"), s("The vine cross", "Saint Nino's cross, bound with her hair, in legend")],
  },
  vardavar: {
    originalNames: [n("Վարդավառ", "Armenian", "hy", "Vardavar")],
    symbolism: [s("Water", "Purification, from the goddess Astghik"), s("Roses", "Vard, the rose, in the festival's name")],
  },
  "silk-and-spices-festival": {
    originalNames: [n("Ipak va ziravorlar festivali", "Uzbek", "uz")],
    symbolism: [s("Ikat silk", "Bukhara's weaving heritage"), s("Spices", "The trade of the Silk Road")],
  },
  "baalbeck-festival": {
    originalNames: [n("مهرجانات بعلبك الدولية", "Arabic", "ar", "Mahrajānāt Baʿlabak ad-Duwaliyya")],
    symbolism: [s("The Temple of Bacchus", "A stage that has hosted legends"), s("The cedar", "Lebanon's emblem")],
  },
  "sahara-festival-douz": {
    originalNames: [n("مهرجان الصحراء الدولي بدوز", "Arabic", "ar", "Mahrajān aṣ-Ṣaḥrāʾ ad-Duwalī bi-Dūz")],
    symbolism: [s("The camel", "Life and travel in the desert"), s("Bedouin poetry", "The oral culture of the nomads")],
  },
  kuomboka: {
    originalNames: [n("Kuomboka", "Silozi", "loz")],
    symbolism: [s("The Nalikwanda", "The royal barge, crowned with a black-and-white elephant"), s("The maoma drums", "The voice of the king")],
  },
  ngondo: {
    originalNames: [n("Ngondo", "Duala", "dua")],
    symbolism: [s("The sacred dive", "A message from the water spirits"), s("The pirogue", "The Sawa peoples' bond with the river and sea")],
  },
  "sumpango-kites": {
    originalNames: [n("Barriletes Gigantes", "Spanish", "es")],
    symbolism: [s("Giant kites", "Messages carried between the living and the dead"), s("Kite strings", "A link to the ancestors")],
  },
  "las-tablas-carnival": {
    originalNames: [n("Carnaval de Las Tablas", "Spanish", "es")],
    symbolism: [s("Calle Arriba and Calle Abajo", "A friendly rivalry"), s("The pollera", "Panama's national dress")],
  },
  "hibiscus-festival": {
    originalNames: [],
    namesNote: "Known by its English name; Fiji's festivals bring together iTaukei Fijian, Indo-Fijian and other communities.",
    symbolism: [s("The hibiscus", "Fiji's flower of welcome"), s("The meke", "Dance that tells stories of Fijian history")],
  },

  // Fifth world batch, added 22 November 2026 (festivals-world-5.ts).
  "vychodna-folklore-festival": {
    originalNames: [n("Folklórny festival Východná", "Slovak", "sk")],
    symbolism: [s("The fujara", "A shepherd's overtone flute, UNESCO-listed"), s("Regional costume", "The identity of each village")],
  },
  mnarja: {
    originalNames: [n("L-Imnarja", "Maltese", "mt")],
    symbolism: [s("Luminaria", "The lights once lit for the feast, which gave it its name"), s("Għana", "Maltese folk song")],
  },
  schueberfouer: {
    originalNames: [n("Schueberfouer", "Luxembourgish", "lb")],
    symbolism: [s("The Hämmelsmarsch", "A parade of sheep and musicians that opens the fair"), s("John the Blind", "The count who founded the fair in 1340")],
  },
  "ohrid-summer-festival": {
    originalNames: [n("Охридско лето", "Macedonian", "mk", "Ohridsko leto")],
    symbolism: [s("Saint Sophia", "A medieval church turned concert hall"), s("Lake Ohrid", "One of the oldest lakes in the world")],
  },
  "sarajevo-film-festival": {
    originalNames: [n("Sarajevo Film Festival", "Bosnian", "bs")],
    symbolism: [s("The Heart of Sarajevo", "The festival's award"), s("Cinema under siege", "Culture as resistance")],
  },
  "mimosa-festival": {
    originalNames: [n("Praznik mimoze", "Montenegrin", "cnr")],
    symbolism: [s("Mimosa blossom", "The first sign of spring on the bay"), s("Brass bands", "The festive sound of the coast")],
  },
  "moldova-wine-day": {
    originalNames: [n("Ziua Națională a Vinului", "Romanian", "ro")],
    symbolism: [s("The grape", "Moldova's heritage and livelihood"), s("The hora", "A circle dance of togetherness")],
  },
  "la-vega-carnival": {
    originalNames: [n("Carnaval Vegano", "Spanish", "es")],
    symbolism: [s("The diablo cojuelo", "A mischievous limping devil"), s("The vejiga", "An inflated bladder swung at the crowd")],
  },
  "dia-del-boyero": {
    originalNames: [n("Día del Boyero", "Spanish", "es")],
    symbolism: [s("The painted oxcart", "Costa Rica's national symbol of work"), s("The blessing", "Thanks for the animals and the harvest")],
  },

  // Sixth world batch, added 22 November 2026 (festivals-world-6.ts).
  "nyege-nyege": {
    originalNames: [n("Nyege Nyege", "Luganda", "lg")],
    symbolism: [s("The name", "From a Luganda phrase for an irresistible urge to dance"), s("The Nile", "The river at the heart of the festival")],
  },
  umhlanga: {
    originalNames: [n("Umhlanga", "siSwati", "ss")],
    symbolism: [s("Reeds", "Brought to repair the Queen Mother's windbreak"), s("Red feathers", "Worn by princesses")],
  },
  fespaco: {
    originalNames: [n("Festival panafricain du cinéma et de la télévision de Ouagadougou", "French", "fr")],
    symbolism: [s("The Golden Stallion of Yennenga", "The top prize, named after the warrior princess of the Mossi"), s("Filmmakers' Square", "A monument to African cinema")],
  },
  abissa: {
    originalNames: [n("Abissa", "Nzema", "nzi")],
    symbolism: [s("Open criticism", "Truth spoken to clear the air for the new year"), s("Sacred drums", "The voice of the ancestors")],
  },
  "mindelo-carnival": {
    originalNames: [n("Carnaval do Mindelo", "Portuguese", "pt")],
    symbolism: [s("The Mandingas", "Dancers in black body paint and grass skirts"), s("Floats", "Months of work by each group")],
  },
  "fiestas-agostinas": {
    originalNames: [n("Fiestas Agostinas", "Spanish", "es")],
    symbolism: [s("The Divine Saviour of the World", "The patron of the capital and the nation"), s("The Bajada", "The image of Christ transfigured")],
  },
  "garifuna-settlement-day": {
    originalNames: [n("Yurumein", "Garifuna", "cab")],
    symbolism: [s("The dugout canoe", "The arrival of the Garifuna in 1832"), s("Drums", "The heartbeat of Garifuna music")],
  },
  "crop-over": {
    originalNames: [],
    namesNote: "Known by its English name; Bajan Creole adds many of the festival's words, such as 'kadooment'.",
    symbolism: [s("The last canes", "The end of the sugar harvest"), s("Grand Kadooment", "The final carnival parade")],
  },
  "palo-de-mayo": {
    originalNames: [n("Palo de Mayo", "Spanish", "es"), n("Maypole", "Creole English", "en")],
    symbolism: [s("The maypole", "Fertility and the rainy season"), s("Fruit and ribbons", "The abundance of the coast")],
  },
  "heilala-festival": {
    originalNames: [n("Heilala", "Tongan", "to")],
    symbolism: [s("The heilala flower", "Tonga's national flower"), s("Torches along the shore", "Light shared across the island")],
  },
  naghol: {
    originalNames: [n("Naghol", "Sa", "sss")],
    symbolism: [s("The leap", "Courage, and a blessing for the yams"), s("Liana vines", "Chosen with care, as a life depends on them")],
  },
  "fallas-del-pirineu": {
    originalNames: [n("Falles del Pirineu", "Catalan", "ca")],
    symbolism: [s("The falla torch", "Fire carried down from the mountain"), s("The solstice", "The longest day of the year")],
  },
  "sainte-devote": {
    originalNames: [n("Fête de la Sainte-Dévote", "French", "fr")],
    symbolism: [s("The burning boat", "The thief's boat, burned in legend"), s("The dove", "Which guided the saint's relics to Monaco")],
  },
  "liechtenstein-national-day": {
    originalNames: [n("Staatsfeiertag", "German", "de")],
    symbolism: [s("The prince's invitation", "The bond between the princely family and the people"), s("Fireworks", "Celebration over the Rhine valley")],
  },
  evala: {
    originalNames: [n("Evala", "Kabye", "kbp")],
    symbolism: [s("Wrestling", "Strength and courage on the way to adulthood"), s("Village rivalry", "Friendly competition between communities")],
  },

  // The last countries, added 22 November 2026 (festivals-world-7.ts).
  "luanda-carnival": {
    originalNames: [n("Carnaval de Luanda", "Portuguese", "pt")],
    symbolism: [s("Semba", "The rhythm at the heart of Angolan carnival"), s("Neighbourhood groups", "Pride of each district")],
  },
  "antigua-carnival": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("Emancipation", "The freedom the carnival commemorates"), s("Steelpan", "The Caribbean's own instrument")],
  },
  "kuru-dance-festival": {
    originalNames: [],
    namesNote: "Known by its English name; the San speak several Khoe and Tuu languages.",
    symbolism: [s("The healing dance", "A trance dance for healing the community"), s("Ostrich-eggshell beads", "One of the oldest crafts in the world")],
  },
  "fespam": {
    originalNames: [n("Festival panafricain de musique", "French", "fr")],
    symbolism: [s("Congolese rumba", "UNESCO-listed music of the two Congos"), s("The festival's home", "Brazzaville, on the Congo river")],
  },
  "kataklysmos": {
    originalNames: [n("Κατακλυσμός", "Greek", "el", "Kataklysmós")],
    symbolism: [s("Water", "Purification, and the memory of the flood"), s("Tsiattista", "Improvised poetry duels")],
  },
  "world-creole-music-festival": {
    originalNames: [],
    namesNote: "Known by its English name; the festival celebrates Kwéyòl, the Creole language of Dominica.",
    symbolism: [s("Bouyon", "Dominica's own modern music"), s("Wob dwiyet", "The national dress of madras cloth")],
  },
  "spicemas": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("The Jab Jab", "Oil and chains recalling and mocking slavery"), s("Nutmeg", "The spice of the Spice Isle")],
  },
  "bissau-carnival": {
    originalNames: [n("Carnaval de Bissau", "Portuguese", "pt")],
    symbolism: [s("Bijagós masks", "Bulls and sharks from island initiation rites"), s("Gumbe", "The music of Guinea-Bissau")],
  },
  "la-ceiba-carnival": {
    originalNames: [n("Carnaval de la Amistad", "Spanish", "es")],
    symbolism: [s("San Isidro", "The patron saint of La Ceiba"), s("Carnavalitos", "Street parties in every neighbourhood")],
  },
  "kiribati-independence-day": {
    originalNames: [n("Te Kaotan Inaomata", "Gilbertese", "gil")],
    symbolism: [s("The frigatebird", "On the flag, a symbol of freedom"), s("The maneaba", "The meeting house at the heart of community")],
  },
  "moshoeshoe-day": {
    originalNames: [n("Letsatsi la Moshoeshoe", "Sesotho", "st")],
    symbolism: [s("Thaba-Bosiu", "The mountain fortress of the founder"), s("The mokorotlo", "The Basotho hat, shaped like a local mountain")],
  },
  "liberia-independence-day": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("The Lone Star", "The single star of the Liberian flag"), s("1847", "The year of independence")],
  },
  "famadihana": {
    originalNames: [n("Famadihana", "Malagasy", "mg")],
    symbolism: [s("Lamba silk shrouds", "Renewed for the ancestors"), s("Dancing with the ancestors", "A joyful reunion of the family")],
  },
  "lake-of-stars": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("The lake", "Lake Malawi, the 'lake of stars' named by Livingstone"), s("Sunsets", "The festival's backdrop")],
  },
  "chopi-timbila": {
    originalNames: [n("M'saho", "Chopi", "cce")],
    symbolism: [s("The timbila", "Wooden xylophones tuned with gourds"), s("The m'saho suite", "Music, dance and poetry in movements")],
  },
  "maharero-day": {
    originalNames: [n("Maharero Day", "Otjiherero", "hz")],
    symbolism: [s("Horned headdresses", "Cow horns, the wealth of a pastoral people"), s("Uniforms", "Military dress adopted and transformed")],
  },
  "angam-day": {
    originalNames: [n("Angam", "Nauruan", "na")],
    symbolism: [s("1,500", "The population number thought needed for survival"), s("Homecoming", "The meaning of 'angam'")],
  },
  "palau-independence-day": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("The full moon on the flag", "Unity and the right time for activities"), s("Storyboards", "Carved legends of Palau")],
  },
  "marshall-islands-constitution-day": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("Stick charts", "Maps of ocean swells used by navigators"), s("Outrigger canoes", "The skill of Marshallese sailing")],
  },
  "yap-day": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("Rai stone money", "Giant stone discs whose ownership is remembered, not moved"), s("Bamboo dance", "A traditional Yapese performance")],
  },
  "sugar-mas": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("Moko Jumbies", "Stilt-walkers from West African tradition"), s("Sugar", "The islands' plantation history")],
  },
  "jounen-kweyol": {
    originalNames: [n("Jounen Kwéyòl", "Saint Lucian Creole", "acf")],
    symbolism: [s("Madras", "The cloth of the national dress"), s("Kwéyòl", "The Creole language of the island")],
  },
  "vincy-mas": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("Mardi Gras", "The final day of the parade of bands"), s("Panorama", "The steelpan competition")],
  },
  "feast-of-saint-marinus": {
    originalNames: [n("Festa di San Marino", "Italian", "it")],
    symbolism: [s("The Three Towers", "Symbols of the republic"), s("Crossbows", "The republic's historic defenders")],
  },
  "festival-kreol": {
    originalNames: [n("Festival Kreol", "Seychellois Creole", "crs")],
    symbolism: [s("Moutya", "A dance born from the songs of enslaved people"), s("Kreol Seselwa", "The language that unites the islands")],
  },
  "solomon-islands-independence-day": {
    originalNames: [],
    namesNote: "Known by its English name.",
    symbolism: [s("Panpipes", "Bamboo ensembles of Malaita"), s("Shell money", "Traditional currency, still used in custom exchanges")],
  },
  "tuvalu-independence-day": {
    originalNames: [n("Aso Tutokotasi", "Tuvaluan", "tvl")],
    symbolism: [s("Fatele", "Dance and song that grow faster and faster"), s("The falekaupule", "The island meeting hall")],
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
