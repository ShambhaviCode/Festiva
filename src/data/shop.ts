import type { Brand, GiftCategory, GiftIdea, GiftTier } from "@/domain/types";
import { wikiLookup } from "./sources";

/**
 * SHOP is a curated discovery catalogue, not a store.
 * - Brands listed here are catalogue examples. FESTIVA has no partnership,
 *   affiliation or commercial relationship with any of them.
 * - No prices, discounts, ratings, reviews or stock levels are shown, because
 *   FESTIVA has no live product feed. Tiers describe a brand's general
 *   positioning, as an editorial judgement.
 * - Links go to each brand's own website. Verify details there.
 */
const b = (
  slug: string,
  name: string,
  origin: string,
  tier: GiftTier,
  categories: GiftCategory[],
  about: string,
  knownFor: string[],
  officialUrl: string,
  wikiPage: string,
): Brand => ({
  slug,
  name,
  origin,
  tier,
  categories,
  about,
  knownFor,
  officialUrl,
  source: { title: `${name} on Wikipedia`, url: wikiLookup(wikiPage) },
});

export const brands: Brand[] = [
  b("fabindia", "Fabindia", "India", "everyday", ["fashion", "home-lifestyle", "cultural"], "An Indian retailer founded in 1960 that sells garments, furnishings and food made with traditional craft techniques.", ["Handloom and block-printed clothing", "Home textiles", "Craft-based gifts"], "https://www.fabindia.com/", "Fabindia"),
  b("biba", "Biba", "India", "everyday", ["fashion"], "An Indian womenswear label, begun in 1988, known for ready-to-wear ethnic clothing.", ["Kurta sets", "Festive suits", "Girls' occasion wear"], "https://www.biba.in/", "Biba_Apparels"),
  b("manyavar", "Manyavar", "India", "premium", ["fashion"], "An Indian celebration-wear brand for men, founded in Kolkata in 1999.", ["Kurtas and Nehru jackets", "Sherwanis", "Wedding wear"], "https://www.manyavar.com/", "Manyavar"),
  b("anita-dongre", "Anita Dongre", "India", "premium", ["fashion", "jewellery"], "The label of Mumbai designer Anita Dongre, known for lehengas and for work with craft communities.", ["Lightweight lehengas", "Hand embroidery", "Occasion wear"], "https://www.anitadongre.com/", "Anita_Dongre"),
  b("sabyasachi", "Sabyasachi", "India", "elite", ["fashion", "jewellery"], "The Kolkata couture house of designer Sabyasachi Mukherjee, founded in 1999.", ["Bridal couture", "Heritage textiles", "Fine jewellery"], "https://www.sabyasachi.com/", "Sabyasachi_Mukherjee"),
  b("giva", "GIVA", "India", "everyday", ["jewellery", "personalised"], "A Bengaluru jewellery brand founded in 2019, focused on silver.", ["Silver pendants and rings", "Everyday jewellery", "Gift sets"], "https://www.giva.co/", "Giva_(company)"),
  b("tanishq", "Tanishq", "India", "premium", ["jewellery"], "A jewellery brand of the Titan Company, part of the Tata Group, launched in the 1990s.", ["Gold jewellery", "Diamond jewellery", "Festival and wedding collections"], "https://www.tanishq.co.in/", "Tanishq"),
  b("swarovski", "Swarovski", "Austria", "premium", ["jewellery", "home-lifestyle"], "An Austrian crystal maker founded in 1895.", ["Crystal jewellery", "Figurines and ornaments", "Watches"], "https://www.swarovski.com/", "Swarovski"),
  b("cartier", "Cartier", "France", "elite", ["jewellery"], "A French jeweller and watchmaker founded in Paris in 1847.", ["Fine jewellery", "Watches", "Leather goods and fragrance"], "https://www.cartier.com/", "Cartier_(jeweler)"),
  b("haldirams", "Haldiram's", "India", "everyday", ["sweets-gourmet"], "An Indian sweets and snacks company that traces its origins to a shop in Bikaner in 1937.", ["Boxed Indian sweets", "Namkeen snacks", "Festival gift packs"], "https://www.haldirams.com/", "Haldiram%27s"),
  b("lindt", "Lindt", "Switzerland", "everyday", ["sweets-gourmet"], "The Swiss chocolatier Lindt & Sprüngli, with roots in Zürich in 1845.", ["Chocolate truffles", "Bars", "Seasonal gift boxes"], "https://www.lindt.com/", "Lindt_%26_Spr%C3%BCngli"),
  b("godiva", "Godiva", "Belgium", "premium", ["sweets-gourmet"], "A chocolatier founded in Brussels in 1926.", ["Boxed chocolate pralines", "Truffles", "Gift assortments"], "https://www.godiva.com/", "Godiva_Chocolatier"),
  b("good-earth", "Good Earth", "India", "premium", ["home-lifestyle", "cultural", "fashion"], "An Indian design house founded in 1996, known for home ware and apparel drawing on subcontinental craft.", ["Tableware", "Home fragrance and candles", "Textiles"], "https://www.goodearth.in/", "Good_Earth_(company)"),
  b("nicobar", "Nicobar", "India", "premium", ["home-lifestyle", "fashion"], "A contemporary Indian lifestyle label launched in 2016 as a sister brand to Good Earth.", ["Relaxed clothing", "Tableware", "Travel accessories"], "https://www.nicobar.com/", "Nicobar_(brand)"),
];

export const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));

const g = (
  slug: string,
  title: string,
  category: GiftCategory,
  tiers: GiftTier[],
  recipients: string[],
  festivals: string[],
  interests: string[],
  note: string,
  brandSlugs: string[],
): GiftIdea => ({ slug, title, category, tiers, recipients, festivals, interests, note, brands: brandSlugs });

const ANY = ["any"];
const ALL = ["family", "friends", "partner", "colleagues", "children", "community", "solo"];

/** Gift ideas are suggestions by type. They are not product listings and carry no prices. */
export const giftIdeas: GiftIdea[] = [
  g("sweets-box", "A box of traditional sweets", "sweets-gourmet", ["everyday", "premium"], ALL, ["diwali", "eid-al-fitr", "holi", "durga-puja", "pongal"], ["food"], "The most widely welcome festival gift in South Asia. Check dietary needs first.", ["haldirams"]),
  g("chocolate-assortment", "A chocolate assortment", "sweets-gourmet", ["everyday", "premium"], ALL, ["christmas", "hanukkah", "eid-al-fitr", "thanksgiving"], ["food"], "An easy shared gift for a household or a team.", ["lindt", "godiva"]),
  g("dried-fruit-and-nuts", "A tray of dried fruit and nuts", "sweets-gourmet", ["everyday", "premium"], ["family", "colleagues", "community", "friends"], ["diwali", "nowruz", "eid-al-fitr", "eid-al-adha"], ["food"], "A traditional choice for Diwali, Nowruz and Eid visits. Not suitable for nut allergies.", ["haldirams", "fabindia"]),
  g("handloom-textile", "A handloom stole or scarf", "fashion", ["everyday", "premium"], ["family", "friends", "partner", "colleagues"], ANY, ["fashion", "crafts"], "A handwoven piece supports craft communities and suits most ages.", ["fabindia", "nicobar", "anita-dongre"]),
  g("festive-outfit", "A festive outfit", "fashion", ["everyday", "premium"], ["family", "partner", "children"], ["diwali", "eid-al-fitr", "eid-al-adha", "durga-puja", "onam"], ["fashion"], "New clothes are part of many festivals. Best for someone whose size and taste you know.", ["biba", "manyavar", "fabindia"]),
  g("couture-piece", "A couture or heirloom garment", "fashion", ["elite"], ["family", "partner"], ANY, ["fashion"], "A once-in-a-lifetime piece for a milestone, usually chosen together.", ["sabyasachi", "anita-dongre"]),
  g("silver-jewellery", "Silver jewellery", "jewellery", ["everyday"], ["family", "friends", "partner"], ANY, ["fashion", "gifting"], "Small pendants, rings or earrings make a personal gift at a modest tier.", ["giva"]),
  g("gold-jewellery", "Gold or diamond jewellery", "jewellery", ["premium"], ["family", "partner"], ["diwali", "eid-al-fitr", "onam"], ["gifting"], "Buying gold is considered auspicious at several festivals, notably around Diwali.", ["tanishq"]),
  g("crystal-keepsake", "A crystal ornament or keepsake", "jewellery", ["premium"], ["family", "friends", "colleagues", "partner"], ["christmas", "lunar-new-year"], ["gifting"], "A decorative keepsake for a home or desk.", ["swarovski"]),
  g("fine-jewellery", "Fine jewellery or a watch", "jewellery", ["elite"], ["family", "partner"], ANY, ["gifting"], "For major milestones; often selected in person.", ["cartier", "sabyasachi"]),
  g("tableware", "Hand-finished tableware", "home-lifestyle", ["premium"], ["family", "friends", "colleagues", "community"], ANY, ["food"], "Serving bowls, platters or cups that will be used at the next gathering.", ["good-earth", "nicobar"]),
  g("candles-fragrance", "Candles or home fragrance", "home-lifestyle", ["everyday", "premium"], ALL, ["diwali", "christmas", "hanukkah", "vesak", "matariki"], ["reflection"], "Light is a shared symbol of many festivals, which makes candles a fitting gift.", ["good-earth", "fabindia"]),
  g("brass-lamp", "A brass or clay lamp", "cultural", ["everyday", "premium"], ["family", "friends", "community", "colleagues"], ["diwali", "onam", "pongal", "durga-puja"], ["crafts", "reflection"], "A lamp to light during the festival and keep for next year.", ["fabindia", "good-earth"]),
  g("craft-kit", "A craft kit to make together", "cultural", ["everyday"], ["children", "family", "friends"], ANY, ["crafts", "games"], "Lantern, rangoli, mask or origami kits turn the gift into an activity.", []),
  g("book-of-stories", "A book of the festival's stories", "cultural", ["everyday"], ["children", "family", "friends", "solo"], ANY, ["storytelling", "reflection"], "An illustrated retelling for children or a cultural history for adults.", []),
  g("personalised-card", "A personalised greeting card", "personalised", ["everyday"], ALL, ANY, ["crafts", "gifting"], "Make one in FESTIVA Wishes and print it or send it.", []),
  g("photo-album", "A printed photo album of the day", "personalised", ["everyday", "premium"], ["family", "partner", "friends"], ANY, ["storytelling"], "Collect pictures during the celebration and print them afterwards.", []),
  g("engraved-keepsake", "An engraved keepsake", "personalised", ["premium"], ["family", "partner", "colleagues"], ANY, ["gifting"], "A name or date engraved on jewellery or a small object.", ["giva", "tanishq"]),
  g("charity-donation", "A donation made in their name", "personalised", ["everyday", "premium", "elite"], ALL, ["eid-al-fitr", "eid-al-adha", "vesak", "thanksgiving", "christmas"], ["reflection"], "Giving is central to many festivals; choose a cause the person cares about.", []),
  g("plant", "A flowering plant", "home-lifestyle", ["everyday"], ALL, ["nowruz", "lunar-new-year", "midsummer", "hanami"], ["outdoors"], "Hyacinths for Nowruz, blossom branches or kumquat trees for Lunar New Year.", []),
  g("tea-set", "Tea and a tea set", "sweets-gourmet", ["everyday", "premium"], ["family", "friends", "colleagues", "solo"], ["mid-autumn-festival", "lunar-new-year", "nowruz"], ["food", "reflection"], "Tea accompanies mooncakes, New Year visits and Nowruz sweets alike.", ["nicobar", "good-earth"]),
  g("experience", "An experience to share", "personalised", ["premium", "elite"], ["partner", "family", "friends"], ANY, ["travel", "music", "food"], "A concert, a cooking class or a trip to see the festival where it began.", []),
];

export const CATEGORY_LABELS: Record<GiftCategory, string> = {
  fashion: "Fashion",
  jewellery: "Jewellery",
  "sweets-gourmet": "Sweets and gourmet",
  "home-lifestyle": "Home and lifestyle",
  personalised: "Personalised gifts",
  cultural: "Cultural products",
};

export const TIER_LABELS: Record<GiftTier, string> = {
  everyday: "Everyday",
  premium: "Premium",
  elite: "Elite luxury",
};
