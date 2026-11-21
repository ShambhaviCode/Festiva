import type { Attire } from "@/domain/types";
import { wikiLookup } from "./sources";

const a = (
  slug: string,
  name: string,
  country: string,
  festivals: string[],
  summary: string,
  textiles: string[],
  craftsmanship: string,
  wearing: string,
  contemporary: string,
  brands: string[],
  wikiPage: string,
): Attire => ({
  slug,
  name,
  country,
  festivals,
  summary,
  textiles,
  craftsmanship,
  wearing,
  contemporary,
  brands,
  source: { title: `${name} on Wikipedia`, url: wikiLookup(wikiPage) },
});

export const attire: Attire[] = [
  a("sari", "Sari", "IN", ["diwali", "durga-puja", "pongal"], "An unstitched length of cloth, usually five to nine metres, draped over a blouse and petticoat in dozens of regional styles.", ["Banarasi silk brocade", "Kanchipuram silk", "Bengal cotton and jamdani", "Chanderi"], "Handloom saris can take weeks to weave; motifs and borders identify the weaving centre.", "Anyone may wear a sari to a celebration when invited to. Ask a host or a shop to help with draping.", "Designers pair saris with shirts, belts and jackets, and pre-draped versions are widely sold.", ["fabindia", "sabyasachi", "anita-dongre"], "Sari"),
  a("lehenga-choli", "Lehenga choli", "IN", ["diwali", "durga-puja", "holi"], "A full skirt, fitted blouse and long scarf, worn for festivals, garba nights and weddings.", ["Silk", "Georgette", "Bandhani tie-dye", "Mirror-work cotton"], "Embroidery traditions include zardozi metal thread, gota patti ribbon work and mirror work.", "Lighter cotton sets are worn for Navratri dancing; heavier embroidered ones for evening functions.", "Lightweight, pocketed and sustainably made lehengas are a focus of several contemporary labels.", ["anita-dongre", "biba", "sabyasachi"], "Gagra_choli"),
  a("sherwani-kurta", "Kurta and sherwani", "IN", ["diwali", "eid-al-fitr", "ganesh-chaturthi"], "The kurta is a long tunic worn daily and for festivals; the sherwani is its formal, structured relative.", ["Cotton", "Silk", "Linen", "Brocade"], "Chikankari from Lucknow and block printing from Rajasthan are among the best-known kurta crafts.", "A plain kurta with trousers suits almost any South Asian celebration.", "Short kurtas, Nehru jackets and indo-western cuts are common festive choices.", ["manyavar", "fabindia", "sabyasachi"], "Kurta"),
  a("kasavu", "Kasavu sari and mundu", "IN", ["onam"], "Off-white handloom cotton with a gold border, worn across Kerala for Onam.", ["Handloom cotton", "Zari (gold thread) border"], "Balaramapuram, Chendamangalam and Kuthampully are known weaving centres.", "Both the sari and the men's mundu are worn by people of every community in Kerala at Onam.", "Coloured borders and kasavu fabric in dresses and shirts are popular updates.", ["fabindia"], "Kerala_sari"),
  a("shalwar-kameez", "Shalwar kameez", "PK", ["eid-al-fitr", "eid-al-adha"], "A tunic over loose trousers, worn by men and women across South Asia and the standard choice for Eid.", ["Lawn cotton", "Silk", "Chiffon"], "Embroidery, block print and hand-finished necklines distinguish festive sets.", "New clothes for Eid morning are a cherished custom; modest cuts are usual for prayers.", "Each season brings new Eid collections in changing lengths and silhouettes.", ["biba", "fabindia"], "Shalwar_kameez"),
  a("hanfu", "Hanfu", "CN", ["lunar-new-year", "mid-autumn-festival"], "Historical Han Chinese dress of flowing robes and cross-collars, revived by a large youth movement.", ["Silk", "Linen", "Brocade"], "Styles reference specific dynasties, from Tang high-waisted skirts to Ming pleated mamianqun.", "Often worn for festivals, photographs and visits to historic sites.", "Everyday hanfu mixes historical cuts with modern fabrics.", [], "Hanfu"),
  a("qipao", "Qipao", "CN", ["lunar-new-year"], "A fitted one-piece dress with a high collar and side fastenings, also called cheongsam.", ["Silk brocade", "Velvet", "Cotton"], "Hand-knotted pankou buttons and piped edges mark careful tailoring.", "Red and gold are favoured at New Year; white and black are generally avoided for celebrations.", "Looser cuts and shorter lengths have brought it back into daily wear.", [], "Cheongsam"),
  a("hanbok", "Hanbok", "KR", ["lunar-new-year", "mid-autumn-festival"], "Korean dress of a short jacket with a full skirt or loose trousers, in clear colours and simple lines.", ["Silk", "Ramie", "Cotton"], "The curve of the sleeve and the tie of the jacket ribbon (goreum) are points of pride.", "Worn for Seollal and Chuseok family rites; visitors can rent hanbok near the palaces in Seoul.", "Modern hanbok shortens the skirt and simplifies fastenings for everyday use.", [], "Hanbok"),
  a("kimono-yukata", "Kimono and yukata", "JP", ["gion-matsuri", "hanami"], "The kimono is Japan's formal wrapped robe; the yukata is its light cotton summer form, worn to festivals.", ["Silk", "Cotton", "Hemp"], "Dyeing techniques such as yuzen and shibori, and woven obi from Nishijin in Kyoto, are highly regarded.", "Wrap left side over right. Yukata are the easy choice for summer festivals and are widely rented.", "Designers use denim, wool and bold prints, and pair kimono with boots.", [], "Kimono"),
  a("ao-dai", "Áo dài", "VN", ["lunar-new-year"], "A long, close-fitting tunic split at the sides and worn over trousers.", ["Silk", "Brocade", "Velvet"], "Tailored to the wearer; hand-painted and embroidered versions are made for Tết.", "Worn by women and men for Tết visits and photographs among the blossom.", "Shorter, looser versions called áo dài cách tân are popular with younger wearers.", [], "%C3%81o_d%C3%A0i"),
  a("chut-thai", "Chut thai", "TH", ["songkran"], "Thai formal dress in several codified styles, with a wrapped skirt and shoulder cloth for women.", ["Thai silk", "Mudmee ikat", "Cotton"], "Handwoven silk from the north-east is prized for its texture and sheen.", "At Songkran many people wear light floral shirts or traditional dress for temple visits.", "Thai textiles are increasingly used in contemporary tailoring.", [], "Formal_Thai_national_costume"),
  a("tracht", "Dirndl and lederhosen", "DE", ["oktoberfest"], "Alpine folk dress: a bodice, blouse, skirt and apron for women, leather breeches for men.", ["Linen", "Cotton", "Loden wool", "Deerskin leather"], "Good lederhosen are embroidered by hand and last decades.", "By popular custom the side on which the apron bow is tied signals whether the wearer is single or attached.", "Shorter 'festival' dirndls are widely sold, though many locals prefer traditional lengths.", [], "Dirndl"),
  a("mantilla", "Mantilla", "ES", ["semana-santa"], "A lace veil worn over a high comb, in black for Holy Week.", ["Blonde lace", "Chantilly lace", "Tortoiseshell-style comb"], "Fine mantillas are handmade lace heirlooms passed through families.", "Worn with a black dress on Holy Thursday and Good Friday; it is mourning dress, not costume.", "White mantillas appear at weddings and spring fairs.", [], "Mantilla"),
  a("fantasia", "Carnival fantasia", "BR", ["rio-carnival"], "The costume of a samba school parader, designed each year around the school's theme.", ["Feathers", "Sequins", "Beads", "Lightweight frames"], "Workshops in each school's barracão build thousands of costumes by hand in the months before carnival.", "Street parties are relaxed: any bright, playful outfit fits in.", "Schools increasingly use synthetic feathers and recycled materials.", [], "Rio_Carnival"),
  a("habesha-kemis", "Habesha kemis", "ET", ["timkat"], "An ankle-length white cotton dress with woven borders, worn with a shawl (netela).", ["Handwoven cotton (shemma)", "Coloured tibeb borders"], "The tibeb border is woven on narrow looms in intricate geometric patterns.", "White is worn by both women and men to Timkat processions.", "Designers shorten hems and add colour while keeping the handwoven cloth.", [], "Habesha_kemis"),
  a("deel", "Deel", "MN", ["naadam"], "A long wrapped robe with a high collar, tied with a sash and worn by herders and city-dwellers alike.", ["Silk", "Cotton", "Sheepskin lining for winter"], "Cut, trim and hat style identify regions and ethnic groups.", "Families dress in their best deel for Naadam's opening ceremony.", "Tailors make fitted, lighter deel for urban wear.", [], "Deel_(clothing)"),
  a("kente", "Kente", "GH", ["kwanzaa"], "Strip-woven cloth from the Asante and Ewe peoples of Ghana, with patterns that carry names and meanings.", ["Silk", "Cotton", "Rayon"], "Narrow strips are woven on horizontal looms and sewn edge to edge.", "In Ghana it is prestige cloth for important occasions. In the diaspora, kente stoles and accents are worn at Kwanzaa and graduations.", "Printed kente patterns are common; handwoven cloth remains the mark of quality.", [], "Kente_cloth"),
  a("midsommarkrans", "Midsummer flower crown", "SE", ["midsummer"], "A wreath of wildflowers and birch leaves made on the morning of Midsummer Eve.", ["Wildflowers", "Birch twigs", "Florist's wire"], "Traditionally made from whatever grows nearby.", "Worn by everyone, usually with light summer clothes or regional folk dress.", "Florists sell ready-made crowns in the cities.", [], "Midsummer"),
];

export const attireBySlug = new Map(attire.map((item) => [item.slug, item]));
