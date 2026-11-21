export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  explanation: string;
  festival: string;
}

/** Every answer here is drawn from the festival guide in src/data/festivals.ts. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "q1", prompt: "Which festival of lights is celebrated by Hindus, Jains and Sikhs?", options: ["Diwali", "Hanukkah", "Vesak", "Songkran"], answer: 0, explanation: "Diwali is kept by Hindu, Jain, Sikh and some Buddhist communities, each with its own story.", festival: "diwali" },
  { id: "q2", prompt: "Thanksgiving in the United States falls on the fourth what of November?", options: ["Monday", "Thursday", "Friday", "Sunday"], answer: 1, explanation: "The fourth Thursday of November, fixed in 1941.", festival: "thanksgiving" },
  { id: "q3", prompt: "What is laid out on a haft-sin table at Nowruz?", options: ["Seven symbolic items", "Nine lamps", "Twelve fruits", "Three loaves"], answer: 0, explanation: "The haft-sin holds seven symbolic items such as sprouted greens, apples and garlic.", festival: "nowruz" },
  { id: "q4", prompt: "Mooncakes are shared at which festival?", options: ["Dragon Boat Festival", "Lunar New Year", "Mid-Autumn Festival", "Hanami"], answer: 2, explanation: "Mooncakes are cut into wedges and shared under the full moon of the eighth lunar month.", festival: "mid-autumn-festival" },
  { id: "q5", prompt: "Which city hosts Gion Matsuri every July?", options: ["Tokyo", "Osaka", "Kyoto", "Nara"], answer: 2, explanation: "Gion Matsuri belongs to Yasaka Shrine and the neighbourhoods of central Kyoto.", festival: "gion-matsuri" },
  { id: "q6", prompt: "Naadam's three games are wrestling, horse racing and…", options: ["Archery", "Falconry", "Polo", "Sword dancing"], answer: 0, explanation: "Wrestling, horse racing and archery make up Mongolia's three games.", festival: "naadam" },
  { id: "q7", prompt: "Songkran is the traditional new year of which country?", options: ["Vietnam", "Thailand", "Japan", "Sri Lanka"], answer: 1, explanation: "Songkran is the Thai New Year, held from 13 to 15 April.", festival: "songkran" },
  { id: "q8", prompt: "For how many nights are Hanukkah candles lit?", options: ["Five", "Seven", "Eight", "Twelve"], answer: 2, explanation: "One more candle is lit on each of eight nights.", festival: "hanukkah" },
  { id: "q9", prompt: "Which flower marks the paths and altars of Día de Muertos?", options: ["Marigold", "Rose", "Lotus", "Jasmine"], answer: 0, explanation: "Cempasúchil, the Mexican marigold, is laid in paths to guide the spirits home.", festival: "dia-de-muertos" },
  { id: "q10", prompt: "Onam welcomes the yearly return of which legendary king?", options: ["Ashoka", "Mahabali", "Vikramaditya", "Rama"], answer: 1, explanation: "Kerala welcomes King Mahabali with flower carpets and a banquet.", festival: "onam" },
  { id: "q11", prompt: "What is given before the Eid al-Fitr prayer so that everyone can celebrate?", options: ["Red envelopes", "Zakat al-fitr", "Gelt", "Zawadi"], answer: 1, explanation: "Zakat al-fitr is charity given before the Eid prayer.", festival: "eid-al-fitr" },
  { id: "q12", prompt: "Oktoberfest began in 1810 as the public celebration of what?", options: ["A harvest", "A royal wedding", "A military victory", "A new brewery"], answer: 1, explanation: "It marked the wedding of Crown Prince Ludwig of Bavaria and Princess Therese.", festival: "oktoberfest" },
  { id: "q13", prompt: "Tteokguk, eaten on Seollal morning in Korea, is a soup of what?", options: ["Sliced rice cakes", "Buckwheat noodles", "Dumplings", "Seaweed only"], answer: 0, explanation: "Finishing a bowl of rice-cake soup is said to make you a year older.", festival: "lunar-new-year" },
  { id: "q14", prompt: "Timkat in Ethiopia celebrates which event?", options: ["The baptism of Jesus", "The finding of the True Cross", "The new year", "The harvest"], answer: 0, explanation: "Timkat is the Ethiopian Orthodox celebration of Epiphany, the baptism in the Jordan.", festival: "timkat" },
  { id: "q15", prompt: "Inti Raymi in Cusco honours what?", options: ["The moon", "The sun", "The rain", "The mountains"], answer: 1, explanation: "Inti is the sun; the festival falls at the southern winter solstice.", festival: "inti-raymi" },
  { id: "q16", prompt: "La Tomatina is held on the last what of August?", options: ["Saturday", "Sunday", "Wednesday", "Friday"], answer: 2, explanation: "The tomato fight in Buñol takes place on the last Wednesday of August.", festival: "la-tomatina" },
  { id: "q17", prompt: "Matariki, which marks the Māori New Year, is which star cluster?", options: ["Orion's Belt", "The Southern Cross", "The Pleiades", "The Hyades"], answer: 2, explanation: "Matariki is the Māori name for the Pleiades.", festival: "matariki" },
  { id: "q18", prompt: "What are the seven principles of Kwanzaa called?", options: ["Nguzo Saba", "Karamu", "Kinara", "Mkeka"], answer: 0, explanation: "Each day of Kwanzaa is dedicated to one of the Nguzo Saba.", festival: "kwanzaa" },
  { id: "q19", prompt: "Zongzi, rice parcels wrapped in leaves, are eaten at which festival?", options: ["Mid-Autumn Festival", "Dragon Boat Festival", "Lunar New Year", "Vesak"], answer: 1, explanation: "Zongzi are the food of Duanwu, the Dragon Boat Festival.", festival: "dragon-boat-festival" },
  { id: "q20", prompt: "During Holi, what is lit on the evening before the colours?", options: ["A bonfire", "Paper lanterns", "Fireworks", "A hanukkiah"], answer: 0, explanation: "Holika Dahan, a bonfire, is lit on the eve of Holi.", festival: "holi" },
];
