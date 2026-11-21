/**
 * Festival photographs. Every image is from Wikimedia Commons under a free
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
    "width": 1000,
    "height": 750,
    "artist": "Ara Basu",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Diya_Lamp.jpg",
    "title": "Diya Lamp.jpg"
  },
  "holi": {
    "src": "/photos/festivals/holi.jpg",
    "width": 1000,
    "height": 758,
    "artist": "FaceMePLS",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Holi_Feest_2008_meisjes.jpg",
    "title": "Holi Feest 2008 meisjes.jpg"
  },
  "durga-puja": {
    "src": "/photos/festivals/durga-puja.jpg",
    "width": 1000,
    "height": 1333,
    "artist": "Slyronit",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Idol_at_Chittaranjan_Park_Cooperative_Pandal_Durga_Puja_in_2017.jpg",
    "title": "Idol at Chittaranjan Park Cooperative Pandal Durga Puja in 2017.jpg"
  },
  "ganesh-chaturthi": {
    "src": "/photos/festivals/ganesh-chaturthi.jpg",
    "width": 1000,
    "height": 1328,
    "artist": "Ashish Suryavanshi858",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Ganesh_chaturthi_puja_03.jpg",
    "title": "Ganesh chaturthi puja 03.jpg"
  },
  "onam": {
    "src": "/photos/festivals/onam.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Shreesha Sharma",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Onam_Pookalam_Kasaragod.jpg",
    "title": "Onam Pookalam Kasaragod.jpg"
  },
  "pongal": {
    "src": "/photos/festivals/pongal.jpg",
    "width": 1000,
    "height": 667,
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
    "width": 1000,
    "height": 563,
    "artist": "MOAYED WALEED",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Eid_al-Adha_Prayer_at_the_Sayyid_Al-Hassan_Shrine_in_Kassala.jpg",
    "title": "Eid al-Adha Prayer at the Sayyid Al-Hassan Shrine in Kassala.jpg"
  },
  "lunar-new-year": {
    "src": "/photos/festivals/lunar-new-year.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Dileep Kaluaratchie",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chinese_New_Year_Celebrations_with_Lanterns_in_Singapore.jpg",
    "title": "Chinese New Year Celebrations with Lanterns in Singapore.jpg"
  },
  "mid-autumn-festival": {
    "src": "/photos/festivals/mid-autumn-festival.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Shizhao",
    "license": "CC BY-SA 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5",
    "source": "https://commons.wikimedia.org/wiki/File:Mid-Autumn_Festival-beijing.jpg",
    "title": "Mid-Autumn Festival-beijing.jpg"
  },
  "dragon-boat-festival": {
    "src": "/photos/festivals/dragon-boat-festival.jpg",
    "width": 1000,
    "height": 750,
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
    "width": 1000,
    "height": 750,
    "artist": "Immanuelle",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gion_Matsuri_Float_1.jpg",
    "title": "Gion Matsuri Float 1.jpg"
  },
  "songkran": {
    "src": "/photos/festivals/songkran.jpg",
    "width": 1000,
    "height": 667,
    "artist": "CEphoto, Uwe Aranas",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chiang-Mai_Thailand_Songkran-Festival-2017-03.jpg",
    "title": "Chiang-Mai Thailand Songkran-Festival-2017-03.jpg"
  },
  "vesak": {
    "src": "/photos/festivals/vesak.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Albert Ivan Damanik",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Indonesia_Buddhists_Vesak_Day.jpg",
    "title": "Indonesia Buddhists Vesak Day.jpg"
  },
  "nowruz": {
    "src": "/photos/festivals/nowruz.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Katzenfee50",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Haft-sin,_Nowruz,_Still-life-3205068.jpg",
    "title": "Haft-sin, Nowruz, Still-life-3205068.jpg"
  },
  "hanukkah": {
    "src": "/photos/festivals/hanukkah.jpg",
    "width": 1000,
    "height": 1333,
    "artist": "Gatorfan252525",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_modern,_nickelplate_Hanukkah_menorah_with_5_candles_lit.jpg",
    "title": "A modern, nickelplate Hanukkah menorah with 5 candles lit.jpg"
  },
  "christmas": {
    "src": "/photos/festivals/christmas.jpg",
    "width": 1000,
    "height": 1318,
    "artist": "Jernej Furman from Maribor, Slovenia",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Christmas_tree_decorated_with_baubles,_boho_ornaments_and_golden_lights._Merry_Christmas!_(51783650592).jpg",
    "title": "Christmas tree decorated with baubles, boho ornaments and golden lights. Merry Christmas! (51783650592).jpg"
  },
  "semana-santa": {
    "src": "/photos/festivals/semana-santa.jpg",
    "width": 1000,
    "height": 637,
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
    "width": 1000,
    "height": 1494,
    "artist": "Eneas de Troya",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Altardediademuertos.jpg",
    "title": "Altardediademuertos.jpg"
  },
  "oktoberfest": {
    "src": "/photos/festivals/oktoberfest.jpg",
    "width": 1000,
    "height": 977,
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
    "width": 1000,
    "height": 667,
    "artist": "Wilfredor",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Contingent_marching_in_the_Saint_Patrick%E2%80%99s_Day_parade.jpg",
    "title": "Contingent marching in the Saint Patrick’s Day parade.jpg"
  },
  "timkat": {
    "src": "/photos/festivals/timkat.jpg",
    "width": 1000,
    "height": 562,
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
  "thanksgiving": {
    "src": "/photos/festivals/thanksgiving.jpg",
    "width": 1000,
    "height": 1010,
    "artist": "Per source. Please credit \"Family photos of Infrogmation\".",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Thanksgiving_Dinner_Table,_Broward_County_Florida,_1971_02.jpg",
    "title": "Thanksgiving Dinner Table, Broward County Florida, 1971 02.jpg"
  },
  "midsummer": {
    "src": "/photos/festivals/midsummer.jpg",
    "width": 1000,
    "height": 1333,
    "artist": "Plankbil",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Midsummer_in_R%C3%A4lta,_Sweden_(Midsommar_i_R%C3%A4lta,_Sverige).jpg",
    "title": "Midsummer in Rälta, Sweden (Midsommar i Rälta, Sverige).jpg"
  },
  "naadam": {
    "src": "/photos/festivals/naadam.jpg",
    "width": 1000,
    "height": 625,
    "artist": "Bernard Gagnon",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Musicians_at_Naadam_2023.jpg",
    "title": "Musicians at Naadam 2023.jpg"
  },
  "kwanzaa": {
    "src": "/photos/festivals/kwanzaa.jpg",
    "width": 1000,
    "height": 753,
    "artist": "rashida s. mar b. from Baltimore, USA",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:The_kinara_with_the_red_black_and_green_(2162325489).jpg",
    "title": "The kinara with the red black and green (2162325489).jpg"
  },
  "matariki": {
    "src": "/photos/festivals/matariki.jpg",
    "width": 1000,
    "height": 730,
    "artist": "Kristina D.C. Hoeppner",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ahi_K%C4%81_(8).jpg",
    "title": "Ahi Kā (8).jpg"
  },
  "meskel": {
    "src": "/photos/festivals/meskel.jpg",
    "width": 1000,
    "height": 1778,
    "artist": "Redietmd",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Demera_bonfire.jpg",
    "title": "Demera bonfire.jpg"
  },
  "homowo": {
    "src": "/photos/festivals/homowo.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Jwale2",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Teshie_Homowo_Festival_28.jpg",
    "title": "Teshie Homowo Festival 28.jpg"
  },
  "vodun-days": {
    "src": "/photos/festivals/vodun-days.jpg",
    "width": 1000,
    "height": 1500,
    "artist": "Newdini",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Brothers_in_Ouidah.jpg",
    "title": "Brothers in Ouidah.jpg"
  },
  "tweede-nuwe-jaar": {
    "src": "/photos/festivals/tweede-nuwe-jaar.jpg",
    "width": 1000,
    "height": 1510,
    "artist": "Olga Ernst",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cape_Minstrel_at_Cape_Town_Minstrel_Carnival_(2017).jpg",
    "title": "Cape Minstrel at Cape Town Minstrel Carnival (2017).jpg"
  },
  "loy-krathong": {
    "src": "/photos/festivals/loy-krathong.jpg",
    "width": 1000,
    "height": 751,
    "artist": "John Shedrick from Chiang Mai, Thailand",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Thai_people_setting_their_candle-lit_krathongs_in_the_Ping_river_at_night_during_Loy_Krathong_2015-10_(22715933524).jpg",
    "title": "Thai people setting their candle-lit krathongs in the Ping river at night during Loy Krathong 2015-10 (22715933524).jpg"
  },
  "sinulog": {
    "src": "/photos/festivals/sinulog.jpg",
    "width": 1000,
    "height": 1500,
    "artist": "Ranieljosecastaneda",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sinulog_Festival_Cebu_City.jpg",
    "title": "Sinulog Festival Cebu City.jpg"
  },
  "thaipusam": {
    "src": "/photos/festivals/thaipusam.jpg",
    "width": 1000,
    "height": 750,
    "artist": "*angys*",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Thaipusam_2025_Sri_Subramaniar_Swamy_Temple_and_Crowds_at_Batu_Caves_(250211).jpg",
    "title": "Thaipusam 2025 Sri Subramaniar Swamy Temple and Crowds at Batu Caves (250211).jpg"
  },
  "merrie-monarch": {
    "src": "/photos/festivals/merrie-monarch.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Allanbcool",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hula_H%C4%81lau_O_Kamuela_under_the_direction_of_Kumu_Hula_Kau%CA%BBi_Kamana%CA%BBo_and_Kunewa_Mook_-_2019_Overall_Winners_of_the_Merrie_Monarch_Festival_-_Hilo_HI_-_Lokalia_Montgomery_Perpetual_Trophy.jpg",
    "title": "Hula Hālau O Kamuela under the direction of Kumu Hula Kauʻi Kamanaʻo and Kunewa Mook - 2019 Overall Winners of the Merrie Monarch Festival - Hilo HI - Lokalia Montgomery Perpetual Trophy.jpg"
  },
  "candelaria-puno": {
    "src": "/photos/festivals/candelaria-puno.jpg",
    "width": 1000,
    "height": 750,
    "artist": "QM Keen",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Festividad_de_la_Virgen_de_la_Candelaria_en_Puno_2024_102.jpg",
    "title": "Festividad de la Virgen de la Candelaria en Puno 2024 102.jpg"
  },
  "guelaguetza": {
    "src": "/photos/festivals/guelaguetza.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Bernardojbp",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:2018_Desfile_Guelaguetza_Oaxaca_Mexico_85.jpg",
    "title": "2018 Desfile Guelaguetza Oaxaca Mexico 85.jpg"
  },
  "junkanoo": {
    "src": "/photos/festivals/junkanoo.jpg",
    "width": 1000,
    "height": 661,
    "artist": "Rüdiger Stehn from Kiel, Deutschland",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bahamas_1988_(127)_New_Providence_Junkanoo_(23562387456).jpg",
    "title": "Bahamas 1988 (127) New Providence Junkanoo (23562387456).jpg"
  },
  "trinidad-carnival": {
    "src": "/photos/festivals/trinidad-carnival.jpg",
    "width": 1000,
    "height": 1333,
    "artist": "Rastalionheart",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kiddies_carnival_Trinidad_2026_01.jpg",
    "title": "Kiddies carnival Trinidad 2026 01.jpg"
  },
  "kandy-esala-perahera": {
    "src": "/photos/festivals/kandy-esala-perahera.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Daniel Liabeuf",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Elephants_of_Kandy_Esala_Perahera_(2).jpg",
    "title": "Elephants of Kandy Esala Perahera (2).jpg"
  },
  "sami-national-day": {
    "src": "/photos/festivals/sami-national-day.jpg",
    "width": 1000,
    "height": 1499,
    "artist": "John Sears",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:G%C3%B8ril_Nilsen_at_2025_M%C3%A1rkomeannu_4.jpg",
    "title": "Gøril Nilsen at 2025 Márkomeannu 4.jpg"
  }
};
