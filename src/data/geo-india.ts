/**
 * India in FESTIVA's geographic hierarchy: Country → State / Union Territory → festival.
 *
 * Divisions: the 28 states and 8 union territories, as listed by the Government of India
 * (https://knowindia.india.gov.in/states-uts/). Identifiers are the ISO 3166-2 style codes used
 * by the Natural Earth boundaries in /public/geo/admin1-IN.json, so a list entry and its map shape
 * always match. Natural Earth's own state/UT labels contain errors, so the kind below comes from the
 * official list, not from the map file.
 *
 * Festival links never assign a festival to a state just because it is popular nationally. Each link
 * comes from the festival's own sourced record in src/data:
 *   main       the festival's main place in FESTIVA's guide (its coordinates) lies in this division
 *   variation  the guide's "regional variations" describe how this festival is kept in this division
 */
export type IndiaDivisionKind = "state" | "union-territory";

export interface IndiaDivision {
  id: string;
  name: string;
  kind: IndiaDivisionKind;
}

export const INDIA_DIVISIONS_SOURCE = {
  title: "States and Union Territories, Know India (Government of India)",
  url: "https://knowindia.india.gov.in/states-uts/",
};

const S = (id: string, name: string): IndiaDivision => ({ id: `IN-${id}`, name, kind: "state" });
const U = (id: string, name: string): IndiaDivision => ({ id: `IN-${id}`, name, kind: "union-territory" });

export const indiaDivisions: IndiaDivision[] = [
  S("AP", "Andhra Pradesh"), S("AR", "Arunachal Pradesh"), S("AS", "Assam"), S("BR", "Bihar"), S("CT", "Chhattisgarh"),
  S("GA", "Goa"), S("GJ", "Gujarat"), S("HR", "Haryana"), S("HP", "Himachal Pradesh"), S("JH", "Jharkhand"),
  S("KA", "Karnataka"), S("KL", "Kerala"), S("MP", "Madhya Pradesh"), S("MH", "Maharashtra"), S("MN", "Manipur"),
  S("ML", "Meghalaya"), S("MZ", "Mizoram"), S("NL", "Nagaland"), S("OR", "Odisha"), S("PB", "Punjab"),
  S("RJ", "Rajasthan"), S("SK", "Sikkim"), S("TN", "Tamil Nadu"), S("TG", "Telangana"), S("TR", "Tripura"),
  S("UP", "Uttar Pradesh"), S("UT", "Uttarakhand"), S("WB", "West Bengal"),
  U("AN", "Andaman and Nicobar Islands"), U("CH", "Chandigarh"), U("DH", "Dadra and Nagar Haveli and Daman and Diu"),
  U("DL", "Delhi"), U("JK", "Jammu and Kashmir"), U("LA", "Ladakh"), U("LD", "Lakshadweep"), U("PY", "Puducherry"),
];

export const indiaDivisionById = new Map(indiaDivisions.map((d) => [d.id, d]));

export type LinkBasis = "main" | "variation";
export interface FestivalPlaceLink {
  festival: string;
  division: string;
  basis: LinkBasis;
  /** For variation links: the `place` label in the festival's regionalVariations. */
  place?: string;
}

const L = (festival: string, main: string | null, variations: [string, string][] = []): FestivalPlaceLink[] => [
  ...(main ? [{ festival, division: `IN-${main}`, basis: "main" as const }] : []),
  ...variations.map(([code, place]) => ({ festival, division: `IN-${code}`, basis: "variation" as const, place })),
];

export const indiaFestivalLinks: FestivalPlaceLink[] = [
  ...L("diwali", "UP", [["TN", "Tamil Nadu"], ["WB", "West Bengal"], ["GJ", "Gujarat"]]),
  ...L("holi", "UP", [["WB", "West Bengal"], ["PB", "Punjab"]]),
  ...L("durga-puja", "WB"),
  ...L("ganesh-chaturthi", "MH", [["GA", "Goa"]]),
  ...L("onam", "KL"),
  ...L("pongal", "TN"),
  ...L("makar-sankranti", "GJ", [["MH", "Maharashtra"], ["BR", "Bihar and Uttar Pradesh"], ["UP", "Bihar and Uttar Pradesh"], ["TN", "Tamil Nadu and Assam"], ["AS", "Tamil Nadu and Assam"]]),
  ...L("lohri", "PB", [["HR", "Haryana, Delhi and Himachal Pradesh"], ["DL", "Haryana, Delhi and Himachal Pradesh"], ["HP", "Haryana, Delhi and Himachal Pradesh"]]),
  ...L("vasant-panchami", "WB", [["PB", "Punjab"]]),
  ...L("maha-shivaratri", "UP", [["MP", "Ujjain and the jyotirlingas"]]),
  ...L("ugadi-gudi-padwa", "TG", [["AP", "Andhra Pradesh and Telangana"], ["KA", "Karnataka"], ["MH", "Maharashtra"]]),
  ...L("vaisakhi", "PB"),
  ...L("vishu", "KL", [["TN", "Tamil Nadu"], ["KA", "Karnataka coast"]]),
  ...L("bihu", "AS"),
  ...L("ram-navami", "UP", [["TG", "Bhadrachalam, Telangana"]]),
  ...L("rath-yatra", "OR", [["GJ", "Ahmedabad"]]),
  ...L("raksha-bandhan", "DL"),
  ...L("janmashtami", "UP", [["MH", "Mumbai"]]),
  ...L("navratri", "GJ", [["TN", "Tamil Nadu and Karnataka"], ["KA", "Tamil Nadu and Karnataka"], ["WB", "West Bengal"]]),
  ...L("dussehra", "KA", [["HP", "Kullu, Himachal Pradesh"], ["UP", "Varanasi"]]),
  ...L("karva-chauth", "CH", [["PB", "Punjab and Haryana"], ["HR", "Punjab and Haryana"], ["RJ", "Rajasthan and Uttar Pradesh"], ["UP", "Rajasthan and Uttar Pradesh"]]),
  ...L("chhath-puja", "BR", [["UP", "Varanasi"], ["MH", "Mumbai and Delhi"], ["DL", "Mumbai and Delhi"]]),
  ...L("guru-nanak-jayanti", "PB"),
  ...L("hornbill-festival", "NL"),
];

export function linksForDivision(id: string): FestivalPlaceLink[] {
  return indiaFestivalLinks.filter((l) => l.division === id);
}
