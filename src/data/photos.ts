/**
 * Photographs for festivals, dishes, attire and places. Every image is from Wikimedia Commons under a free
 * licence (CC BY, CC BY-SA, CC0 or public domain), stored in /public/photos
 * and credited where it is shown. Festivals without a suitable free photo keep
 * FESTIVA's generated artwork. Sourced 22 November 2026.
 */
export interface Photo {
  src: string;
  width: number;
  height: number;
  artist: string;
  license: string;
  licenseUrl: string | null;
  source: string;
  title: string;
}

export const FESTIVAL_PHOTOS: Record<string, Photo> = {
  "diwali": {
    "src": "/photos/festivals/diwali.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Ara Basu",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Diya_Lamp.jpg",
    "title": "Diya Lamp.jpg"
  },
  "holi": {
    "src": "/photos/festivals/holi.jpg",
    "width": 1280,
    "height": 970,
    "artist": "FaceMePLS",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Holi_Feest_2008_meisjes.jpg",
    "title": "Holi Feest 2008 meisjes.jpg"
  },
  "durga-puja": {
    "src": "/photos/festivals/durga-puja.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Slyronit",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Idol_at_Chittaranjan_Park_Cooperative_Pandal_Durga_Puja_in_2017.jpg",
    "title": "Idol at Chittaranjan Park Cooperative Pandal Durga Puja in 2017.jpg"
  },
  "ganesh-chaturthi": {
    "src": "/photos/festivals/ganesh-chaturthi.jpg",
    "width": 941,
    "height": 1250,
    "artist": "Ashish Suryavanshi858",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Ganesh_chaturthi_puja_03.jpg",
    "title": "Ganesh chaturthi puja 03.jpg"
  },
  "onam": {
    "src": "/photos/festivals/onam.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Shreesha Sharma",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Onam_Pookalam_Kasaragod.jpg",
    "title": "Onam Pookalam Kasaragod.jpg"
  },
  "pongal": {
    "src": "/photos/festivals/pongal.jpg",
    "width": 1000,
    "height": 666,
    "artist": "This Photo was taken by Timothy A. Gonsalves. Feel free to use my photos, but pl",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kolam_Pongal_ThiruViKa_Uthandi_Jan23_A7C_04890.jpg",
    "title": "Kolam Pongal ThiruViKa Uthandi Jan23 A7C 04890.jpg"
  },
  "eid-al-fitr": {
    "src": "/photos/festivals/eid-al-fitr.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Mumun96",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Eid_al-Fitr_prayer_at_the_Al-Hikmah_Kebonsari_Mosque.jpg",
    "title": "Eid al-Fitr prayer at the Al-Hikmah Kebonsari Mosque.jpg"
  },
  "eid-al-adha": {
    "src": "/photos/festivals/eid-al-adha.jpg",
    "width": 1280,
    "height": 720,
    "artist": "MOAYED WALEED",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Eid_al-Adha_Prayer_at_the_Sayyid_Al-Hassan_Shrine_in_Kassala.jpg",
    "title": "Eid al-Adha Prayer at the Sayyid Al-Hassan Shrine in Kassala.jpg"
  },
  "lunar-new-year": {
    "src": "/photos/festivals/lunar-new-year.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Dileep Kaluaratchie",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chinese_New_Year_Celebrations_with_Lanterns_in_Singapore.jpg",
    "title": "Chinese New Year Celebrations with Lanterns in Singapore.jpg"
  },
  "mid-autumn-festival": {
    "src": "/photos/festivals/mid-autumn-festival.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Shizhao",
    "license": "CC BY-SA 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5",
    "source": "https://commons.wikimedia.org/wiki/File:Mid-Autumn_Festival-beijing.jpg",
    "title": "Mid-Autumn Festival-beijing.jpg"
  },
  "dragon-boat-festival": {
    "src": "/photos/festivals/dragon-boat-festival.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Stewart~惡龍",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Eastern_District_Dragon_Boat_Race_-_2008-06-01_09h52m48s_SN201360.jpg",
    "title": "Eastern District Dragon Boat Race - 2008-06-01 09h52m48s SN201360.jpg"
  },
  "hanami": {
    "src": "/photos/festivals/hanami.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Original uploader was Vickerman625 at en.wikipedia",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Cherry_Blossom_Picnic.JPG",
    "title": "Cherry Blossom Picnic.JPG"
  },
  "gion-matsuri": {
    "src": "/photos/festivals/gion-matsuri.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Immanuelle",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gion_Matsuri_Float_1.jpg",
    "title": "Gion Matsuri Float 1.jpg"
  },
  "songkran": {
    "src": "/photos/festivals/songkran.jpg",
    "width": 1280,
    "height": 853,
    "artist": "CEphoto, Uwe Aranas",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chiang-Mai_Thailand_Songkran-Festival-2017-03.jpg",
    "title": "Chiang-Mai Thailand Songkran-Festival-2017-03.jpg"
  },
  "vesak": {
    "src": "/photos/festivals/vesak.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Albert Ivan Damanik",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Indonesia_Buddhists_Vesak_Day.jpg",
    "title": "Indonesia Buddhists Vesak Day.jpg"
  },
  "nowruz": {
    "src": "/photos/festivals/nowruz.jpg",
    "width": 1280,
    "height": 854,
    "artist": "Katzenfee50",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Haft-sin,_Nowruz,_Still-life-3205068.jpg",
    "title": "Haft-sin, Nowruz, Still-life-3205068.jpg"
  },
  "hanukkah": {
    "src": "/photos/festivals/hanukkah.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Gatorfan252525",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_modern,_nickelplate_Hanukkah_menorah_with_5_candles_lit.jpg",
    "title": "A modern, nickelplate Hanukkah menorah with 5 candles lit.jpg"
  },
  "christmas": {
    "src": "/photos/festivals/christmas.jpg",
    "width": 948,
    "height": 1250,
    "artist": "Jernej Furman from Maribor, Slovenia",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Christmas_tree_decorated_with_baubles,_boho_ornaments_and_golden_lights._Merry_Christmas!_(51783650592).jpg",
    "title": "Christmas tree decorated with baubles, boho ornaments and golden lights. Merry Christmas! (51783650592).jpg"
  },
  "semana-santa": {
    "src": "/photos/festivals/semana-santa.jpg",
    "width": 1280,
    "height": 815,
    "artist": "Mcknightspear",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Semana_santa_procession_Guatemala.jpg",
    "title": "Semana santa procession Guatemala.jpg"
  },
  "rio-carnival": {
    "src": "/photos/festivals/rio-carnival.jpg",
    "width": 1000,
    "height": 741,
    "artist": "Stacey, Brian",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Carnival_Parade_in_Rio_-_Sambadrome_Monday_Night_13.jpg",
    "title": "Carnival Parade in Rio - Sambadrome Monday Night 13.jpg"
  },
  "dia-de-muertos": {
    "src": "/photos/festivals/dia-de-muertos.jpg",
    "width": 837,
    "height": 1250,
    "artist": "Eneas de Troya",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Altardediademuertos.jpg",
    "title": "Altardediademuertos.jpg"
  },
  "oktoberfest": {
    "src": "/photos/festivals/oktoberfest.jpg",
    "width": 1280,
    "height": 1251,
    "artist": "File:Hacker-Pschorr Oktoberfest Girl.jpg by Markburger83 Derivative work: Lauro ",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hacker-Pschorr_Oktoberfest_Girl_Remix.jpg",
    "title": "Hacker-Pschorr Oktoberfest Girl Remix.jpg"
  },
  "la-tomatina": {
    "src": "/photos/festivals/la-tomatina.jpg",
    "width": 1000,
    "height": 663,
    "artist": "Graham McLellan from London, UK",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Tomatina_2006.jpg",
    "title": "Tomatina 2006.jpg"
  },
  "st-patricks-day": {
    "src": "/photos/festivals/st-patricks-day.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Wilfredor",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Contingent_marching_in_the_Saint_Patrick%E2%80%99s_Day_parade.jpg",
    "title": "Contingent marching in the Saint Patrick’s Day parade.jpg"
  },
  "timkat": {
    "src": "/photos/festivals/timkat.jpg",
    "width": 1280,
    "height": 720,
    "artist": "Jean Rebiffé",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Celebrating_Timkat_in_Ethiopia.jpg",
    "title": "Celebrating Timkat in Ethiopia.jpg"
  },
  "inti-raymi": {
    "src": "/photos/festivals/inti-raymi.jpg",
    "width": 1000,
    "height": 563,
    "artist": "Presidencia de la República del Perú",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:View_of_Inti_Raymi_ceremony_in_Cusco,_Peru.png",
    "title": "View of Inti Raymi ceremony in Cusco, Peru.png"
  },
  "midsummer": {
    "src": "/photos/festivals/midsummer.jpg",
    "width": 1280,
    "height": 1707,
    "artist": "Plankbil",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Midsummer_in_R%C3%A4lta,_Sweden_(Midsommar_i_R%C3%A4lta,_Sverige).jpg",
    "title": "Midsummer in Rälta, Sweden (Midsommar i Rälta, Sverige).jpg"
  },
  "naadam": {
    "src": "/photos/festivals/naadam.jpg",
    "width": 1280,
    "height": 800,
    "artist": "Bernard Gagnon",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Musicians_at_Naadam_2023.jpg",
    "title": "Musicians at Naadam 2023.jpg"
  },
  "kwanzaa": {
    "src": "/photos/festivals/kwanzaa.jpg",
    "width": 1280,
    "height": 964,
    "artist": "rashida s. mar b. from Baltimore, USA",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:The_kinara_with_the_red_black_and_green_(2162325489).jpg",
    "title": "The kinara with the red black and green (2162325489).jpg"
  },
  "matariki": {
    "src": "/photos/festivals/matariki.jpg",
    "width": 1280,
    "height": 935,
    "artist": "Kristina D.C. Hoeppner",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ahi_K%C4%81_(8).jpg",
    "title": "Ahi Kā (8).jpg"
  },
  "meskel": {
    "src": "/photos/festivals/meskel.jpg",
    "width": 703,
    "height": 1250,
    "artist": "Redietmd",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Demera_bonfire.jpg",
    "title": "Demera bonfire.jpg"
  },
  "homowo": {
    "src": "/photos/festivals/homowo.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Jwale2",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Teshie_Homowo_Festival_28.jpg",
    "title": "Teshie Homowo Festival 28.jpg"
  },
  "vodun-days": {
    "src": "/photos/festivals/vodun-days.jpg",
    "width": 833,
    "height": 1250,
    "artist": "Newdini",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Brothers_in_Ouidah.jpg",
    "title": "Brothers in Ouidah.jpg"
  },
  "tweede-nuwe-jaar": {
    "src": "/photos/festivals/tweede-nuwe-jaar.jpg",
    "width": 828,
    "height": 1250,
    "artist": "Olga Ernst",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cape_Minstrel_at_Cape_Town_Minstrel_Carnival_(2017).jpg",
    "title": "Cape Minstrel at Cape Town Minstrel Carnival (2017).jpg"
  },
  "loy-krathong": {
    "src": "/photos/festivals/loy-krathong.jpg",
    "width": 1200,
    "height": 901,
    "artist": "John Shedrick from Chiang Mai, Thailand",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Thai_people_setting_their_candle-lit_krathongs_in_the_Ping_river_at_night_during_Loy_Krathong_2015-10_(22715933524).jpg",
    "title": "Thai people setting their candle-lit krathongs in the Ping river at night during Loy Krathong 2015-10 (22715933524).jpg"
  },
  "sinulog": {
    "src": "/photos/festivals/sinulog.jpg",
    "width": 833,
    "height": 1250,
    "artist": "Ranieljosecastaneda",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sinulog_Festival_Cebu_City.jpg",
    "title": "Sinulog Festival Cebu City.jpg"
  },
  "thaipusam": {
    "src": "/photos/festivals/thaipusam.jpg",
    "width": 1280,
    "height": 960,
    "artist": "*angys*",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Thaipusam_2025_Sri_Subramaniar_Swamy_Temple_and_Crowds_at_Batu_Caves_(250211).jpg",
    "title": "Thaipusam 2025 Sri Subramaniar Swamy Temple and Crowds at Batu Caves (250211).jpg"
  },
  "merrie-monarch": {
    "src": "/photos/festivals/merrie-monarch.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Allanbcool",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hula_H%C4%81lau_O_Kamuela_under_the_direction_of_Kumu_Hula_Kau%CA%BBi_Kamana%CA%BBo_and_Kunewa_Mook_-_2019_Overall_Winners_of_the_Merrie_Monarch_Festival_-_Hilo_HI_-_Lokalia_Montgomery_Perpetual_Trophy.jpg",
    "title": "Hula Hālau O Kamuela under the direction of Kumu Hula Kauʻi Kamanaʻo and Kunewa Mook - 2019 Overall Winners of the Merrie Monarch Festival - Hilo HI - Lokalia Montgomery Perpetual Trophy.jpg"
  },
  "candelaria-puno": {
    "src": "/photos/festivals/candelaria-puno.jpg",
    "width": 1280,
    "height": 960,
    "artist": "QM Keen",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Festividad_de_la_Virgen_de_la_Candelaria_en_Puno_2024_102.jpg",
    "title": "Festividad de la Virgen de la Candelaria en Puno 2024 102.jpg"
  },
  "guelaguetza": {
    "src": "/photos/festivals/guelaguetza.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Bernardojbp",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:2018_Desfile_Guelaguetza_Oaxaca_Mexico_85.jpg",
    "title": "2018 Desfile Guelaguetza Oaxaca Mexico 85.jpg"
  },
  "junkanoo": {
    "src": "/photos/festivals/junkanoo.jpg",
    "width": 1280,
    "height": 846,
    "artist": "Rüdiger Stehn from Kiel, Deutschland",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bahamas_1988_(127)_New_Providence_Junkanoo_(23562387456).jpg",
    "title": "Bahamas 1988 (127) New Providence Junkanoo (23562387456).jpg"
  },
  "trinidad-carnival": {
    "src": "/photos/festivals/trinidad-carnival.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Rastalionheart",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kiddies_carnival_Trinidad_2026_01.jpg",
    "title": "Kiddies carnival Trinidad 2026 01.jpg"
  },
  "kandy-esala-perahera": {
    "src": "/photos/festivals/kandy-esala-perahera.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Daniel Liabeuf",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Elephants_of_Kandy_Esala_Perahera_(2).jpg",
    "title": "Elephants of Kandy Esala Perahera (2).jpg"
  },
  "sami-national-day": {
    "src": "/photos/festivals/sami-national-day.jpg",
    "width": 834,
    "height": 1250,
    "artist": "John Sears",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:G%C3%B8ril_Nilsen_at_2025_M%C3%A1rkomeannu_4.jpg",
    "title": "Gøril Nilsen at 2025 Márkomeannu 4.jpg"
  }
};

export const DISH_PHOTOS: Record<string, Photo> = {
  "gulab-jamun": {
    "src": "/photos/dishes/gulab-jamun.jpg",
    "width": 600,
    "height": 400,
    "artist": "Sapra5379",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gulab-jamun-wallpaper-1.jpg",
    "title": "Gulab-jamun-wallpaper-1.jpg"
  },
  "kaju-katli": {
    "src": "/photos/dishes/kaju-katli.jpg",
    "width": 1280,
    "height": 960,
    "artist": "najeeb shaik",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kaju_katli_sweet.jpg",
    "title": "Kaju katli sweet.jpg"
  },
  "chakli": {
    "src": "/photos/dishes/chakli.jpg",
    "width": 1000,
    "height": 1000,
    "artist": "PilotChicago",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chakli_in_a_bowl.jpg",
    "title": "Chakli in a bowl.jpg"
  },
  "gujiya": {
    "src": "/photos/dishes/gujiya.jpg",
    "width": 1280,
    "height": 850,
    "artist": "Sanjeevdwivedi",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gujhia.JPG",
    "title": "Gujhia.JPG"
  },
  "thandai": {
    "src": "/photos/dishes/thandai.jpg",
    "width": 833,
    "height": 1250,
    "artist": "Aparna Balasubramanian",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Thandai_(Spiced_Indian_Milk_Drink).JPG",
    "title": "Thandai (Spiced Indian Milk Drink).JPG"
  },
  "khichuri-bhog": {
    "src": "/photos/dishes/khichuri-bhog.jpg",
    "width": 960,
    "height": 1280,
    "artist": "Rpande",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Dall_Khichdi.jpg",
    "title": "Dall Khichdi.jpg"
  },
  "sandesh": {
    "src": "/photos/dishes/sandesh.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Miansari66",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Sandesh_3.jpg",
    "title": "Sandesh 3.jpg"
  },
  "modak": {
    "src": "/photos/dishes/modak.jpg",
    "width": 1280,
    "height": 853,
    "artist": "imutkarshpatil",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ukadiche_Modak_(Rice).jpg",
    "title": "Ukadiche Modak (Rice).jpg"
  },
  "onam-sadya": {
    "src": "/photos/dishes/onam-sadya.jpg",
    "width": 1280,
    "height": 694,
    "artist": "Augustus Binu/ facebook",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sadhya_DSW.jpg",
    "title": "Sadhya DSW.jpg"
  },
  "sakkarai-pongal": {
    "src": "/photos/dishes/sakkarai-pongal.jpg",
    "width": 1280,
    "height": 858,
    "artist": "Shafana jasmine",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ven_pongal_with_sambar_and_chutney.jpg",
    "title": "Ven pongal with sambar and chutney.jpg"
  },
  "sheer-khurma": {
    "src": "/photos/dishes/sheer-khurma.jpg",
    "width": 500,
    "height": 375,
    "artist": "Muhammad Adnan Asim linkadnan from North Nazimabad, Karachi 74700 ( Sindh ), Pak",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sheer_Khurma.jpg",
    "title": "Sheer Khurma.jpg"
  },
  "baklava": {
    "src": "/photos/dishes/baklava.jpg",
    "width": 772,
    "height": 515,
    "artist": "Sakaman",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Baklava(1).png",
    "title": "Baklava(1).png"
  },
  "nian-gao": {
    "src": "/photos/dishes/nian-gao.jpg",
    "width": 1280,
    "height": 1707,
    "artist": "Peachyeung316",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_homemade_nian_gao_from_old_woman_in_yuen_long.jpg",
    "title": "A homemade nian gao from old woman in yuen long.jpg"
  },
  "songpyeon": {
    "src": "/photos/dishes/songpyeon.jpg",
    "width": 1280,
    "height": 1036,
    "artist": "wizdata",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Songpyeon.jpg",
    "title": "Songpyeon.jpg"
  },
  "hanami-dango": {
    "src": "/photos/dishes/hanami-dango.jpg",
    "width": 1280,
    "height": 853,
    "artist": "denver935",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mitarashi_dango_by_denver935.jpg",
    "title": "Mitarashi dango by denver935.jpg"
  },
  "sakura-mochi": {
    "src": "/photos/dishes/sakura-mochi.jpg",
    "width": 1280,
    "height": 960,
    "artist": "katorisi",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_rice_cake_filled_with_sweet_bean_paste_and_wrapped_in_a_pickled_cherry_leaf,katori-city,japan.JPG",
    "title": "A rice cake filled with sweet bean paste and wrapped in a pickled cherry leaf,katori-city,japan.JPG"
  },
  "mango-sticky-rice": {
    "src": "/photos/dishes/mango-sticky-rice.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Dennis Wong from Hong Kong, Hong Kong",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mango_sticy_rice_(3859549574).jpg",
    "title": "Mango sticy rice (3859549574).jpg"
  },
  "samanu": {
    "src": "/photos/dishes/samanu.jpg",
    "width": 720,
    "height": 480,
    "artist": "Myone63",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Samanu_for_7_sin.jpg",
    "title": "Samanu for 7 sin.jpg"
  },
  "latkes": {
    "src": "/photos/dishes/latkes.jpg",
    "width": 1280,
    "height": 685,
    "artist": "Jonathunder",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:LatkeFry.JPG",
    "title": "LatkeFry.JPG"
  },
  "sufganiyot": {
    "src": "/photos/dishes/sufganiyot.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Noam Furer",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Classic_Hanukkah_sufganiyot.JPG",
    "title": "Classic Hanukkah sufganiyot.JPG"
  },
  "panettone": {
    "src": "/photos/dishes/panettone.jpg",
    "width": 1280,
    "height": 853,
    "artist": "N i c o l a from Fiumicino (Rome), Italy",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Panettone_-_Nicolettone_2017_-_IMG_7085_(31752542285).jpg",
    "title": "Panettone - Nicolettone 2017 - IMG 7085 (31752542285).jpg"
  },
  "pan-de-muerto": {
    "src": "/photos/dishes/pan-de-muerto.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Norma Ps",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Norma_Pati%C3%B1o_S%C3%A1nchez_A01334948_9.jpg",
    "title": "Norma Patiño Sánchez A01334948 9.jpg"
  },
  "torrijas": {
    "src": "/photos/dishes/torrijas.jpg",
    "width": 1280,
    "height": 914,
    "artist": "Jonathunder",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:FrenchToast.JPG",
    "title": "FrenchToast.JPG"
  },
  "brezel": {
    "src": "/photos/dishes/brezel.jpg",
    "width": 1000,
    "height": 706,
    "artist": "Sundar1",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:BrezelnSalz02_(cropped).JPG",
    "title": "BrezelnSalz02 (cropped).JPG"
  },
  "injera": {
    "src": "/photos/dishes/injera.jpg",
    "width": 1000,
    "height": 980,
    "artist": "Artem.G",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Injera_with_eight_kinds_of_stew.jpg",
    "title": "Injera with eight kinds of stew.jpg"
  },
  "chicha-de-jora": {
    "src": "/photos/dishes/chicha-de-jora.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Dtarazona",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Chicha_de_jora_en_vaso.JPG",
    "title": "Chicha de jora en vaso.JPG"
  },
  "pumpkin-pie": {
    "src": "/photos/dishes/pumpkin-pie.jpg",
    "width": 1280,
    "height": 584,
    "artist": "Evan-Amos",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Pumpkin-Pie-Whole-Slice.jpg",
    "title": "Pumpkin-Pie-Whole-Slice.jpg"
  },
  "jordgubbstarta": {
    "src": "/photos/dishes/jordgubbstarta.jpg",
    "width": 1280,
    "height": 966,
    "artist": "Dennis Sylvester Hurd",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Strawberry_layer_cake.jpg",
    "title": "Strawberry layer cake.jpg"
  }
};

export const ATTIRE_PHOTOS: Record<string, Photo> = {
  "sari": {
    "src": "/photos/attire/sari.jpg",
    "width": 1080,
    "height": 1080,
    "artist": "Suyash.dwivedi",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sari_on_mannequin_for_demo.jpg",
    "title": "Sari on mannequin for demo.jpg"
  },
  "sherwani-kurta": {
    "src": "/photos/attire/sherwani-kurta.jpg",
    "width": 1280,
    "height": 2039,
    "artist": "Fowler&amp;fowler at English Wikipedia",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Kurta_traditional_front_sandalwood_buttons.jpg",
    "title": "Kurta traditional front sandalwood buttons.jpg"
  },
  "kasavu": {
    "src": "/photos/attire/kasavu.jpg",
    "width": 1000,
    "height": 753,
    "artist": "Netha Hussain",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Malayali_women_wearing_Kerala_saree.jpg",
    "title": "Malayali women wearing Kerala saree.jpg"
  },
  "hanfu": {
    "src": "/photos/attire/hanfu.jpg",
    "width": 1000,
    "height": 775,
    "artist": "Anonymous Song Chinese artist after the original by Gu Hongzhong",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Gu_Hongzhong%27s_Night_Revels,_Detail_1.jpg",
    "title": "Gu Hongzhong's Night Revels, Detail 1.jpg"
  },
  "hanbok": {
    "src": "/photos/attire/hanbok.jpg",
    "width": 1280,
    "height": 1981,
    "artist": "Republic of Korea from Seoul, Republic of Korea",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hanbok_Day_2016_29_(30467033136).jpg",
    "title": "Hanbok Day 2016 29 (30467033136).jpg"
  },
  "kimono-yukata": {
    "src": "/photos/attire/kimono-yukata.jpg",
    "width": 1280,
    "height": 852,
    "artist": "Takaaki Kawai",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Two_young_maiko_in_Seirai-in_Temple_02.jpg",
    "title": "Two young maiko in Seirai-in Temple 02.jpg"
  },
  "ao-dai": {
    "src": "/photos/attire/ao-dai.jpg",
    "width": 510,
    "height": 737,
    "artist": "Phát Trương",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:%C3%81o_d%C3%A0i_hoa_ph%C6%B0%E1%BB%A3ng_-_Ph%C3%A1t_Tr%C6%B0%C6%A1ng_-_51231007393_(cropped).jpg",
    "title": "Áo dài hoa phượng - Phát Trương - 51231007393 (cropped).jpg"
  },
  "tracht": {
    "src": "/photos/attire/tracht.jpg",
    "width": 1280,
    "height": 928,
    "artist": "High Contrast",
    "license": "CC BY 3.0 de",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0/de/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Volksfestumzug_in_Vilshofen_a.d._Donau_2012_(3).JPG",
    "title": "Volksfestumzug in Vilshofen a.d. Donau 2012 (3).JPG"
  },
  "fantasia": {
    "src": "/photos/attire/fantasia.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Fernando Frazão/Agência Brasil",
    "license": "CC BY 3.0 br",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0/br/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Desfile_Portela_2014_(906185).jpg",
    "title": "Desfile Portela 2014 (906185).jpg"
  },
  "deel": {
    "src": "/photos/attire/deel.jpg",
    "width": 600,
    "height": 796,
    "artist": "Unknown",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Mongols_clothes_man_and_woman.jpg",
    "title": "Mongols clothes man and woman.jpg"
  }
};

export const PLACE_PHOTOS: Record<string, Photo> = {
  "varanasi": {
    "src": "/photos/places/varanasi.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Vyacheslav Argenberg",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Varanasi,_India,_Ghats,_Cremation_ceremony_in_progress.jpg",
    "title": "Varanasi, India, Ghats, Cremation ceremony in progress.jpg"
  },
  "jaipur": {
    "src": "/photos/places/jaipur.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Chainwit.",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:East_facade_Hawa_Mahal_Jaipur_from_ground_level_(July_2022)_-_img_01.jpg",
    "title": "East facade Hawa Mahal Jaipur from ground level (July 2022) - img 01.jpg"
  },
  "kolkata": {
    "src": "/photos/places/kolkata.jpg",
    "width": 1280,
    "height": 731,
    "artist": "NalGup20",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kolkata_maidan.jpg",
    "title": "Kolkata maidan.jpg"
  },
  "mumbai": {
    "src": "/photos/places/mumbai.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Rutiknatekar",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mumbai_Bandra-Worli_Sea_Link.jpg",
    "title": "Mumbai Bandra-Worli Sea Link.jpg"
  },
  "kochi": {
    "src": "/photos/places/kochi.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Fsquares (The Ibrahims)",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kochi_Skyline.jpg",
    "title": "Kochi Skyline.jpg"
  },
  "madurai": {
    "src": "/photos/places/madurai.jpg",
    "width": 1280,
    "height": 628,
    "artist": "KennyOMG",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Meenakshi_Amman_West_Tower.jpg",
    "title": "Meenakshi Amman West Tower.jpg"
  },
  "istanbul": {
    "src": "/photos/places/istanbul.jpg",
    "width": 1280,
    "height": 618,
    "artist": "Hunanuk",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Historical_peninsula_and_modern_skyline_of_Istanbul.jpg",
    "title": "Historical peninsula and modern skyline of Istanbul.jpg"
  },
  "beijing": {
    "src": "/photos/places/beijing.jpg",
    "width": 1000,
    "height": 666,
    "artist": "N509FZ",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Skyline_of_Beijing_CBD_with_B-5906_approaching_(20211016171955)_(1).jpg",
    "title": "Skyline of Beijing CBD with B-5906 approaching (20211016171955) (1).jpg"
  },
  "kyoto": {
    "src": "/photos/places/kyoto.jpg",
    "width": 1000,
    "height": 660,
    "artist": "Martin Falbisoner",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kiyomizu-dera,_Kyoto,_November_2016_-02.jpg",
    "title": "Kiyomizu-dera, Kyoto, November 2016 -02.jpg"
  },
  "chiang-mai": {
    "src": "/photos/places/chiang-mai.jpg",
    "width": 1280,
    "height": 855,
    "artist": "Nawit science",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:0020-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%87%E0%B8%AB%E0%B9%8C%E0%B8%A7%E0%B8%A3%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg",
    "title": "0020-วัดพระสิงห์วรมหาวิหาร.jpg"
  },
  "shiraz": {
    "src": "/photos/places/shiraz.jpg",
    "width": 1280,
    "height": 720,
    "artist": "آرش (Arche)",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Darvaze_Ghoran11.jpg",
    "title": "Darvaze Ghoran11.jpg"
  },
  "jerusalem": {
    "src": "/photos/places/jerusalem.jpg",
    "width": 1280,
    "height": 649,
    "artist": "askii",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Dome_of_the_Rock_seen_from_the_Mount_of_Olives_(12395649153)_(cropped).jpg",
    "title": "Dome of the Rock seen from the Mount of Olives (12395649153) (cropped).jpg"
  },
  "gondar": {
    "src": "/photos/places/gondar.jpg",
    "width": 1280,
    "height": 960,
    "artist": "Giustino",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gonder_from_the_Goha_hotel.jpg",
    "title": "Gonder from the Goha hotel.jpg"
  },
  "seville": {
    "src": "/photos/places/seville.jpg",
    "width": 1280,
    "height": 954,
    "artist": "Ingo Mehling",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sevilla_Cathedral_-_Southeast.jpg",
    "title": "Sevilla Cathedral - Southeast.jpg"
  },
  "munich": {
    "src": "/photos/places/munich.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Martin Falbisoner",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Frauenkirche_and_Neues_Rathaus_Munich_March_2013.JPG",
    "title": "Frauenkirche and Neues Rathaus Munich March 2013.JPG"
  },
  "dublin": {
    "src": "/photos/places/dublin.jpg",
    "width": 1280,
    "height": 720,
    "artist": "瑞丽江的河水",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Dublin_-_aerial_-_2025-07-07_01.jpg",
    "title": "Dublin - aerial - 2025-07-07 01.jpg"
  },
  "dalarna": {
    "src": "/photos/places/dalarna.jpg",
    "width": 1280,
    "height": 891,
    "artist": "Holger.Ellgaard",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Dalarna_sommar_1986.jpg",
    "title": "Dalarna sommar 1986.jpg"
  },
  "rio-de-janeiro": {
    "src": "/photos/places/rio-de-janeiro.jpg",
    "width": 1280,
    "height": 684,
    "artist": "Rafael Rabello de Barros",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cidade_Maravilhosa.jpg",
    "title": "Cidade Maravilhosa.jpg"
  },
  "cusco": {
    "src": "/photos/places/cusco.jpg",
    "width": 1280,
    "height": 853,
    "artist": "tomscoffin",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Vista_Calle_Suecia.jpg",
    "title": "Vista Calle Suecia.jpg"
  },
  "ulaanbaatar": {
    "src": "/photos/places/ulaanbaatar.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Zazaa Mongolia",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:UB_downtown.jpg",
    "title": "UB downtown.jpg"
  },
  "new-orleans": {
    "src": "/photos/places/new-orleans.jpg",
    "width": 1280,
    "height": 970,
    "artist": "George Bannister",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:New_Orleans_from_the_Air_September_2019_-_Central_Business_District_Skyline_(cropped).jpg",
    "title": "New Orleans from the Air September 2019 - Central Business District Skyline (cropped).jpg"
  },
  "ouidah": {
    "src": "/photos/places/ouidah.jpg",
    "width": 1280,
    "height": 866,
    "artist": "Francisco Anzola",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Door_of_no_return.jpg",
    "title": "Door of no return.jpg"
  },
  "cape-town": {
    "src": "/photos/places/cape-town.jpg",
    "width": 1280,
    "height": 740,
    "artist": "Der Berzerker from Washington, DC, USA",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Camps_bay_(53460319478)_(cropped).jpg",
    "title": "Camps bay (53460319478) (cropped).jpg"
  },
  "sukhothai": {
    "src": "/photos/places/sukhothai.jpg",
    "width": 1280,
    "height": 853,
    "artist": "Khunkay",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Wat_srichum_03.jpg",
    "title": "Wat srichum 03.jpg"
  },
  "cebu-city": {
    "src": "/photos/places/cebu-city.jpg",
    "width": 1000,
    "height": 750,
    "artist": "LMP 2001",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cebu_Cathedral_2024-07-07.jpg",
    "title": "Cebu Cathedral 2024-07-07.jpg"
  },
  "batu-caves": {
    "src": "/photos/places/batu-caves.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Chainwit.",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Batu_Caves_stairs_2022-05.jpg",
    "title": "Batu Caves stairs 2022-05.jpg"
  },
  "puno": {
    "src": "/photos/places/puno.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Tydence Davis from Las Vegas",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Puno_cityscape.jpg",
    "title": "Puno cityscape.jpg"
  },
  "nassau": {
    "src": "/photos/places/nassau.jpg",
    "width": 1000,
    "height": 600,
    "artist": "Quintin Soloviev",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Nassau,_Bahamas_aerial_view_(cropped).jpg",
    "title": "Nassau, Bahamas aerial view (cropped).jpg"
  },
  "port-of-spain": {
    "src": "/photos/places/port-of-spain.jpg",
    "width": 960,
    "height": 652,
    "artist": "DizzyNN",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:POS_at_night_Skyline.jpg",
    "title": "POS at night Skyline.jpg"
  }
};

const BY_ART_KIND: Record<string, Record<string, Photo>> = { rosette: FESTIVAL_PHOTOS, plate: DISH_PHOTOS, textile: ATTIRE_PHOTOS, locator: PLACE_PHOTOS };

/** The photograph for a piece of content, by its artwork kind and slug, if one has been sourced. */
export function photoFor(kind: string, slug: string): Photo | undefined {
  return BY_ART_KIND[kind]?.[slug];
}
