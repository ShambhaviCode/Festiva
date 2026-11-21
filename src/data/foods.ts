import type { Allergen, Food } from "@/domain/types";
import { wikiLookup } from "./sources";

/**
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
  f("thandai", "Thandai", "IN", ["holi"], "drink", "vegetarian", ["dairy", "nuts"], ["milk", "almonds", "fennel", "melon seeds", "rose petals", "saffron", "pepper"], "A chilled spiced milk drink that cools the first hot days of spring.", "Thandai"),
  f("khichuri-bhog", "Bhog khichuri", "IN", ["durga-puja"], "main", "vegetarian", ["dairy"], ["gobindobhog rice", "roasted moong dal", "ginger", "ghee", "vegetables"], "Rice and lentils cooked without onion or garlic, offered to the goddess and then served to everyone at the pandal.", "Khichdi_(dish)"),
  f("sandesh", "Sandesh", "IN", ["durga-puja"], "sweet", "vegetarian", ["dairy"], ["fresh chhena (curd cheese)", "sugar or date-palm jaggery"], "A delicate Bengali sweet of kneaded fresh cheese, pressed into moulds.", "Sandesh_(confectionery)"),
  f("modak", "Modak", "IN", ["ganesh-chaturthi"], "sweet", "vegetarian", ["dairy"], ["rice flour", "fresh coconut", "jaggery", "cardamom", "ghee"], "Steamed rice-flour dumplings filled with coconut and jaggery, offered as Ganesha's favourite sweet.", "Modak"),
  f("onam-sadya", "Onam sadya", "IN", ["onam"], "main", "vegetarian", ["dairy", "nuts"], ["rice", "sambar", "avial", "thoran", "pickles", "banana chips", "payasam"], "A vegetarian banquet of two dozen or more dishes served on a banana leaf.", "Sadya"),
  f("sakkarai-pongal", "Sakkarai pongal", "IN", ["pongal"], "sweet", "vegetarian", ["dairy", "nuts"], ["new rice", "moong dal", "jaggery", "ghee", "cashews", "cardamom"], "The sweet rice that gives the festival its name, cooked outdoors until the pot boils over.", "Pongal_(dish)"),
  f("sheer-khurma", "Sheer khurma", "PK", ["eid-al-fitr"], "sweet", "vegetarian", ["dairy", "nuts", "gluten"], ["vermicelli", "milk", "dates", "almonds", "pistachios", "cardamom"], "A warm vermicelli and date milk pudding, the first thing served on Eid morning in many South Asian homes.", "Sheer_khurma"),
  f("biryani", "Biryani", "IN", ["eid-al-fitr", "eid-al-adha"], "main", "none", ["meat", "dairy"], ["basmati rice", "meat", "yoghurt", "fried onions", "saffron", "whole spices"], "Layered spiced rice cooked for gatherings; vegetable versions are common too.", "Biryani"),
  f("maamoul", "Ma'amoul", "EG", ["eid-al-fitr", "eid-al-adha"], "sweet", "vegetarian", ["dairy", "gluten", "nuts"], ["semolina", "butter", "dates or nuts", "orange blossom water"], "Moulded shortbread filled with dates, pistachios or walnuts, baked in quantity before Eid across the Levant and Egypt.", "Ma%27amoul"),
  f("baklava", "Baklava", "TR", ["eid-al-fitr"], "sweet", "vegetarian", ["dairy", "gluten", "nuts"], ["filo pastry", "butter", "pistachios or walnuts", "syrup"], "Layered nut pastry offered to guests during the sugar feast.", "Baklava"),
  f("jiaozi", "Jiaozi", "CN", ["lunar-new-year"], "main", "none", ["gluten", "pork", "meat"], ["wheat wrappers", "pork", "cabbage", "ginger", "spring onion"], "Dumplings folded by the whole family on New Year's Eve in northern China; fillings vary and vegetable versions are easy to make.", "Jiaozi"),
  f("nian-gao", "Nian gao", "CN", ["lunar-new-year"], "sweet", "vegan", [], ["glutinous rice flour", "brown sugar", "water"], "A sticky rice cake whose name sounds like 'higher year', eaten for progress in the year ahead.", "Nian_gao"),
  f("tteokguk", "Tteokguk", "KR", ["lunar-new-year"], "main", "none", ["meat", "egg"], ["sliced rice cakes", "beef broth", "egg", "seaweed", "spring onion"], "Rice-cake soup eaten on Seollal morning; finishing a bowl is said to make you a year older.", "Tteokguk"),
  f("banh-chung", "Bánh chưng", "VN", ["lunar-new-year"], "main", "none", ["pork", "meat"], ["glutinous rice", "mung beans", "pork", "dong leaves"], "A square parcel of sticky rice boiled for hours, made by families together for Tết.", "B%C3%A1nh_ch%C6%B0ng"),
  f("mooncake", "Mooncake", "CN", ["mid-autumn-festival"], "sweet", "none", ["gluten", "egg"], ["lotus seed paste", "salted egg yolk", "wheat pastry", "golden syrup"], "Dense filled pastries cut into wedges and shared with tea. Traditional recipes may use lard; many modern ones do not.", "Mooncake"),
  f("songpyeon", "Songpyeon", "KR", ["mid-autumn-festival"], "sweet", "vegan", ["nuts"], ["rice flour", "sesame", "chestnut or beans", "honey or sugar", "pine needles"], "Half-moon rice cakes steamed over pine needles for Chuseok. Some fillings use honey.", "Songpyeon"),
  f("zongzi", "Zongzi", "CN", ["dragon-boat-festival"], "main", "none", ["pork", "meat"], ["glutinous rice", "bamboo leaves", "pork, beans or dates"], "Leaf-wrapped rice parcels, savoury in the south and sweet in the north.", "Zongzi"),
  f("hanami-dango", "Hanami dango", "JP", ["hanami"], "sweet", "vegan", [], ["rice flour", "sugar", "natural colouring"], "Three rice dumplings on a skewer in pink, white and green, eaten under the blossom.", "Dango"),
  f("sakura-mochi", "Sakura mochi", "JP", ["hanami"], "sweet", "vegan", [], ["glutinous rice", "red bean paste", "salted cherry leaf"], "Pink rice cake filled with sweet bean paste and wrapped in a pickled cherry leaf.", "Sakuramochi"),
  f("khao-chae", "Khao chae", "TH", ["songkran"], "main", "none", ["fish", "meat"], ["rice in jasmine-scented iced water", "shrimp-paste balls", "stuffed peppers", "sweet shredded pork"], "A hot-season dish of rice in flower-scented water with small savoury sides, associated with Songkran.", "Khao_chae"),
  f("mango-sticky-rice", "Mango sticky rice", "TH", ["songkran"], "sweet", "vegan", [], ["glutinous rice", "coconut milk", "ripe mango", "palm sugar"], "A dessert at its best in April, when mangoes are in season.", "Mango_sticky_rice"),
  f("sabzi-polo-ba-mahi", "Sabzi polo ba mahi", "IR", ["nowruz"], "main", "none", ["fish"], ["rice", "dill", "coriander", "parsley", "chives", "white fish", "saffron"], "Herbed rice with fish, the traditional meal for the first day of Nowruz.", "Sabzi_polo"),
  f("samanu", "Samanu", "IR", ["nowruz"], "sweet", "vegan", ["gluten"], ["sprouted wheat", "flour", "water"], "A sweet paste made by slowly cooking sprouted wheat, placed on the haft-sin table as a symbol of strength.", "Samanu"),
  f("latkes", "Latkes", "IL", ["hanukkah"], "snack", "vegetarian", ["egg", "gluten"], ["potato", "onion", "egg", "flour or matzo meal", "oil"], "Crisp potato pancakes fried in oil, served with apple sauce or sour cream.", "Latke"),
  f("sufganiyot", "Sufganiyot", "IL", ["hanukkah"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["yeast dough", "jam", "icing sugar", "oil"], "Jam-filled doughnuts sold by the tray in Israel throughout Hanukkah.", "Sufganiyah"),
  f("panettone", "Panettone", "IT", ["christmas"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["enriched dough", "candied citrus", "raisins", "butter"], "A tall, airy Milanese fruit bread shared through the Christmas season.", "Panettone"),
  f("tamales", "Tamales", "MX", ["christmas", "dia-de-muertos"], "main", "none", ["meat", "pork"], ["maize dough (masa)", "lard", "chillies", "meat or beans", "corn husks"], "Steamed maize parcels made in large batches by families for Christmas and for the altar at Día de Muertos.", "Tamale"),
  f("pan-de-muerto", "Pan de muerto", "MX", ["dia-de-muertos"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["enriched dough", "orange blossom water", "anise", "sugar"], "A soft sweet loaf topped with bone-shaped dough, placed on the altar and shared.", "Pan_de_muerto"),
  f("mole", "Mole", "MX", ["dia-de-muertos"], "main", "none", ["meat", "nuts"], ["dried chillies", "chocolate", "nuts and seeds", "spices", "turkey or chicken"], "A long-simmered sauce of chillies, seeds and chocolate, cooked for the most important occasions.", "Mole_(sauce)"),
  f("torrijas", "Torrijas", "ES", ["semana-santa"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["day-old bread", "milk", "egg", "cinnamon", "sugar or honey"], "Bread soaked in spiced milk, fried and sweetened; the taste of Holy Week in Spain.", "Torrija"),
  f("paella-valenciana", "Paella valenciana", "ES", ["la-tomatina"], "main", "none", ["meat"], ["rice", "chicken", "rabbit", "green and white beans", "saffron"], "Valencia's rice dish, cooked outdoors over a wood fire. Buñol holds a paella contest on the eve of La Tomatina.", "Paella"),
  f("feijoada", "Feijoada", "BR", ["rio-carnival"], "main", "none", ["pork", "meat"], ["black beans", "pork", "beef", "bay leaf", "orange slices", "rice"], "Brazil's black bean and meat stew, a weekend staple in Rio that fuels long carnival days.", "Feijoada"),
  f("brezel", "Brezel", "DE", ["oktoberfest"], "snack", "vegetarian", ["gluten"], ["wheat flour", "yeast", "lye wash", "coarse salt"], "Large soft pretzels, sold in every festival tent.", "Pretzel"),
  f("hendl", "Hendl", "DE", ["oktoberfest"], "main", "none", ["meat"], ["chicken", "butter", "parsley", "paprika"], "Spit-roasted chicken, the classic Oktoberfest plate.", "Roast_chicken"),
  f("soda-bread", "Irish soda bread", "IE", ["st-patricks-day"], "snack", "vegetarian", ["gluten", "dairy"], ["wheat flour", "buttermilk", "bicarbonate of soda", "salt"], "A quick loaf raised with buttermilk and soda rather than yeast.", "Soda_bread"),
  f("irish-stew", "Irish stew", "IE", ["st-patricks-day"], "main", "none", ["meat"], ["lamb or mutton", "potatoes", "onions", "carrots"], "A plain, slow-cooked stew that is a fixture of St Patrick's Day menus.", "Irish_stew"),
  f("doro-wat", "Doro wat", "ET", ["timkat", "meskel"], "main", "none", ["meat", "egg", "dairy"], ["chicken", "berbere spice", "onions", "spiced butter", "boiled eggs"], "A deep red chicken stew cooked for feast days and eaten with injera.", "Doro_wat"),
  f("injera", "Injera", "ET", ["timkat"], "main", "vegan", [], ["teff flour", "water"], "A sour fermented flatbread that is plate and cutlery in one. Outside Ethiopia it is often blended with wheat, so check if avoiding gluten.", "Injera"),
  f("chicha-de-jora", "Chicha de jora", "PE", ["inti-raymi"], "drink", "vegan", ["alcohol", "gluten"], ["germinated maize", "water"], "A fermented maize beer of the Andes, offered to the sun and the earth in ceremonies.", "Chicha_de_jora"),
  f("pumpkin-pie", "Pumpkin pie", "US", ["thanksgiving"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["pumpkin", "eggs", "cream", "cinnamon", "nutmeg", "pastry"], "A spiced custard pie that closes the Thanksgiving meal.", "Pumpkin_pie"),
  f("roast-turkey", "Roast turkey", "US", ["thanksgiving"], "main", "none", ["meat"], ["turkey", "herbs", "stuffing", "gravy"], "The centrepiece of most Thanksgiving tables.", "Turkey_as_food"),
  f("sill-och-potatis", "Pickled herring with new potatoes", "SE", ["midsummer"], "main", "none", ["fish", "dairy"], ["pickled herring", "new potatoes", "dill", "sour cream", "chives"], "The Midsummer lunch plate, eaten outdoors.", "Pickled_herring"),
  f("jordgubbstarta", "Jordgubbstårta", "SE", ["midsummer"], "sweet", "vegetarian", ["gluten", "egg", "dairy"], ["sponge cake", "whipped cream", "fresh strawberries"], "A cream and strawberry layer cake made with the first berries of summer.", "Strawberry_cake"),
  f("khuushuur", "Khuushuur", "MN", ["naadam"], "snack", "none", ["meat", "gluten"], ["wheat dough", "minced mutton or beef", "onion"], "Fried meat pastries eaten hot at the festival grounds.", "Khuushuur"),
  f("jollof-rice", "Jollof rice", "GH", ["kwanzaa"], "main", "none", ["meat"], ["rice", "tomato", "peppers", "onion", "stock", "spices"], "A West African one-pot rice. It is a frequent choice for the Karamu feast, which draws on dishes from across Africa and the diaspora. Often cooked with meat stock; vegetable versions are easy to make.", "Jollof_rice"),
  f("hangi", "Hāngī", "NZ", ["matariki"], "main", "none", ["meat"], ["meat", "kūmara (sweet potato)", "pumpkin", "cabbage"], "Food slow-cooked in an earth oven over heated stones, prepared for gatherings.", "H%C4%81ngi"),
  // Added in FESTIVA 1.2 with the new festivals.
  f("kpokpoi", "Kpokpoi", "GH", ["homowo"], "main", "none", ["fish"], ["steamed unfermented corn meal", "palm oil", "okra", "palm-nut soup with fish"], "Steamed corn meal mixed with palm oil and okra, eaten with palm-nut soup: the Homowo meal that chiefs sprinkle through the town.", "Homowo"),
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
