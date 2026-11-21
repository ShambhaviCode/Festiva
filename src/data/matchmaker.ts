import type { ActivityType } from "@/domain/types";

/** Occasions that are not tied to a festival in the dataset. */
export const GENERIC_OCCASIONS = [
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "housewarming", label: "Housewarming" },
  { id: "graduation", label: "Graduation" },
  { id: "gathering", label: "A gathering of friends or family" },
] as const;

export interface LibraryActivity {
  title: string;
  detail: string;
  type: ActivityType;
  audiences: string[];
  interests: string[];
  href?: string;
}

const EVERYONE = ["family", "friends", "partner", "colleagues", "children", "community", "solo"];

export const ACTIVITY_LIBRARY: LibraryActivity[] = [
  { title: "Play the FESTIVA culture quiz in teams", detail: "Open Play on a shared screen and split into teams.", type: "games", audiences: ["family", "friends", "colleagues", "children", "community"], interests: ["games"], href: "/play/quiz" },
  { title: "Festival memory match for the children", detail: "A quick card-matching game they can play on a phone or tablet.", type: "games", audiences: ["children", "family"], interests: ["games"], href: "/play/memory" },
  { title: "Design a rangoli together", detail: "Sketch a symmetrical pattern in the Rangoli Designer, then recreate it in chalk, flowers or coloured rice.", type: "crafts", audiences: ["family", "friends", "children", "community", "solo", "partner"], interests: ["crafts"], href: "/play/rangoli" },
  { title: "Make greeting cards for people who could not come", detail: "Use Wishes to create a card each and send them during the celebration.", type: "crafts", audiences: EVERYONE, interests: ["crafts", "gifting"], href: "/wishes" },
  { title: "Cook one dish together", detail: "Choose a dish with a simple folding or shaping step so every guest can take part.", type: "cooking", audiences: ["family", "friends", "partner", "children", "colleagues"], interests: ["food"], href: "/taste" },
  { title: "A potluck with a story", detail: "Each guest brings a dish and tells where it comes from.", type: "cooking", audiences: ["friends", "colleagues", "community", "family"], interests: ["food", "storytelling"] },
  { title: "Share one memory each", detail: "Go round the table: one memory of this celebration, or one hope for the year ahead.", type: "storytelling", audiences: ["family", "friends", "partner", "community", "colleagues"], interests: ["storytelling", "reflection"] },
  { title: "Read the story behind the celebration aloud", detail: "Take turns reading; children can act it out.", type: "storytelling", audiences: ["family", "children", "community"], interests: ["storytelling"], href: "/discover" },
  { title: "Build a shared playlist", detail: "Every guest adds two songs, then play it through the evening.", type: "music-dance", audiences: ["friends", "family", "partner", "colleagues", "community"], interests: ["music"], href: "/sound" },
  { title: "Learn one dance step together", detail: "Pick a simple traditional step and teach it in five minutes.", type: "music-dance", audiences: ["friends", "family", "children", "community", "partner"], interests: ["music"] },
  { title: "A small gift exchange", detail: "Agree a simple theme, such as something handmade or something to eat.", type: "gift-exchange", audiences: ["family", "friends", "colleagues", "partner", "children"], interests: ["gifting"], href: "/shop" },
  { title: "A quiet moment of thanks", detail: "Light a candle and take a minute of silence or a short reading before the meal.", type: "ritual", audiences: EVERYONE, interests: ["reflection"] },
  { title: "A walk before or after the meal", detail: "A short walk together gives everyone a pause and a change of scene.", type: "outdoors", audiences: EVERYONE, interests: ["outdoors"] },
  { title: "Give together", detail: "Collect food, clothes or a small fund for a local cause as part of the day.", type: "giving-back", audiences: EVERYONE, interests: ["reflection"] },
  { title: "Write a letter to open next year", detail: "Each person writes a note to their future self and seals it.", type: "storytelling", audiences: ["solo", "partner", "family", "friends"], interests: ["reflection", "storytelling"] },
  { title: "Plan the journey", detail: "Look up where this celebration is at its most vivid and sketch a future trip.", type: "outdoors", audiences: ["solo", "partner", "family", "friends"], interests: ["travel"], href: "/journeys" },
];

export interface LibraryDecor {
  title: string;
  detail: string;
  styles: string[];
}

export const DECOR_LIBRARY: LibraryDecor[] = [
  { title: "Candles and low, warm lighting", detail: "Switch off overhead lights; group candles or lamps at different heights.", styles: ["traditional", "intimate", "modern", "eco"] },
  { title: "Seasonal flowers and greenery", detail: "Use what is in season locally, in jars and bottles you already own.", styles: ["eco", "intimate", "traditional", "modern"] },
  { title: "One long shared table", detail: "Push tables together and run a single cloth or runner down the middle.", styles: ["grand", "traditional", "modern"] },
  { title: "Paper garlands made by the guests", detail: "Fold and cut them as the first activity, then hang them together.", styles: ["playful", "eco"] },
  { title: "A statement entrance", detail: "Dress the doorway with fabric, flowers or lights so the welcome begins outside.", styles: ["grand", "traditional"] },
  { title: "Reusable fabric bunting and cloth napkins", detail: "Borrow or reuse rather than buying single-use decorations.", styles: ["eco"] },
  { title: "A single colour story", detail: "Pick two colours from the festival and use them for everything from napkins to flowers.", styles: ["modern", "intimate", "grand"] },
  { title: "A photo corner", detail: "A plain wall, a garland and good light are enough.", styles: ["playful", "grand", "modern"] },
  { title: "Handwritten place cards", detail: "Add a line about why each person is there.", styles: ["intimate", "traditional"] },
];

export const DRESS_LIBRARY = [
  { title: "Festive colours, comfortable cut", detail: "Invite guests to wear one bright colour; no one needs to buy anything new.", styles: ["playful", "modern", "eco", "intimate"] },
  { title: "Traditional dress welcome", detail: "Say on the invitation that traditional dress from any culture is welcome.", styles: ["traditional", "grand"] },
  { title: "Something handmade or handed down", detail: "Ask each guest to wear one piece with a story behind it.", styles: ["eco", "intimate", "traditional"] },
];

export const GENERIC_GREETINGS: Record<string, string> = {
  family: "With love to all of you, today and through the year.",
  friends: "So glad to celebrate this with you.",
  partner: "Every celebration is better with you.",
  colleagues: "Wishing you and your family a joyful celebration.",
  children: "Have the happiest day!",
  community: "Warm wishes to everyone celebrating with us.",
  solo: "Here's to a celebration made your own way.",
};
