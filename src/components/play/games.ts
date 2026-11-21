export const GAMES = [
  { slug: "memory", scoreKey: "memory", title: "Festival Memory Match", blurb: "Turn over cards to pair up sixteen festival tiles in as few moves as you can." },
  { slug: "quiz", scoreKey: "quiz", title: "Global Culture Quiz", blurb: "Eight multiple-choice questions drawn from the festival guide, with the story behind each answer." },
  { slug: "rangoli", scoreKey: "rangoli", title: "Rangoli Pattern Designer", blurb: "Sketch a symmetrical floor pattern in colour and download it." },
  { slug: "challenge", scoreKey: "challenge", title: "Festival Knowledge Challenge", blurb: "Sixty seconds of true or false, with bonus points for streaks." },
  { slug: "puzzle", scoreKey: "puzzle", title: "Cultural Puzzle", blurb: "Slide eight tiles back into place to restore the rosette." },
] as const;

export type GameSlug = (typeof GAMES)[number]["slug"];
