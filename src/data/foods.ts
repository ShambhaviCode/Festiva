import type { Allergen, Food } from "@/domain/types";
import { wikiLookup } from "./sources";

/**
 * FESTIVA lists vegetarian dishes only: no meat or fish in the typical preparation.
 * Dietary flags describe the *typical* preparation and are a guide only.
 * Recipes vary by household and region: always confirm ingredients with the
 * cook or supplier, especially for allergies.
 */
const f = (
  slug: string,
  name: string,
  country: string,
  festivals: string[],
  type: Food["type"],
  diet: "vegan" | "vegetarian" | "none",
  contains: Allergen[],
  ingredients: string[],
  background: string,
  wikiPage: string,
): Food => ({
  slug,
  name,
  country,
  festivals,
  type,
  vegetarian: diet !== "none",
  vegan: diet === "vegan",
  contains,
  ingredients,
  background,
  source: { title: `${name} on Wikipedia`, url: wikiLookup(wikiPage) },
});

export const foods: Food[] = [
  f("gulab-jamun", "Gulab jamun", "IN", ["diwali", "eid-al-fitr"], "sweet", "vegetarian", ["dairy", "gluten"], ["milk solids (khoya)", "flour", "sugar syrup", "cardamom", "rose water"], "Soft fried dumplings of reduced milk soaked in scented syrup, served at celebrations across South Asia.", "Gulab_jamun"),
  f("kaju-katli", "Kaju katli", "IN", ["diwali"], "sweet", "vegetarian", ["nuts", "dairy"], ["cashew nuts", "sugar", "ghee", "edible silver leaf"], "Thin diamond-cut cashew fudge, one of the most gifted sweets at Diwali.", "Kaju_katli"),
  f("chakli", "Chakli", "IN", ["diwali"], "snack", "vegan", ["gluten"], ["rice flour", "gram flour", "sesame", "cumin", "chilli"], "A crisp spiral snack made in batches before Diwali and shared with visitors. Flour blends vary, so check for wheat.", "Chakli"),
  f("gujiya", "Gujiya", "IN", ["holi"], "sweet", "vegetarian", ["dairy", "gluten", "nuts"], ["flour", "khoya", "dried fruit", "nuts", "ghee"], "Crescent pastries filled with sweetened milk solids and nuts, made in north Indian homes for Holi.", "Gujiya"),
  f("thandai", "Thandai", "IN", ["holi", "maha-shivaratri"], "drink", "vegetarian", ["dairy", "nuts"], ["milk", "almonds", "fennel", "melon seeds", "rose petals", "saffron", "pepper"], "A chilled spiced milk drink that cools the first hot days of spring.", "Thandai"),
  f("khichuri-bhog", "Bhog khichuri", "IN", ["durga-puja"], "main", "vegetarian", ["dairy"], ["gobindobhog rice", "roasted moong dal", "ginger", "ghee", "vegetables"], "Rice and lentils cooked without onion or garlic, offered to the goddess and then served to everyone at the pandal.", "Khichdi_(dish)"),
  f("sandesh", "Sandesh", "IN", ["durga-puja"], "sweet", "vegetarian", ["dairy"], ["fresh chhena (curd cheese)", "sugar or date-palm jaggery"], "A delicate Bengali sweet of kneaded fresh cheese, pressed into moulds.", "Sandesh_(confectionery)"),
  f("modak", "Modak", "IN", ["ganesh-chaturthi"], "sweet", "vegetarian", ["dairy"], ["rice flour", "fresh coconut", "jaggery", "cardamom", "ghee"], "Steamed rice-flour dumplings filled with coconut and jaggery, offered as Ganesha's favourite sweet.", "Modak"),
  f("onam-sadya", "Onam sadya", "IN", ["onam"], "main", "vegetarian", ["dairy", "nuts"], ["rice", "sambar", "avial", "thoran", "pickles", "banana chips", "payasam"], "A vegetarian banquet of two dozen or more dishes served on a banana leaf.", "Sadya"),
  f("sakkarai-pongal", "Sakkarai pongal", "IN", ["pongal"], "sweet", "vegetarian", ["dairy", "nuts"], ["new rice", "moong dal", "jaggery", "ghee", "cashews", "cardamom"], "The sweet rice that gives the festival its name, cooked outdoors until the pot boils over.", "Pongal_(dish)"),
  f("sheer-khurma", "Sheer khurma", "PK", ["eid-al-fitr"], "sweet", "vegetarian", ["dairy", "nuts", "gluten"], ["vermicelli", "milk", "dates", "almonds", "pistachios", "cardamom"], "A warm vermicelli and date milk pudding, the first thing served on Eid morning in many South Asian homes.", "Sheer_khurma"),
  f("maamoul", "Ma'amoul", "EG", ["eid-al-fitr", "eid-al-adha"], "sweet", "vegetarian", ["dairy", "gluten", "nuts"], ["semolina", "butter", "dates or nuts", "orange blossom water"], "Moulded shortbread filled with dates, pistachios or walnuts, baked in quantity before Eid across the Levant and Egypt.", "Ma%27amoul"),
  f("baklava", "Baklava", "TR", ["eid-al-fitr"], "sweet", "vegetarian", ["dairy", "gluten", "nuts"], ["filo pastry", "butter", "pistachios or walnuts", "syrup"], "Layered nut pastry offered to guests during the sugar feast.", "Baklava"),
  f("nian-gao", "Nian gao", "CN", ["lunar-new-year"], "sweet", "vegan", [], ["glutinous rice flour", "brown sugar", "water"], "A sticky rice cake whose name sounds like 'higher year', eaten for progress in the year ahead.", "Nian_gao"),
  f("songpyeon", "Songpyeon", "KR", ["mid-autumn-festival"], "sweet", "vegan", ["nuts"], ["rice flour", "sesame", "chestnut or beans", "honey or sugar", "pine needles"], "Half-moon rice cakes steamed over pine needles for Chuseok. Some fillings use honey.", "Songpyeon"),
  f("zongzi", "Sweet zongzi", "CN", ["dragon-boat-festival"], "sweet", "vegan", [], ["glutinous rice", "bamboo leaves", "red bean paste or jujube dates"], "Leaf-wrapped rice parcels for the Dragon Boat Festival. Savoury versions with pork are common in the south; in the north they are usually sweet, filled with red bean paste or dates.", "Zongzi"),
  f("jollof-rice", "Jollof rice", "GH", ["kwanzaa"], "main", "vegan", [], ["rice", "tomato", "peppers", "onion", "vegetable stock", "spices"], "A West African one-pot rice dish cooked in a spiced tomato base, shared at celebrations. Many recipes use meat stock; vegetarian versions use vegetable stock.", "Jollof_rice"),
  f("kpokpoi", "Kpokpoi", "GH", ["homowo"], "main", "vegan", [], ["steamed corn meal", "palm oil", "okra"], "Steamed corn meal mixed with palm oil and okra: the Homowo meal that chiefs sprinkle through the town. It is traditionally eaten with palm-nut soup, which is often made with fish.", "Homowo"),
  f("hanami-dango", "Hanami dango", "JP", ["hanami"], "sweet", "vegan", [], ["rice flour", "sugar", "natural colouring"], "Three rice dumplings on a skewer in pink, white and green, eaten under the blossom.", "Dango"),
  f("sakura-mochi", "Sakura mochi", "JP", ["hanami"], "sweet", "vegan", [], ["glutinous rice", "red bean paste", "salted cherry leaf"], "Pink rice cake filled with sweet bean paste and wrapped in a pickled cherry leaf.", "Sakuramochi"),
  f("mango-sticky-rice", "Mango sticky rice", "TH", ["songkran"], "sweet", "vegan", [], ["glutinous rice", "coconut milk", "ripe mango", "palm sugar"], "A dessert at its best in April, when mangoes are in season.", "Mango_sticky_rice"),
  f("samanu", "Samanu", "IR", ["nowruz"], "sweet", "vegan", ["gluten"], ["sprouted wheat", "flour", "water"], "A sweet paste made by slowly cooking sprouted wheat, placed on the haft-sin table as a symbol of strength.", "Samanu"),
  f("latkes", "Latkes", "IL", ["hanukkah"], "snack", "vegetarian", ["egg", "gluten"], ["potato", "onion", "egg", "flour or matzo meal", "oil"], "Crisp potato pancakes fried in oil, served with apple sauce or sour cream.", "Latke"),
  f("sufganiyot", "Sufganiyot", "IL", ["hanukkah"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["yeast dough", "jam", "icing sugar", "oil"], "Jam-filled doughnuts sold by the tray in Israel throughout Hanukkah.", "Sufganiyah"),
  f("panettone", "Panettone", "IT", ["christmas"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["enriched dough", "candied citrus", "raisins", "butter"], "A tall, airy Milanese fruit bread shared through the Christmas season.", "Panettone"),
  f("pan-de-muerto", "Pan de muerto", "MX", ["dia-de-muertos"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["enriched dough", "orange blossom water", "anise", "sugar"], "A soft sweet loaf topped with bone-shaped dough, placed on the altar and shared.", "Pan_de_muerto"),
  f("torrijas", "Torrijas", "ES", ["semana-santa"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["day-old bread", "milk", "egg", "cinnamon", "sugar or honey"], "Bread soaked in spiced milk, fried and sweetened; the taste of Holy Week in Spain.", "Torrija"),
  f("brezel", "Brezel", "DE", ["oktoberfest"], "snack", "vegetarian", ["gluten"], ["wheat flour", "yeast", "lye wash", "coarse salt"], "Large soft pretzels, sold in every festival tent.", "Pretzel"),
  f("soda-bread", "Irish soda bread", "IE", ["st-patricks-day"], "snack", "vegetarian", ["gluten", "dairy"], ["wheat flour", "buttermilk", "bicarbonate of soda", "salt"], "A quick loaf raised with buttermilk and soda rather than yeast.", "Soda_bread"),
  f("injera", "Injera", "ET", ["timkat"], "main", "vegan", [], ["teff flour", "water"], "A sour fermented flatbread that is plate and cutlery in one. Outside Ethiopia it is often blended with wheat, so check if avoiding gluten.", "Injera"),
  f("chicha-de-jora", "Chicha de jora", "PE", ["inti-raymi"], "drink", "vegan", ["alcohol", "gluten"], ["germinated maize", "water"], "A fermented maize beer of the Andes, offered to the sun and the earth in ceremonies.", "Chicha_de_jora"),
  f("pumpkin-pie", "Pumpkin pie", "US", ["thanksgiving"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["pumpkin", "eggs", "cream", "cinnamon", "nutmeg", "pastry"], "A spiced custard pie that closes the Thanksgiving meal.", "Pumpkin_pie"),
  f("jordgubbstarta", "Jordgubbstårta", "SE", ["midsummer"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["sponge cake", "whipped cream", "fresh strawberries"], "A cream and strawberry layer cake made with the first berries of summer.", "Strawberry_cake"),
  // Added in FESTIVA 1.2 with the new festivals.
  // Indian festival foods added 22 November 2026 (all vegetarian).
  f("tilkut", "Tilkut", "IN", ["makar-sankranti"], "sweet", "vegan", [], ["sesame seeds", "jaggery or sugar"], "A pounded sesame and jaggery sweet from Bihar, eaten at Makar Sankranti. Contains sesame.", "Tilkut"),
  f("gajak", "Gajak", "IN", ["lohri", "makar-sankranti"], "sweet", "vegetarian", ["nuts", "dairy"], ["sesame seeds", "jaggery", "peanuts", "ghee"], "Brittle sesame and jaggery bars, a winter favourite offered to the Lohri bonfire and shared round it.", "Gajak"),
  f("sarson-da-saag", "Sarson da saag with makki di roti", "IN", ["lohri", "vaisakhi"], "main", "vegetarian", ["dairy"], ["mustard greens", "spinach", "maize flour", "ginger", "white butter"], "Slow-cooked mustard greens with maize-flour flatbread and white butter, the classic Punjabi winter meal.", "Sarson_da_saag"),
  f("ugadi-pachadi", "Ugadi pachadi", "IN", ["ugadi-gudi-padwa"], "snack", "vegan", [], ["neem flowers", "jaggery", "tamarind", "raw mango", "salt", "chilli"], "A small dish of six tastes eaten first thing at Ugadi, for the mix of experiences in the year ahead.", "Ugadi_pachadi"),
  f("til-pitha", "Til pitha", "IN", ["bihu"], "sweet", "vegan", [], ["sticky rice flour", "black sesame", "jaggery"], "Thin rolled rice crêpes filled with sesame and jaggery, made in Assamese homes for Bihu.", "Pitha"),
  f("panakam", "Panakam", "IN", ["ram-navami"], "drink", "vegan", [], ["jaggery", "water", "black pepper", "dry ginger", "cardamom"], "A cooling jaggery drink spiced with pepper and ginger, offered and shared on Ram Navami in South India.", "Panakam"),
  f("khaja", "Khaja", "IN", ["rath-yatra"], "sweet", "vegetarian", ["gluten", "dairy"], ["wheat flour", "ghee", "sugar syrup"], "Flaky layered pastry soaked in syrup, famous as a Jagannath temple offering in Puri.", "Khaja"),
  f("ghevar", "Ghevar", "IN", ["raksha-bandhan"], "sweet", "vegetarian", ["gluten", "dairy", "nuts"], ["flour", "ghee", "milk", "sugar syrup", "pistachios"], "A honeycomb disc of fried batter soaked in syrup, often topped with rabri: the monsoon sweet of Rajasthan.", "Ghevar"),
  f("sabudana-khichdi", "Sabudana khichdi", "IN", ["navratri"], "main", "vegan", ["nuts"], ["tapioca pearls", "peanuts", "potato", "cumin", "green chilli"], "Tapioca pearls tossed with peanuts and potato, a favourite fasting dish during Navratri. Some cooks add ghee.", "Sabudana_Khichadi"),
  f("mathri", "Mathri", "IN", ["karva-chauth"], "snack", "vegetarian", ["gluten", "dairy"], ["wheat flour", "ghee", "carom seeds"], "Flaky savoury crackers, part of the sargi platter and the evening puja on Karva Chauth.", "Mathri"),
  f("thekua", "Thekua", "IN", ["chhath-puja"], "sweet", "vegetarian", ["gluten", "dairy"], ["wheat flour", "jaggery", "ghee", "coconut", "fennel"], "Crunchy jaggery cookies pressed with patterns and offered to the sun at Chhath.", "Thekua"),
  f("kada-prasad", "Kada prasad", "IN", ["guru-nanak-jayanti", "vaisakhi"], "sweet", "vegetarian", ["gluten", "dairy"], ["wheat flour", "ghee", "sugar", "water"], "A warm wheat-flour halwa offered to everyone at the gurdwara as a blessing.", "Karah_Parshad"),
  // World festival foods added 22 November 2026 (all vegetarian).
  f("tompouce", "Tompouce", "NL", ["kings-day"], "sweet", "vegetarian", ["gluten", "dairy", "egg"], ["puff pastry", "custard cream", "icing (orange for King's Day)"], "A rectangular custard pastry whose icing turns orange for King's Day.", "Tompouce"),
  f("blini", "Blini", "RU", ["maslenitsa"], "main", "vegetarian", ["gluten", "dairy", "egg"], ["flour", "milk", "eggs", "butter", "yeast"], "Thin pancakes eaten every day of Maslenitsa, their round golden shape a symbol of the returning sun.", "Blini"),
  f("tsoureki", "Tsoureki", "GR", ["orthodox-easter-greece"], "sweet", "vegetarian", ["gluten", "dairy", "egg"], ["flour", "butter", "eggs", "mahlepi", "mastic"], "A braided sweet Easter bread scented with mahlepi and mastic, often baked with a red egg.", "Tsoureki"),
  f("mont-lone-yay-paw", "Mont lone yay paw", "MM", ["thingyan"], "sweet", "vegan", [], ["glutinous rice flour", "jaggery", "grated coconut"], "Rice-flour balls filled with jaggery, made and shared at Thingyan; one may hide a chilli as a prank.", "Mont_lone_yay_baw"),
  f("ambok", "Ambok", "KH", ["bon-om-touk"], "snack", "vegan", [], ["young rice, roasted and pounded flat", "coconut", "banana"], "Flattened young rice mixed with coconut and banana, eaten at midnight to salute the moon at Bon Om Touk.", "Ambok"),
  f("maple-taffy", "Maple taffy", "CA", ["quebec-winter-carnival"], "sweet", "vegan", [], ["maple syrup", "fresh snow"], "Hot maple syrup poured on snow and rolled onto a stick as it sets: tire d'érable.", "Maple_taffy"),
  f("basler-mehlsuppe", "Basler Mehlsuppe", "CH", ["basel-fasnacht"], "main", "vegetarian", ["gluten", "dairy"], ["browned flour", "butter", "stock", "onion", "grated cheese"], "Basel's browned-flour soup, eaten in the small hours after the Morgestraich.", "Mehlsuppe"),
  // Second world batch foods, added 22 November 2026 (all vegetarian).
  f("mazurek", "Mazurek", "PL", ["smigus-dyngus"], "sweet", "vegetarian", ["gluten", "dairy", "egg", "nuts"], ["shortcrust pastry", "caramel or chocolate", "nuts", "dried fruit"], "A flat Easter cake decorated with nuts and dried fruit, made for the Polish Easter table.", "Mazurek_(cake)"),
  f("varenyky", "Varenyky", "UA", ["kupala-night"], "main", "vegetarian", ["gluten", "dairy"], ["flour", "potato", "onion", "sour cream", "cherries for a sweet version"], "Ukraine's filled dumplings, made with potato, cheese or summer cherries.", "Varenyky"),
  f("kurtoskalacs", "Kürtőskalács", "HU", ["busojaras"], "sweet", "vegetarian", ["gluten", "dairy", "egg"], ["sweet yeast dough", "sugar", "cinnamon", "walnuts"], "Chimney cake: sweet dough wound on a spit, roasted over embers and rolled in sugar.", "Kürtőskalács"),
  f("banitsa", "Banitsa", "BG", ["baba-marta"], "main", "vegetarian", ["gluten", "dairy", "egg"], ["filo pastry", "white brine cheese", "eggs", "yoghurt"], "Bulgaria's layered filo pastry with cheese, baked for holidays and often hiding lucky charms at New Year.", "Banitsa"),
  f("tangyuan", "Tangyuan", "TW", ["taiwan-lantern-festival"], "sweet", "vegan", [], ["glutinous rice flour", "black sesame paste", "ginger syrup"], "Sweet glutinous rice balls in syrup, eaten at the Lantern Festival for family togetherness.", "Tangyuan_(food)"),
  f("mandazi", "Mandazi", "KE", ["lamu-cultural-festival"], "snack", "vegetarian", ["gluten"], ["flour", "coconut milk", "cardamom", "sugar"], "Lightly sweet Swahili fried bread flavoured with coconut and cardamom.", "Mandazi"),
  f("colada-morada", "Colada morada", "EC", ["dia-de-los-difuntos-ecuador"], "drink", "vegan", [], ["purple corn flour", "blackberries", "naranjilla", "pineapple", "cinnamon", "cloves"], "A thick spiced purple fruit drink made for the Day of the Dead.", "Colada_morada"),
  // Third world batch foods, added 22 November 2026 (all vegetarian).
  f("vanillekipferl", "Vanillekipferl", "AT", ["krampuslauf"], "sweet", "vegetarian", ["gluten", "dairy", "nuts"], ["flour", "butter", "ground almonds or walnuts", "vanilla sugar"], "Crescent biscuits dusted with vanilla sugar, baked in Austrian homes through Advent.", "Vanillekipferl"),
  f("janu-siers", "Jāņu siers", "LV", ["janu"], "snack", "vegetarian", ["dairy", "egg"], ["curd cheese", "milk", "eggs", "butter", "caraway seeds"], "A round caraway cheese, its shape and colour like the sun, eaten at midsummer.", "Jāņu_siers"),
  f("cozonac", "Cozonac", "RO", ["martisor"], "sweet", "vegetarian", ["gluten", "dairy", "egg", "nuts"], ["sweet yeast dough", "walnuts", "cocoa", "raisins"], "A swirled sweet bread filled with walnuts and cocoa, baked for spring and winter holidays.", "Cozonac"),
  f("khao-niao", "Sticky rice (khao niao)", "LA", ["boun-bang-fai"], "main", "vegan", [], ["glutinous rice", "water"], "Steamed glutinous rice, the heart of every Lao meal, eaten by hand from a woven basket.", "Glutinous_rice"),
  f("roast-breadfruit", "Roast breadfruit", "JM", ["accompong-maroon-festival"], "main", "vegan", [], ["breadfruit", "coconut oil"], "Breadfruit roasted whole over a fire, a staple of Jamaican and Maroon cooking.", "Breadfruit"),
  // Fourth world batch foods, added 22 November 2026 (all vegetarian).
  f("ballokume", "Ballokume", "AL", ["dita-e-veres"], "sweet", "vegetarian", ["dairy", "egg"], ["cornmeal", "butter", "sugar", "eggs"], "Crumbly cornmeal biscuits from Elbasan, baked for Summer Day.", "Ballokume"),
  f("churchkhela", "Churchkhela", "GE", ["rtveli"], "sweet", "vegan", ["nuts"], ["walnuts or hazelnuts", "thickened grape juice", "flour"], "Strings of nuts dipped in thickened grape must and dried, made at harvest time.", "Churchkhela"),
  // Fifth world batch foods, added 22 November 2026 (all vegetarian).
  f("ftira", "Ftira", "MT", ["mnarja"], "main", "vegan", ["gluten"], ["sourdough", "olive oil", "tomatoes", "capers", "olives"], "Malta's ring-shaped sourdough bread, often filled with tomato, capers and olives.", "Ftira"),
  f("chipa", "Chipa", "PY", ["san-juan-ara"], "snack", "vegetarian", ["dairy", "egg"], ["cassava starch", "cheese", "eggs", "anise"], "Small baked rings of cassava starch and cheese, sold at every Paraguayan fair.", "Chipa"),
];

export const foodBySlug = new Map(foods.map((food) => [food.slug, food]));

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: "dairy",
  nuts: "nuts",
  gluten: "gluten",
  egg: "egg",
  pork: "pork",
  alcohol: "alcohol",
  meat: "meat",
  fish: "fish",
};
