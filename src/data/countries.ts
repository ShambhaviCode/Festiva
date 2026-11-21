import type { Country, RegionId } from "@/domain/types";

const c = (code: string, name: string, region: RegionId, currency: string, languages: string[], blurb: string): Country => ({
  code,
  name,
  region,
  currency,
  languages,
  blurb,
});

export const countries: Country[] = [
  c("IN", "India", "south-asia", "INR", ["Hindi", "English", "Bengali", "Tamil", "Marathi", "Malayalam"], "A subcontinent of many calendars, where almost every month brings a festival in one region or another."),
  c("NP", "Nepal", "south-asia", "NPR", ["Nepali", "Newar"], "Himalayan valleys where Hindu and Buddhist traditions share the same courtyards."),
  c("BD", "Bangladesh", "south-asia", "BDT", ["Bengali"], "The delta heartland of Bengali language, poetry and seasonal festivals."),
  c("LK", "Sri Lanka", "south-asia", "LKR", ["Sinhala", "Tamil"], "An island of lantern-lit Vesak nights, temple processions and Tamil harvest celebrations."),
  c("PK", "Pakistan", "south-asia", "PKR", ["Urdu", "Punjabi", "Sindhi", "Pashto"], "Home to Sufi music, spring kite traditions and generous Eid tables."),
  c("CN", "China", "east-asia", "CNY", ["Mandarin", "Cantonese"], "A festival year set by the lunisolar calendar, from Spring Festival to the Mid-Autumn moon."),
  c("JP", "Japan", "east-asia", "JPY", ["Japanese"], "Seasonal awareness runs through the calendar, from cherry blossom to shrine festivals."),
  c("KR", "South Korea", "east-asia", "KRW", ["Korean"], "Family holidays of Seollal and Chuseok sit alongside one of the world's most followed pop cultures."),
  c("MN", "Mongolia", "central-asia", "MNT", ["Mongolian"], "Open steppe, nomadic heritage and the summer games of Naadam."),
  c("TH", "Thailand", "southeast-asia", "THB", ["Thai"], "Temple fairs, floating lanterns and the water-blessed new year of Songkran."),
  c("VN", "Vietnam", "southeast-asia", "VND", ["Vietnamese"], "Tết blossom, ancestral altars and children's lanterns at the autumn moon."),
  c("SG", "Singapore", "southeast-asia", "SGD", ["English", "Mandarin", "Malay", "Tamil"], "A city where Chinese, Malay, Indian and other calendars are all public holidays."),
  c("ID", "Indonesia", "southeast-asia", "IDR", ["Indonesian", "Javanese", "Balinese"], "An archipelago whose celebrations range from Lebaran homecomings to Waisak at Borobudur."),
  c("IR", "Iran", "middle-east", "IRR", ["Persian"], "The homeland of Nowruz, poetry and garden culture."),
  c("IL", "Israel", "middle-east", "ILS", ["Hebrew", "Arabic"], "A place where the Hebrew calendar sets the rhythm of the public year."),
  c("TR", "Türkiye", "middle-east", "TRY", ["Turkish"], "Bayram visits, sweets and a table always ready for guests."),
  c("AE", "United Arab Emirates", "middle-east", "AED", ["Arabic", "English"], "Gulf traditions of hospitality, with Eid celebrated by residents from across the world."),
  c("EG", "Egypt", "middle-east", "EGP", ["Arabic"], "Ramadan lanterns, Nile-side spring picnics and millennia of festival history."),
  c("ET", "Ethiopia", "africa", "ETB", ["Amharic", "Oromo", "Tigrinya"], "An ancient Christian calendar of its own, with Timkat and Meskel among its great public feasts."),
  c("GH", "Ghana", "africa", "GHS", ["English", "Akan", "Ewe", "Ga"], "Known for woven kente, durbars of chiefs and harvest festivals."),
  c("ES", "Spain", "europe", "EUR", ["Spanish", "Catalan", "Basque", "Galician"], "Every town keeps its own fiesta, from Holy Week processions to summer street festivals."),
  c("DE", "Germany", "europe", "EUR", ["German"], "Folk fairs, Advent markets and regional dress that is still worn with pride."),
  c("IE", "Ireland", "europe", "EUR", ["English", "Irish"], "Music sessions, storytelling and a national day celebrated around the world."),
  c("SE", "Sweden", "europe", "SEK", ["Swedish"], "A year shaped by light, from candlelit Lucia mornings to the endless days of Midsummer."),
  c("IT", "Italy", "europe", "EUR", ["Italian"], "Patron-saint feasts, carnival masks and regional Christmas tables."),
  c("GB", "United Kingdom", "europe", "GBP", ["English", "Welsh", "Scottish Gaelic"], "Old seasonal customs alongside the festivals of many communities who have made it home."),
  c("US", "United States", "north-america", "USD", ["English", "Spanish"], "National holidays sit beside the celebrations of every diaspora."),
  c("MX", "Mexico", "latin-america", "MXN", ["Spanish", "Nahuatl", "Maya", "Zapotec"], "Indigenous and Catholic traditions woven together in colour, food and remembrance."),
  c("BR", "Brazil", "latin-america", "BRL", ["Portuguese"], "Carnival, June festivals and music shaped by African, Indigenous and European roots."),
  c("PE", "Peru", "latin-america", "PEN", ["Spanish", "Quechua", "Aymara"], "Andean ceremonies and colonial-era processions share the streets of Cusco."),
  c("NZ", "New Zealand", "oceania", "NZD", ["English", "te reo Māori"], "Aotearoa, where the rising of Matariki now marks a national holiday."),
  // Added in FESTIVA 1.2 with the new festivals.
  c("BJ", "Benin", "africa", "XOF", ["French", "Fon", "Yoruba"], "The historic home of the Dahomey kingdom, and of Vodun, which Benin honours with a national day."),
  c("ZA", "South Africa", "africa", "ZAR", ["Zulu", "Xhosa", "Afrikaans", "English"], "Eleven official languages and celebrations that carry the country's layered history."),
  c("PH", "Philippines", "southeast-asia", "PHP", ["Filipino", "English", "Cebuano"], "More than 7,000 islands, where almost every town keeps a fiesta for its patron saint."),
  c("MY", "Malaysia", "southeast-asia", "MYR", ["Malay", "English", "Chinese", "Tamil"], "Malay, Chinese, Indian and Indigenous festivals share the calendar, many as public holidays."),
  c("AU", "Australia", "oceania", "AUD", ["English", "Yolŋu Matha", "Kriol"], "Home to the oldest continuous living cultures on earth, those of Aboriginal and Torres Strait Islander peoples."),
  c("NO", "Norway", "europe", "NOK", ["Norwegian", "Northern Sámi"], "From the fjords to Finnmark, where the Sámi Parliament sits in Karasjok."),
  c("FI", "Finland", "europe", "EUR", ["Finnish", "Swedish", "Sámi languages"], "Lakes, forests and the Sámi homeland of the far north."),
  c("BS", "The Bahamas", "latin-america", "BSD", ["English"], "An archipelago where Junkanoo drums mark Boxing Day and New Year."),
  c("TT", "Trinidad and Tobago", "latin-america", "TTD", ["English", "Trinidadian Creole"], "The birthplace of steelpan, calypso and soca, and one of the world's great carnivals."),
];

export const countryByCode = new Map(countries.map((country) => [country.code, country]));

export const countryName = (code: string): string => countryByCode.get(code)?.name ?? code;
