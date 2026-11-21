import type { Artist, Genre, Playlist } from "@/domain/types";

/**
 * SOUND is a discovery guide. FESTIVA does not host or stream audio.
 * Listening links open a search for the artist or song on licensed services
 * (YouTube, Spotify, Apple Music), where official releases can be played.
 */
export const genres: Genre[] = [
  { slug: "k-pop", name: "K-pop", origin: "South Korea", about: "Tightly produced pop built around idol groups, choreography and a global fan culture." },
  { slug: "j-pop", name: "J-pop", origin: "Japan", about: "Japanese popular music, from city pop and idol groups to anime themes and singer-songwriters." },
  { slug: "bollywood", name: "Bollywood", origin: "India", about: "Songs from Hindi cinema, blending Indian classical and folk forms with pop, and sung by playback singers." },
  { slug: "afrobeats", name: "Afrobeats", origin: "Nigeria and Ghana", about: "Contemporary West African pop drawing on highlife, hip hop and dancehall." },
  { slug: "latin", name: "Latin", origin: "Latin America", about: "A wide family of Spanish- and Portuguese-language popular music, from cumbia and samba to Latin pop." },
  { slug: "salsa", name: "Salsa", origin: "Cuba, Puerto Rico and New York", about: "Dance music rooted in Cuban son, shaped by Caribbean communities in New York in the 1960s and 70s." },
  { slug: "reggaeton", name: "Reggaeton", origin: "Puerto Rico and Panama", about: "Spanish-language urban music driven by the dembow rhythm." },
  { slug: "jazz", name: "Jazz", origin: "United States", about: "Born in African American communities of New Orleans; defined by swing, blue notes and improvisation." },
  { slug: "blues", name: "Blues", origin: "United States", about: "African American music of the Deep South, the root of much rock, soul and jazz." },
  { slug: "classical", name: "Classical", origin: "Worldwide", about: "Art-music traditions, including European classical and India's Hindustani and Carnatic systems." },
  { slug: "rock", name: "Rock", origin: "United States and United Kingdom", about: "Guitar-led popular music that grew from rock and roll in the 1950s into countless styles." },
  { slug: "electronic", name: "Electronic", origin: "Worldwide", about: "Music made with synthesisers, drum machines and computers, from Kraftwerk to house and techno." },
  { slug: "indie", name: "Indie", origin: "Worldwide", about: "Independently minded pop and rock, usually associated with smaller labels and a do-it-yourself approach." },
  { slug: "folk", name: "Folk", origin: "Worldwide", about: "Songs passed down in communities, and the singer-songwriter traditions that grew from them." },
  { slug: "traditional", name: "Traditional", origin: "Worldwide", about: "Ceremonial, devotional and regional music performed on instruments and in forms specific to a culture." },
  { slug: "world", name: "World Music", origin: "Worldwide", about: "A broad label for artists who bring regional traditions to international audiences." },
];

const ar = (name: string, genre: string, country: string, languages: string[], songs: string[] = []): Artist => ({ name, genre, country, languages, songs });

export const artists: Artist[] = [
  ar("BTS", "k-pop", "South Korea", ["Korean", "English"], ["Dynamite", "Spring Day"]),
  ar("BLACKPINK", "k-pop", "South Korea", ["Korean", "English"], ["How You Like That"]),
  ar("IU", "k-pop", "South Korea", ["Korean"], ["Good Day"]),
  ar("Hikaru Utada", "j-pop", "Japan", ["Japanese", "English"], ["First Love"]),
  ar("YOASOBI", "j-pop", "Japan", ["Japanese"], ["Idol"]),
  ar("Kenshi Yonezu", "j-pop", "Japan", ["Japanese"], ["Lemon"]),
  ar("A. R. Rahman", "bollywood", "India", ["Hindi", "Tamil"], ["Jai Ho"]),
  ar("Arijit Singh", "bollywood", "India", ["Hindi", "Bengali"], ["Tum Hi Ho"]),
  ar("Lata Mangeshkar", "bollywood", "India", ["Hindi", "Marathi"], ["Lag Jaa Gale"]),
  ar("Shreya Ghoshal", "bollywood", "India", ["Hindi", "Bengali"], []),
  ar("Burna Boy", "afrobeats", "Nigeria", ["English", "Yoruba", "Pidgin"], ["Last Last"]),
  ar("Wizkid", "afrobeats", "Nigeria", ["English", "Yoruba"], ["Essence"]),
  ar("Tems", "afrobeats", "Nigeria", ["English"], ["Free Mind"]),
  ar("Shakira", "latin", "Colombia", ["Spanish", "English"], ["Hips Don't Lie"]),
  ar("Juanes", "latin", "Colombia", ["Spanish"], ["La Camisa Negra"]),
  ar("Caetano Veloso", "latin", "Brazil", ["Portuguese"], []),
  ar("Celia Cruz", "salsa", "Cuba", ["Spanish"], ["La Vida Es Un Carnaval"]),
  ar("Héctor Lavoe", "salsa", "Puerto Rico", ["Spanish"], ["El Cantante"]),
  ar("Marc Anthony", "salsa", "United States", ["Spanish", "English"], ["Vivir Mi Vida"]),
  ar("Daddy Yankee", "reggaeton", "Puerto Rico", ["Spanish"], ["Gasolina"]),
  ar("Bad Bunny", "reggaeton", "Puerto Rico", ["Spanish"], ["Tití Me Preguntó"]),
  ar("Karol G", "reggaeton", "Colombia", ["Spanish"], ["Provenza"]),
  ar("Miles Davis", "jazz", "United States", ["Instrumental"], ["So What"]),
  ar("Ella Fitzgerald", "jazz", "United States", ["English"], ["Summertime"]),
  ar("John Coltrane", "jazz", "United States", ["Instrumental"], ["My Favorite Things"]),
  ar("B.B. King", "blues", "United States", ["English"], ["The Thrill Is Gone"]),
  ar("Muddy Waters", "blues", "United States", ["English"], ["Mannish Boy"]),
  ar("Ludwig van Beethoven", "classical", "Germany", ["Instrumental"], ["Symphony No. 9"]),
  ar("Ravi Shankar", "classical", "India", ["Instrumental"], []),
  ar("M. S. Subbulakshmi", "classical", "India", ["Sanskrit", "Tamil"], []),
  ar("The Beatles", "rock", "United Kingdom", ["English"], ["Hey Jude"]),
  ar("Queen", "rock", "United Kingdom", ["English"], ["Bohemian Rhapsody"]),
  ar("Soda Stereo", "rock", "Argentina", ["Spanish"], ["De Música Ligera"]),
  ar("Daft Punk", "electronic", "France", ["English"], ["One More Time"]),
  ar("Kraftwerk", "electronic", "Germany", ["German", "English"], ["Autobahn"]),
  ar("Black Coffee", "electronic", "South Africa", ["Instrumental", "English"], []),
  ar("Arctic Monkeys", "indie", "United Kingdom", ["English"], ["Do I Wanna Know?"]),
  ar("Phoebe Bridgers", "indie", "United States", ["English"], ["Motion Sickness"]),
  ar("Prateek Kuhad", "indie", "India", ["Hindi", "English"], ["cold/mess"]),
  ar("Bob Dylan", "folk", "United States", ["English"], ["Blowin' in the Wind"]),
  ar("Joan Baez", "folk", "United States", ["English", "Spanish"], ["Diamonds & Rust"]),
  ar("Violeta Parra", "folk", "Chile", ["Spanish"], ["Gracias a la Vida"]),
  ar("The Chieftains", "traditional", "Ireland", ["Instrumental", "Irish"], []),
  ar("Nusrat Fateh Ali Khan", "traditional", "Pakistan", ["Urdu", "Punjabi"], []),
  ar("Zakir Hussain", "traditional", "India", ["Instrumental"], []),
  ar("Youssou N'Dour", "world", "Senegal", ["Wolof", "French", "English"], ["7 Seconds"]),
  ar("Cesária Évora", "world", "Cape Verde", ["Cape Verdean Creole"], ["Sodade"]),
  ar("Tinariwen", "world", "Mali", ["Tamasheq"], []),
  ar("Buena Vista Social Club", "world", "Cuba", ["Spanish"], ["Chan Chan"]),
];

export const playlists: Playlist[] = [
  {
    slug: "festival-of-lights-evening",
    title: "An evening of lamps",
    mood: "Warm, melodic and unhurried, for Diwali or any candlelit table.",
    tracks: [
      { artist: "Lata Mangeshkar", song: "Lag Jaa Gale" },
      { artist: "A. R. Rahman", song: "Jai Ho" },
      { artist: "Arijit Singh", song: "Tum Hi Ho" },
      { artist: "Prateek Kuhad", song: "cold/mess" },
    ],
  },
  {
    slug: "carnival-energy",
    title: "Carnival energy",
    mood: "For dancing: salsa, reggaeton and Latin pop.",
    tracks: [
      { artist: "Celia Cruz", song: "La Vida Es Un Carnaval" },
      { artist: "Marc Anthony", song: "Vivir Mi Vida" },
      { artist: "Daddy Yankee", song: "Gasolina" },
      { artist: "Shakira", song: "Hips Don't Lie" },
      { artist: "Karol G", song: "Provenza" },
    ],
  },
  {
    slug: "new-year-table",
    title: "Around the new year table",
    mood: "East Asian pop for a long family dinner.",
    tracks: [
      { artist: "IU", song: "Good Day" },
      { artist: "BTS", song: "Spring Day" },
      { artist: "Hikaru Utada", song: "First Love" },
      { artist: "Kenshi Yonezu", song: "Lemon" },
    ],
  },
  {
    slug: "late-night-standards",
    title: "Late-night standards",
    mood: "Jazz and blues for when the guests stay on.",
    tracks: [
      { artist: "Miles Davis", song: "So What" },
      { artist: "Ella Fitzgerald", song: "Summertime" },
      { artist: "John Coltrane", song: "My Favorite Things" },
      { artist: "B.B. King", song: "The Thrill Is Gone" },
    ],
  },
  {
    slug: "world-gathering",
    title: "A gathering of the world",
    mood: "Voices from four continents.",
    tracks: [
      { artist: "Youssou N'Dour", song: "7 Seconds" },
      { artist: "Cesária Évora", song: "Sodade" },
      { artist: "Buena Vista Social Club", song: "Chan Chan" },
      { artist: "Violeta Parra", song: "Gracias a la Vida" },
      { artist: "Burna Boy", song: "Last Last" },
    ],
  },
];

export const genreBySlug = new Map(genres.map((genre) => [genre.slug, genre]));

export function listenLinks(query: string): { label: string; url: string }[] {
  const q = encodeURIComponent(query);
  return [
    { label: "YouTube", url: `https://www.youtube.com/results?search_query=${q}` },
    { label: "Spotify", url: `https://open.spotify.com/search/${q}` },
    { label: "Apple Music", url: `https://music.apple.com/search?term=${q}` },
  ];
}
