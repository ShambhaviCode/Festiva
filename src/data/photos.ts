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
  },
  "makar-sankranti": {
    "src": "/photos/festivals/makar-sankranti.jpg",
    "width": 698,
    "height": 439,
    "artist": "Abhay12253",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Photo_of_makar_sankranti_devootees.jpg",
    "title": "Photo of makar sankranti devootees.jpg"
  },
  "vasant-panchami": {
    "src": "/photos/festivals/vasant-panchami.jpg",
    "width": 909,
    "height": 1250,
    "artist": "Raja Ravi Varma",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Raja_Ravi_Varma,_Goddess_Saraswati.jpg",
    "title": "Raja Ravi Varma, Goddess Saraswati.jpg"
  },
  "maha-shivaratri": {
    "src": "/photos/festivals/maha-shivaratri.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Navneesh Ramessur",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:02_Mahashivratree_festival.JPG",
    "title": "02 Mahashivratree festival.JPG"
  },
  "ugadi-gudi-padwa": {
    "src": "/photos/festivals/ugadi-gudi-padwa.jpg",
    "width": 1000,
    "height": 670,
    "artist": "Kalyan Kanuri",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_Happy_Ugadi_puja_tray_Telugu_Hindu_New_Year_Vaisakhi.jpg",
    "title": "A Happy Ugadi puja tray Telugu Hindu New Year Vaisakhi.jpg"
  },
  "vishu": {
    "src": "/photos/festivals/vishu.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Vishnu Kunnathully",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Vishu_Kani_foods.jpg",
    "title": "Vishu Kani foods.jpg"
  },
  "bihu": {
    "src": "/photos/festivals/bihu.jpg",
    "width": 602,
    "height": 355,
    "artist": "Musta firoj ahmed",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bihu-Dance-assam.jpg",
    "title": "Bihu-Dance-assam.jpg"
  },
  "rath-yatra": {
    "src": "/photos/festivals/rath-yatra.jpg",
    "width": 1000,
    "height": 677,
    "artist": "G.-U. Tolkiehn",
    "license": "CC BY 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.5",
    "source": "https://commons.wikimedia.org/wiki/File:Rath_Yatra_Puri_07-11027.jpg",
    "title": "Rath Yatra Puri 07-11027.jpg"
  },
  "raksha-bandhan": {
    "src": "/photos/festivals/raksha-bandhan.jpg",
    "width": 1000,
    "height": 666,
    "artist": "ସରୋଜ କୁମାର ବେହେରା",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Rakhi_1.JPG",
    "title": "Rakhi 1.JPG"
  },
  "janmashtami": {
    "src": "/photos/festivals/janmashtami.jpg",
    "width": 796,
    "height": 970,
    "artist": "Raja Ravi Varma",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Yesoda-krishna.jpg",
    "title": "Yesoda-krishna.jpg"
  },
  "navratri": {
    "src": "/photos/festivals/navratri.jpg",
    "width": 1000,
    "height": 750,
    "artist": "आर्या जोशी",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Shardiya_Navratri_Festival_in_Pune_2020.jpg",
    "title": "Shardiya Navratri Festival in Pune 2020.jpg"
  },
  "dussehra": {
    "src": "/photos/festivals/dussehra.jpg",
    "width": 1000,
    "height": 499,
    "artist": "Ms Sarah Welch",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Navratri_Navaratri_festival_preparations_and_performance_arts_collage.jpg",
    "title": "Navratri Navaratri festival preparations and performance arts collage.jpg"
  },
  "karva-chauth": {
    "src": "/photos/festivals/karva-chauth.jpg",
    "width": 1000,
    "height": 618,
    "artist": "Rohit Sharma",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Karva_Chauth_festival.jpg",
    "title": "Karva Chauth festival.jpg"
  },
  "chhath-puja": {
    "src": "/photos/festivals/chhath-puja.jpg",
    "width": 1000,
    "height": 562,
    "artist": "Steffen Gauger",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:JanakpurChhathParvaFestival.jpg",
    "title": "JanakpurChhathParvaFestival.jpg"
  },
  "guru-nanak-jayanti": {
    "src": "/photos/festivals/guru-nanak-jayanti.jpg",
    "width": 1000,
    "height": 665,
    "artist": "Giridhar Appaji Nag Y from Bangalore, India",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Akal_Takht_illuminated,_in_Harmandir_Sahib_complex,_Amritsar.jpg",
    "title": "Akal Takht illuminated, in Harmandir Sahib complex, Amritsar.jpg"
  },
  "fete-de-la-musique": {
    "src": "/photos/festivals/fete-de-la-musique.jpg",
    "width": 1000,
    "height": 666,
    "artist": "G.Mannaerts",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Brest_Fete_de_la_Musique_2015_6.JPG",
    "title": "Brest Fete de la Musique 2015 6.JPG"
  },
  "kings-day": {
    "src": "/photos/festivals/kings-day.jpg",
    "width": 720,
    "height": 540,
    "artist": "Carmelrmd",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Amsterdam%27s_Canals.jpg",
    "title": "Amsterdam's Canals.jpg"
  },
  "maslenitsa": {
    "src": "/photos/festivals/maslenitsa.jpg",
    "width": 1000,
    "height": 726,
    "artist": "Boris Kustodiev",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Maslenitsa_kustodiev.jpg",
    "title": "Maslenitsa kustodiev.jpg"
  },
  "thingyan": {
    "src": "/photos/festivals/thingyan.jpg",
    "width": 640,
    "height": 480,
    "artist": "Pagan era painter(s)",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Bagan_era_painting_of_Thingyan.jpg",
    "title": "Bagan era painting of Thingyan.jpg"
  },
  "bon-om-touk": {
    "src": "/photos/festivals/bon-om-touk.jpg",
    "width": 627,
    "height": 343,
    "artist": "Chetra Skyline",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cambodia_Water_Festival_1914.jpg",
    "title": "Cambodia Water Festival 1914.jpg"
  },
  "osun-osogbo": {
    "src": "/photos/festivals/osun-osogbo.jpg",
    "width": 1000,
    "height": 906,
    "artist": "ABORISADEADETONA",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Osun_groove_Osogbo.jpg",
    "title": "Osun groove Osogbo.jpg"
  },
  "carnival-of-binche": {
    "src": "/photos/festivals/carnival-of-binche.jpg",
    "width": 1000,
    "height": 716,
    "artist": "Marie-Claire",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Binche_-_Les_Gilles.jpg",
    "title": "Binche - Les Gilles.jpg"
  },
  "basel-fasnacht": {
    "src": "/photos/festivals/basel-fasnacht.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Sparrow (2019)",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Five_Gugge_at_Fasnacht_Basel_2024_on_Mittlere_Br%C3%BCcke_03.jpg",
    "title": "Five Gugge at Fasnacht Basel 2024 on Mittlere Brücke 03.jpg"
  },
  "kupala-night": {
    "src": "/photos/festivals/kupala-night.jpg",
    "width": 1000,
    "height": 566,
    "artist": "Simon Kozhin",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:%D0%98%D0%B2%D0%B0%D0%BD_%D0%9A%D1%83%D0%BF%D0%B0%D0%BB%D0%B0.%D0%93%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5_%D0%BD%D0%B0_%D0%B2%D0%B5%D0%BD%D0%BA%D0%B0%D1%85.2008.%D0%94%D0%BE%D1%81%D0%BA%D0%B0,%D0%BC%D0%B0%D1%81%D0%BB%D0%BE150%D1%8585_%D1%81%D0%BC.jpeg",
    "title": "Иван Купала.Гадание на венках.2008.Доска,масло150х85 см.jpeg"
  },
  "busojaras": {
    "src": "/photos/festivals/busojaras.jpg",
    "width": 1000,
    "height": 663,
    "artist": "User:Themightyquill",
    "license": "CC BY-SA 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5",
    "source": "https://commons.wikimedia.org/wiki/File:Busojaras-Buso_and_Son.jpg",
    "title": "Busojaras-Buso and Son.jpg"
  },
  "taiwan-lantern-festival": {
    "src": "/photos/festivals/taiwan-lantern-festival.jpg",
    "width": 1000,
    "height": 750,
    "artist": "-Zest",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lantern_Festival_in_Taiwan_at_night_5.jpg",
    "title": "Lantern Festival in Taiwan at night 5.jpg"
  },
  "lamu-cultural-festival": {
    "src": "/photos/festivals/lamu-cultural-festival.jpg",
    "width": 960,
    "height": 544,
    "artist": "Almaddy2022",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lamu_Old_Town.jpg",
    "title": "Lamu Old Town.jpg"
  },
  "fiestas-patrias-chile": {
    "src": "/photos/festivals/fiestas-patrias-chile.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Osmar Valdebenito",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cueca_en_La_Moneda.jpg",
    "title": "Cueca en La Moneda.jpg"
  },
  "oruro-carnival": {
    "src": "/photos/festivals/oruro-carnival.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Elemaki",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Carnaval_de_Oruro_dia_I_(60).JPG",
    "title": "Carnaval de Oruro dia I (60).JPG"
  },
  "krampuslauf": {
    "src": "/photos/festivals/krampuslauf.jpg",
    "width": 1000,
    "height": 847,
    "artist": "Naturpuur",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hl._Nikolaus_in_Begleitung_des_Krampus_und_Engeln.jpg",
    "title": "Hl. Nikolaus in Begleitung des Krampus und Engeln.jpg"
  },
  "janu": {
    "src": "/photos/festivals/janu.jpg",
    "width": 1000,
    "height": 664,
    "artist": "Heinrihsons",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:P%C5%ABdeles_iedeg%C5%A1ana.jpg",
    "title": "Pūdeles iedegšana.jpg"
  },
  "thjodhatid": {
    "src": "/photos/festivals/thjodhatid.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Drumstick21",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:%C3%9Ej%C3%B3%C3%B0h%C3%A1t%C3%AD%C3%B0_2022.jpg",
    "title": "Þjóðhátíð 2022.jpg"
  },
  "jerash-festival": {
    "src": "/photos/festivals/jerash-festival.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Addustour, Jordan Press &amp; Publication Co.",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Jerash_Festival_2018_15.jpg",
    "title": "Jerash Festival 2018 15.jpg"
  },
  "boun-bang-fai": {
    "src": "/photos/festivals/boun-bang-fai.jpg",
    "width": 1000,
    "height": 638,
    "artist": "Takeaway",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:2013_Yasothon_Rocket_Festival_05.jpg",
    "title": "2013 Yasothon Rocket Festival 05.jpg"
  },
  "kwita-izina": {
    "src": "/photos/festivals/kwita-izina.jpg",
    "width": 1000,
    "height": 668,
    "artist": "Thesmiler de",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kwita_Izina.JPG",
    "title": "Kwita Izina.JPG"
  },
  "festival-on-the-niger": {
    "src": "/photos/festivals/festival-on-the-niger.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Lyfengine",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Roundabout_in_Segou_1.jpg",
    "title": "Roundabout in Segou 1.jpg"
  },
  "accompong-maroon-festival": {
    "src": "/photos/festivals/accompong-maroon-festival.jpg",
    "width": 1000,
    "height": 1002,
    "artist": "Unknown authorUnknown author",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Accompong,_Jamaica,_early_20th_century_(imp-cswc-GB-237-CSWC47-LS12-015).jpg",
    "title": "Accompong, Jamaica, early 20th century (imp-cswc-GB-237-CSWC47-LS12-015).jpg"
  },
  "diablos-danzantes-de-yare": {
    "src": "/photos/festivals/diablos-danzantes-de-yare.jpg",
    "width": 1000,
    "height": 784,
    "artist": "Wilfredor",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Dancing_Devils_of_Yare_Mask_from_Venezuela.jpg",
    "title": "Dancing Devils of Yare Mask from Venezuela.jpg"
  },
  "guca-trumpet-festival": {
    "src": "/photos/festivals/guca-trumpet-festival.jpg",
    "width": 1000,
    "height": 750,
    "artist": "svickova",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Gucastatue.JPG",
    "title": "Gucastatue.JPG"
  },
  "kurentovanje": {
    "src": "/photos/festivals/kurentovanje.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Aleš Kravos",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ale%C5%A1_Kravos_Kurentovanje_Ptuj_2019.jpg",
    "title": "Aleš Kravos Kurentovanje Ptuj 2019.jpg"
  },
  "jaanipaev": {
    "src": "/photos/festivals/jaanipaev.jpg",
    "width": 748,
    "height": 1250,
    "artist": "KrK",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Jaanituli.jpg",
    "title": "Jaanituli.jpg"
  },
  "rtveli": {
    "src": "/photos/festivals/rtveli.jpg",
    "width": 1000,
    "height": 775,
    "artist": "Grigory Gagarin",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Vendanges_en_Kakhetie_(B).jpg",
    "title": "Vendanges en Kakhetie (B).jpg"
  },
  "silk-and-spices-festival": {
    "src": "/photos/festivals/silk-and-spices-festival.jpg",
    "width": 1000,
    "height": 479,
    "artist": "Euyasik",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kalon-Ensemble_Buchara.jpg",
    "title": "Kalon-Ensemble Buchara.jpg"
  },
  "sahara-festival-douz": {
    "src": "/photos/festivals/sahara-festival-douz.jpg",
    "width": 1000,
    "height": 666,
    "artist": "McKay Savage from London, UK",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Tunisia_10-12_-_064_-_Douz_and_the_Festival_of_the_Sahara_(6609290791).jpg",
    "title": "Tunisia 10-12 - 064 - Douz and the Festival of the Sahara (6609290791).jpg"
  },
  "ngondo": {
    "src": "/photos/festivals/ngondo.jpg",
    "width": 1000,
    "height": 663,
    "artist": "Mbiele Happi",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:GedNgondoMessager.JPG",
    "title": "GedNgondoMessager.JPG"
  },
  "sumpango-kites": {
    "src": "/photos/festivals/sumpango-kites.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Jasonjdgr",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Festival_Sumpango_%2707_041.jpg",
    "title": "Festival Sumpango '07 041.jpg"
  },
  "vychodna-folklore-festival": {
    "src": "/photos/festivals/vychodna-folklore-festival.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Achernar.sk",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Vychodna.JPG",
    "title": "Vychodna.JPG"
  },
  "schueberfouer": {
    "src": "/photos/festivals/schueberfouer.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Procrastineur49",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Schueberfouer_2025_2.jpg",
    "title": "Schueberfouer 2025 2.jpg"
  },
  "sarajevo-film-festival": {
    "src": "/photos/festivals/sarajevo-film-festival.jpg",
    "width": 1000,
    "height": 792,
    "artist": "Adnasaida",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Open_Air_Drone-4_(1)_2_(cropped).jpg",
    "title": "Open Air Drone-4 (1) 2 (cropped).jpg"
  },
  "moldova-wine-day": {
    "src": "/photos/festivals/moldova-wine-day.jpg",
    "width": 1000,
    "height": 666,
    "artist": "USAID Digital Development",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Moldova_Competitiveness_Project,_USAID_Moldova_(48121804303).jpg",
    "title": "Moldova Competitiveness Project, USAID Moldova (48121804303).jpg"
  },
  "abissa": {
    "src": "/photos/festivals/abissa.jpg",
    "width": 799,
    "height": 508,
    "artist": "Joker-x http://fr.wikipedia.org/wiki/User:Joker-x",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:800px-Grand-Bassam.jpg",
    "title": "800px-Grand-Bassam.jpg"
  },
  "naghol": {
    "src": "/photos/festivals/naghol.jpg",
    "width": 1000,
    "height": 710,
    "artist": "Paul Stein from New Jersey, USA",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Landdiving1.jpg",
    "title": "Landdiving1.jpg"
  },
  "fallas-del-pirineu": {
    "src": "/photos/festivals/fallas-del-pirineu.jpg",
    "width": 937,
    "height": 1250,
    "artist": "JSama",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Baixada_de_Falles_a_Sort,_2026.jpg",
    "title": "Baixada de Falles a Sort, 2026.jpg"
  },
  "liechtenstein-national-day": {
    "src": "/photos/festivals/liechtenstein-national-day.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Förkle",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hans_Adam_II_Schlosswiese_2023.jpg",
    "title": "Hans Adam II Schlosswiese 2023.jpg"
  },
  "luanda-carnival": {
    "src": "/photos/festivals/luanda-carnival.jpg",
    "width": 1000,
    "height": 605,
    "artist": "Iamdelcioborges",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Luanda_2025_focused_(cropped).jpg",
    "title": "Luanda 2025 focused (cropped).jpg"
  },
  "bissau-carnival": {
    "src": "/photos/festivals/bissau-carnival.jpg",
    "width": 1000,
    "height": 488,
    "artist": "Original: Colleen Taugher from Lewiston Idaho, USA Modifications: The original u",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bissau-Stroossenzeen--w.jpg",
    "title": "Bissau-Stroossenzeen--w.jpg"
  },
  "la-ceiba-carnival": {
    "src": "/photos/festivals/la-ceiba-carnival.jpg",
    "width": 1000,
    "height": 563,
    "artist": "InterCoined",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Letras_de_La_Ceiba.jpg",
    "title": "Letras de La Ceiba.jpg"
  },
  "angam-day": {
    "src": "/photos/festivals/angam-day.jpg",
    "width": 1000,
    "height": 634,
    "artist": "Taken in 1896 by Augustin Krämer and uploaded by Rémih",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Scene_at_Arenibek.jpg",
    "title": "Scene at Arenibek.jpg"
  },
  "thanksgiving": {
    "src": "/photos/festivals/thanksgiving.jpg",
    "width": 900,
    "height": 688,
    "artist": "Jean Leon Gerome Ferris",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:The_First_Thanksgiving_Jean_Louis_Gerome_Ferris.png",
    "title": "The First Thanksgiving Jean Louis Gerome Ferris.png"
  },
  "lohri": {
    "src": "/photos/festivals/lohri.jpg",
    "width": 891,
    "height": 1250,
    "artist": "Callofthenight",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lohri-fire.jpg",
    "title": "Lohri-fire.jpg"
  },
  "ram-navami": {
    "src": "/photos/festivals/ram-navami.jpg",
    "width": 862,
    "height": 1188,
    "artist": "Tariq Khan via DTM",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ram_in_Ayodhya.jpg",
    "title": "Ram in Ayodhya.jpg"
  },
  "hornbill-festival": {
    "src": "/photos/festivals/hornbill-festival.jpg",
    "width": 960,
    "height": 720,
    "artist": "Homen Biswas",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hornbil_Festival,_Kohima_6.jpg",
    "title": "Hornbil Festival, Kohima 6.jpg"
  },
  "barranquilla-carnival": {
    "src": "/photos/festivals/barranquilla-carnival.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Horaciotaricco",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Horacio_Taricco_Lavin_Carnaval_de_barranquilla_colombia.jpg",
    "title": "Horacio Taricco Lavin Carnaval de barranquilla colombia.jpg"
  },
  "sao-joao-porto": {
    "src": "/photos/festivals/sao-joao-porto.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Hugo Cadavez from Portugal",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Festa_de_Sao_Joao_(Porto).jpg",
    "title": "Festa de Sao Joao (Porto).jpg"
  },
  "vendimia": {
    "src": "/photos/festivals/vendimia.jpg",
    "width": 1000,
    "height": 657,
    "artist": "Tanenhaus",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Reina_de_La_Paz_(2348694105).jpg",
    "title": "Reina de La Paz (2348694105).jpg"
  },
  "quebec-winter-carnival": {
    "src": "/photos/festivals/quebec-winter-carnival.jpg",
    "width": 1000,
    "height": 675,
    "artist": "Shapiros10",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Carnival_1.jpg",
    "title": "Carnival 1.jpg"
  },
  "fes-sacred-music": {
    "src": "/photos/festivals/fes-sacred-music.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Ramon Fornós",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:FESTIVAL_FES_2102_ARCHIE_SHEPP.JPG",
    "title": "FESTIVAL FES 2102 ARCHIE SHEPP.JPG"
  },
  "smigus-dyngus": {
    "src": "/photos/festivals/smigus-dyngus.jpg",
    "width": 1000,
    "height": 763,
    "artist": "Polimerek",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Smiergusnicy_polewaja_panne_2.jpg",
    "title": "Smiergusnicy polewaja panne 2.jpg"
  },
  "baba-marta": {
    "src": "/photos/festivals/baba-marta.jpg",
    "width": 1000,
    "height": 600,
    "artist": "GadzhevaMaya",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Baba_Marta.jpg",
    "title": "Baba Marta.jpg"
  },
  "paro-tsechu": {
    "src": "/photos/festivals/paro-tsechu.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Stephen Shephard",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Dance_of_the_Black_Hats_-_Paro_Tsechu.jpg",
    "title": "Dance of the Black Hats - Paro Tsechu.jpg"
  },
  "sauti-za-busara": {
    "src": "/photos/festivals/sauti-za-busara.jpg",
    "width": 834,
    "height": 1250,
    "artist": "Sameer Kermalli",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Divine_light_for_music!.jpg",
    "title": "Divine light for music!.jpg"
  },
  "saint-louis-jazz": {
    "src": "/photos/festivals/saint-louis-jazz.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Ji-Elle",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Saint-Louis-du-S%C3%A9n%C3%A9gal.JPG",
    "title": "Saint-Louis-du-Sénégal.JPG"
  },
  "goroka-show": {
    "src": "/photos/festivals/goroka-show.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Anselmo Lastra",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Goroka_Show_-_Lastra.jpg",
    "title": "Goroka Show - Lastra.jpg"
  },
  "uzgavenes": {
    "src": "/photos/festivals/uzgavenes.jpg",
    "width": 830,
    "height": 1250,
    "artist": "Andrius Petrucenia",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Uzgavenes_2010_-_more.jpg",
    "title": "Uzgavenes 2010 - more.jpg"
  },
  "martisor": {
    "src": "/photos/festivals/martisor.jpg",
    "width": 835,
    "height": 1250,
    "artist": "Endangered Snowdrop",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Traditional_Romanian_M%C4%83r%C8%9Bi%C8%99or.jpg",
    "title": "Traditional Romanian Mărțișor.jpg"
  },
  "dia-de-los-difuntos-ecuador": {
    "src": "/photos/festivals/dia-de-los-difuntos-ecuador.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Ceibos",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Tradici%C3%B3n_del_d%C3%ADa_de_los_difuntos_en_la_pen%C3%ADnsula_de_Santa_Elena.jpg",
    "title": "Tradición del día de los difuntos en la península de Santa Elena.jpg"
  },
  "haitian-kanaval": {
    "src": "/photos/festivals/haitian-kanaval.jpg",
    "width": 960,
    "height": 881,
    "artist": "Bmcao2",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Haitian_Carnival_(Kanaval).jpg",
    "title": "Haitian Carnival (Kanaval).jpg"
  },
  "desfile-de-llamadas": {
    "src": "/photos/festivals/desfile-de-llamadas.jpg",
    "width": 832,
    "height": 1250,
    "artist": "Jimmy Baikovicius from Montevideo, Uruguay",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Desfile_de_Llamadas_-_Montevideo,_Uruguay_-_February_2011_-_(1).jpg",
    "title": "Desfile de Llamadas - Montevideo, Uruguay - February 2011 - (1).jpg"
  },
  "teuila-festival": {
    "src": "/photos/festivals/teuila-festival.jpg",
    "width": 992,
    "height": 1250,
    "artist": "OceaniaRiseUp",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Moemoana_Safa%CA%BBato%CA%BBa_Schwenke.jpg",
    "title": "Moemoana Safaʻatoʻa Schwenke.jpg"
  },
  "feast-of-saint-blaise": {
    "src": "/photos/festivals/feast-of-saint-blaise.jpg",
    "width": 1000,
    "height": 1081,
    "artist": "Martin Falbisoner",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Saint_Blaise%27s_Church,_Dubrovnik_-_September_2017.jpg",
    "title": "Saint Blaise's Church, Dubrovnik - September 2017.jpg"
  },
  "dita-e-veres": {
    "src": "/photos/festivals/dita-e-veres.jpg",
    "width": 1000,
    "height": 663,
    "artist": "Buona1",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Dita_e_Veres_01.jpg",
    "title": "Dita e Veres 01.jpg"
  },
  "vardavar": {
    "src": "/photos/festivals/vardavar.jpg",
    "width": 800,
    "height": 533,
    "artist": "Камалян001",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Vardavar_011_Vartavar.jpg",
    "title": "Vardavar 011 Vartavar.jpg"
  },
  "kuomboka": {
    "src": "/photos/festivals/kuomboka.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Jae zambia",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kuomboka_ceremony_in_Zambia_11.jpg",
    "title": "Kuomboka ceremony in Zambia 11.jpg"
  },
  "las-tablas-carnival": {
    "src": "/photos/festivals/las-tablas-carnival.jpg",
    "width": 1000,
    "height": 1000,
    "artist": "Carnaval.com Studios",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Las_Tablas_Carnaval_Sunday_Night_10.jpg",
    "title": "Las Tablas Carnaval Sunday Night 10.jpg"
  },
  "mnarja": {
    "src": "/photos/festivals/mnarja.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Jonathan borg zigli",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:L-IMNARJA.jpg",
    "title": "L-IMNARJA.jpg"
  },
  "ohrid-summer-festival": {
    "src": "/photos/festivals/ohrid-summer-festival.jpg",
    "width": 1000,
    "height": 738,
    "artist": "Marcin Konsek",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:2011_Ochryda,_Antyczny_teatr_(02).jpg",
    "title": "2011 Ochryda, Antyczny teatr (02).jpg"
  },
  "la-vega-carnival": {
    "src": "/photos/festivals/la-vega-carnival.jpg",
    "width": 500,
    "height": 667,
    "artist": "Vegano1988",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Dominican_Republic_Carnival_Mask_La_Vega.jpg",
    "title": "Dominican Republic Carnival Mask La Vega.jpg"
  },
  "umhlanga": {
    "src": "/photos/festivals/umhlanga.jpg",
    "width": 1000,
    "height": 620,
    "artist": "Amada44",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Eswatini_Reed_Dance_2006_-01.jpg",
    "title": "Eswatini Reed Dance 2006 -01.jpg"
  },
  "mindelo-carnival": {
    "src": "/photos/festivals/mindelo-carnival.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Hanay",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:%D7%A7%D7%A8%D7%A0%D7%91%D7%9C_%D7%9E%D7%99%D7%A0%D7%93%D7%9C%D7%95_%D7%91%D7%90%D7%99_%D7%A1%D7%90%D7%95_%D7%95%D7%99%D7%A1%D7%A0%D7%98%D7%94_%D7%91%D7%90%D7%99%D7%99_%D7%9B%D7%A3_%D7%95%D7%A8%D7%93%D7%94_%D7%A4%D7%91%D7%A8%D7%95%D7%90%D7%A8_2023_21.jpg",
    "title": "קרנבל מינדלו באי סאו ויסנטה באיי כף ורדה פברואר 2023 21.jpg"
  },
  "fiestas-agostinas": {
    "src": "/photos/festivals/fiestas-agostinas.jpg",
    "width": 960,
    "height": 719,
    "artist": "Echa24161",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cathedral_of_San_Salvador_2023.png",
    "title": "Cathedral of San Salvador 2023.png"
  },
  "garifuna-settlement-day": {
    "src": "/photos/festivals/garifuna-settlement-day.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Garinagu Melivn",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Garifuna_Celebration,_19th_November,_Dangriga,_Belize.jpg",
    "title": "Garifuna Celebration, 19th November, Dangriga, Belize.jpg"
  },
  "palo-de-mayo": {
    "src": "/photos/festivals/palo-de-mayo.jpg",
    "width": 833,
    "height": 1250,
    "artist": "HazelPacheco",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Palo_de_Mayo,_Panam%C3%A1.jpg",
    "title": "Palo de Mayo, Panamá.jpg"
  },
  "sainte-devote": {
    "src": "/photos/festivals/sainte-devote.jpg",
    "width": 1000,
    "height": 1000,
    "artist": "Alexander Migl",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:%C3%89glise_de_Saint-D%C3%A9vote_Monaco_IMG_1204.jpg",
    "title": "Église de Saint-Dévote Monaco IMG 1204.jpg"
  },
  "fespam": {
    "src": "/photos/festivals/fespam.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Dienb5",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Image_du_Fespam_2025_12e_%C3%A9dition_18.jpg",
    "title": "Image du Fespam 2025 12e édition 18.jpg"
  },
  "kataklysmos": {
    "src": "/photos/festivals/kataklysmos.jpg",
    "width": 1000,
    "height": 663,
    "artist": "Valantis Antoniades",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Castle_square_wharf.JPG",
    "title": "Castle square wharf.JPG"
  },
  "moshoeshoe-day": {
    "src": "/photos/festivals/moshoeshoe-day.jpg",
    "width": 1000,
    "height": 667,
    "artist": "U.S. Embassy Maseru",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:King_Moshoeshoe_Day_2023_at_Thaba_Bosiu.jpg",
    "title": "King Moshoeshoe Day 2023 at Thaba Bosiu.jpg"
  },
  "famadihana": {
    "src": "/photos/festivals/famadihana.jpg",
    "width": 1000,
    "height": 666,
    "artist": "MPMF24",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:FAMADIHANA_MPMF24.jpg",
    "title": "FAMADIHANA MPMF24.jpg"
  },
  "lake-of-stars": {
    "src": "/photos/festivals/lake-of-stars.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Casperntilo",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ric_Hassani_at_LOS.jpg",
    "title": "Ric Hassani at LOS.jpg"
  },
  "maharero-day": {
    "src": "/photos/festivals/maharero-day.jpg",
    "width": 861,
    "height": 1250,
    "artist": "Unknown photographer",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:SamuelMaharero.jpg",
    "title": "SamuelMaharero.jpg"
  },
  "liberia-independence-day": {
    "src": "/photos/festivals/liberia-independence-day.jpg",
    "width": 1000,
    "height": 727,
    "artist": "Unknown authorUnknown author",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Liberian_Independence_Day_Celebration_2019.png",
    "title": "Liberian Independence Day Celebration 2019.png"
  },
  "yap-day": {
    "src": "/photos/festivals/yap-day.jpg",
    "width": 1000,
    "height": 666,
    "artist": "U.S. Navy photo by Petty Officer 3rd Class Luis Sanchez",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:SEABEES_FROM_DETACHMENT_YAP_CELEBRATE_YAP_DAY_(8945780).jpg",
    "title": "SEABEES FROM DETACHMENT YAP CELEBRATE YAP DAY (8945780).jpg"
  },
  "vaisakhi": {
    "src": "/photos/festivals/vaisakhi.jpg",
    "width": 960,
    "height": 990,
    "artist": "Michael Clark",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Handsworth_Vaisakhi.jpg",
    "title": "Handsworth Vaisakhi.jpg"
  },
  "santiago-de-cuba-carnival": {
    "src": "/photos/festivals/santiago-de-cuba-carnival.jpg",
    "width": 1000,
    "height": 666,
    "artist": "DnTrotaMundos ☮",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:De_carnaval_en_Santiago_de_Cuba_-_panoramio.jpg",
    "title": "De carnaval en Santiago de Cuba - panoramio.jpg"
  },
  "masopust": {
    "src": "/photos/festivals/masopust.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Pohled 111",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Pr%C5%AFvod_a_zastaven%C3%AD_U_Bo%C5%99il%C5%AF_(Masopust)_02.jpg",
    "title": "Průvod a zastavení U Bořilů (Masopust) 02.jpg"
  },
  "sankt-hans": {
    "src": "/photos/festivals/sankt-hans.jpg",
    "width": 1000,
    "height": 1000,
    "artist": "Kristian Bang",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Sankt_Hans_B%C3%A5l_p%C3%A5_Engen.jpg",
    "title": "Sankt Hans Bål på Engen.jpg"
  },
  "nauryz": {
    "src": "/photos/festivals/nauryz.jpg",
    "width": 1000,
    "height": 563,
    "artist": "Graphique38",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Nauryz_in_Pavlodar.jpg",
    "title": "Nauryz in Pavlodar.jpg"
  },
  "baalbeck-festival": {
    "src": "/photos/festivals/baalbeck-festival.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Vyacheslav Argenberg",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lebanon,_Baalbek,_Temple_of_Bacchus_2.jpg",
    "title": "Lebanon, Baalbek, Temple of Bacchus 2.jpg"
  },
  "fespaco": {
    "src": "/photos/festivals/fespaco.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Sputniktilt",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Siege_FESPACO_Ouaga.jpg",
    "title": "Siege FESPACO Ouaga.jpg"
  },
  "heilala-festival": {
    "src": "/photos/festivals/heilala-festival.jpg",
    "width": 1000,
    "height": 745,
    "artist": "Tauʻolunga",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Garcinia_sessilis,_flower.jpg",
    "title": "Garcinia sessilis, flower.jpg"
  },
  "evala": {
    "src": "/photos/festivals/evala.jpg",
    "width": 1000,
    "height": 865,
    "artist": "Wisdom Mensah de Linitiateur",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Evala_chez_le_peuple_Kaby%C3%A9_au_Nord_du_Togo.jpg",
    "title": "Evala chez le peuple Kabyé au Nord du Togo.jpg"
  },
  "chopi-timbila": {
    "src": "/photos/festivals/chopi-timbila.jpg",
    "width": 1000,
    "height": 636,
    "artist": "Jean-Pierre Dalbéra from Paris, France",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Le_Timbila,_xylophone_du_Mozambique_(Biennale_de_Venise_2015)_(20192901852).jpg",
    "title": "Le Timbila, xylophone du Mozambique (Biennale de Venise 2015) (20192901852).jpg"
  },
  "tuvalu-independence-day": {
    "src": "/photos/festivals/tuvalu-independence-day.jpg",
    "width": 1000,
    "height": 563,
    "artist": "JialiangGao",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Fatele_Funafuti_Tuvalu.jpg",
    "title": "Fatele Funafuti Tuvalu.jpg"
  },
  "orthodox-easter-greece": {
    "src": "/photos/festivals/orthodox-easter-greece.jpg",
    "width": 1000,
    "height": 670,
    "artist": "Jean Housen",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Orthodox_cross_procession_Corfu_Easter_2014.jpg",
    "title": "Orthodox cross procession Corfu Easter 2014.jpg"
  },
  "dia-del-boyero": {
    "src": "/photos/festivals/dia-del-boyero.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Jmillan325",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Entrada_de_Boyeros.jpg",
    "title": "Entrada de Boyeros.jpg"
  },
  "kiribati-independence-day": {
    "src": "/photos/festivals/kiribati-independence-day.jpg",
    "width": 783,
    "height": 1250,
    "artist": "Nomis Elaws",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:I-Kiribati_dancer.jpg",
    "title": "I-Kiribati dancer.jpg"
  },
  "palau-independence-day": {
    "src": "/photos/festivals/palau-independence-day.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Wang Yu Ching / Office of the President (中華民國總統府)",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Dance_show_in_Palau_2019-03-23.jpg",
    "title": "Dance show in Palau 2019-03-23.jpg"
  },
  "marshall-islands-constitution-day": {
    "src": "/photos/festivals/marshall-islands-constitution-day.jpg",
    "width": 1000,
    "height": 666,
    "artist": "總統府",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:10.30_%E9%A6%AC%E5%9C%8B%E5%82%B3%E7%B5%B1%E3%80%8C%E6%A3%8D%E6%A3%92%E8%88%9E%E8%B9%88%E3%80%8D%EF%BC%88Jabwa_Dance%EF%BC%89%E8%A1%A8%E6%BC%94_(37343844894).jpg",
    "title": "10.30 馬國傳統「棍棒舞蹈」（Jabwa Dance）表演 (37343844894).jpg"
  },
  "vincy-mas": {
    "src": "/photos/festivals/vincy-mas.jpg",
    "width": 1000,
    "height": 641,
    "artist": "Charles R. Childs",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Kingstown_-_Natives_in_carnival_costume.jpg",
    "title": "Kingstown - Natives in carnival costume.jpg"
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
  },
  "gajak": {
    "src": "/photos/dishes/gajak.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Khalid Mahmood",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gachak.JPG",
    "title": "Gachak.JPG"
  },
  "sarson-da-saag": {
    "src": "/photos/dishes/sarson-da-saag.jpg",
    "width": 500,
    "height": 375,
    "artist": "w:en:User:Lokantha",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Saagroti.jpg",
    "title": "Saagroti.jpg"
  },
  "panakam": {
    "src": "/photos/dishes/panakam.jpg",
    "width": 833,
    "height": 1250,
    "artist": "Nithyasrm",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Panagam_picture.JPG",
    "title": "Panagam picture.JPG"
  },
  "khaja": {
    "src": "/photos/dishes/khaja.jpg",
    "width": 1000,
    "height": 976,
    "artist": "Subhashish Panigrahi",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Baleswari_khaja_pheni_Oriya_cuisine.jpg",
    "title": "Baleswari khaja pheni Oriya cuisine.jpg"
  },
  "ghevar": {
    "src": "/photos/dishes/ghevar.jpg",
    "width": 1000,
    "height": 673,
    "artist": "Pradeep717",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ghevar_with_Malai_Topping.jpg",
    "title": "Ghevar with Malai Topping.jpg"
  },
  "sabudana-khichdi": {
    "src": "/photos/dishes/sabudana-khichdi.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Sharvarism",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Upwas_Special_Sabudana_Khichadi.jpg",
    "title": "Upwas Special Sabudana Khichadi.jpg"
  },
  "mathri": {
    "src": "/photos/dishes/mathri.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Randhir",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Mathri.JPG",
    "title": "Mathri.JPG"
  },
  "thekua": {
    "src": "/photos/dishes/thekua.jpg",
    "width": 1000,
    "height": 665,
    "artist": "Biswarup Ganguly",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Thekua_-_Chhath_Festival_-_Kolkata_2013-11-09_4316.JPG",
    "title": "Thekua - Chhath Festival - Kolkata 2013-11-09 4316.JPG"
  },
  "blini": {
    "src": "/photos/dishes/blini.jpg",
    "width": 1000,
    "height": 1000,
    "artist": "Maksim L.",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:50_%D0%B1%D0%BB%D1%96%D0%BD%D0%BA%D0%BE%D1%9E_%D0%BD%D0%B0_%D1%82%D0%B0%D0%BB%D0%B5%D1%80%D1%86%D1%8B_240_%D0%BC%D0%BC.jpg",
    "title": "50 блінкоў на талерцы 240 мм.jpg"
  },
  "tsoureki": {
    "src": "/photos/dishes/tsoureki.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Jason Hollinger",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Christopsomo_-_Greek_Christmas_Bread_-_Flickr_-_pellaea.jpg",
    "title": "Christopsomo - Greek Christmas Bread - Flickr - pellaea.jpg"
  },
  "mont-lone-yay-paw": {
    "src": "/photos/dishes/mont-lone-yay-paw.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Wagaung at en.wikipedia",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:MontLone_yeibaw.JPG",
    "title": "MontLone yeibaw.JPG"
  },
  "mazurek": {
    "src": "/photos/dishes/mazurek.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Madzia Bryll",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:91365_Mazurek.jpg",
    "title": "91365 Mazurek.jpg"
  },
  "varenyky": {
    "src": "/photos/dishes/varenyky.jpg",
    "width": 1000,
    "height": 666,
    "artist": "DemieK07",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Varenyky_with_Potatoes_-_2026_-03.jpg",
    "title": "Varenyky with Potatoes - 2026 -03.jpg"
  },
  "kurtoskalacs": {
    "src": "/photos/dishes/kurtoskalacs.jpg",
    "width": 1000,
    "height": 1248,
    "artist": "Cyril5555",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:K%C3%BCrt%C5%91skal%C3%A1cs2011.jpg",
    "title": "Kürtőskalács2011.jpg"
  },
  "banitsa": {
    "src": "/photos/dishes/banitsa.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Sheku80",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:%D0%92%D0%BA%D1%83%D1%81%D0%BD%D0%B0_%D0%B4%D0%BE%D0%BC%D0%B0%D1%88%D0%BD%D0%B0_%D0%B1%D0%B0%D0%BD%D0%B8%D1%86%D0%B0.JPG",
    "title": "Вкусна домашна баница.JPG"
  },
  "tangyuan": {
    "src": "/photos/dishes/tangyuan.jpg",
    "width": 880,
    "height": 587,
    "artist": "cherrylet",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Pumpkin_tangyuan_(%E6%B1%A4%E5%9C%86)_with_red_bean_baste_and_black_sesame_fillings.jpg",
    "title": "Pumpkin tangyuan (汤圆) with red bean baste and black sesame fillings.jpg"
  },
  "mandazi": {
    "src": "/photos/dishes/mandazi.jpg",
    "width": 576,
    "height": 384,
    "artist": "The original uploader was ChildofMidnight at English Wikipedia.",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bowl_of_mandazi.jpg",
    "title": "Bowl of mandazi.jpg"
  },
  "vanillekipferl": {
    "src": "/photos/dishes/vanillekipferl.jpg",
    "width": 1000,
    "height": 664,
    "artist": "Schlurcher",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Vanillekipferl-Nahaufnahme.jpg",
    "title": "Vanillekipferl-Nahaufnahme.jpg"
  },
  "janu-siers": {
    "src": "/photos/dishes/janu-siers.jpg",
    "width": 1000,
    "height": 1000,
    "artist": "Xil",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Caraway_cheese.jpg",
    "title": "Caraway cheese.jpg"
  },
  "cozonac": {
    "src": "/photos/dishes/cozonac.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Vvssmmaann",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cozonac-cu-nuca-103.jpg",
    "title": "Cozonac-cu-nuca-103.jpg"
  },
  "khao-niao": {
    "src": "/photos/dishes/khao-niao.jpg",
    "width": 1000,
    "height": 667,
    "artist": "국립국어원",
    "license": "CC BY-SA 2.0 kr",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/kr/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Chapssal_(glutinous_rice).jpg",
    "title": "Chapssal (glutinous rice).jpg"
  },
  "roast-breadfruit": {
    "src": "/photos/dishes/roast-breadfruit.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Hans Hillewaert",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Artocarpus_altilis_(fruit).jpg",
    "title": "Artocarpus altilis (fruit).jpg"
  },
  "ballokume": {
    "src": "/photos/dishes/ballokume.jpg",
    "width": 703,
    "height": 1250,
    "artist": "Esmeralda Ko",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ballokume_dhe_lule.jpg",
    "title": "Ballokume dhe lule.jpg"
  },
  "chipa": {
    "src": "/photos/dishes/chipa.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Horacio Cambeiro",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chipa_paraguaya_en_el_Circuito_Comercial_de_Encarnaci%C3%B3n_(Paraguay).jpg",
    "title": "Chipa paraguaya en el Circuito Comercial de Encarnación (Paraguay).jpg"
  },
  "maamoul": {
    "src": "/photos/dishes/maamoul.jpg",
    "width": 1000,
    "height": 564,
    "artist": "روتانا",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ma%27amoul_Filled_with_Dates_and_Nuts.jpg",
    "title": "Ma'amoul Filled with Dates and Nuts.jpg"
  },
  "zongzi": {
    "src": "/photos/dishes/zongzi.jpg",
    "width": 1000,
    "height": 1127,
    "artist": "Emilyyxx",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:China_Northwestern_Style_Zongzi.jpg",
    "title": "China Northwestern Style Zongzi.jpg"
  },
  "soda-bread": {
    "src": "/photos/dishes/soda-bread.jpg",
    "width": 1000,
    "height": 999,
    "artist": "Jim  Lukach",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Irish_soda_bread_(25292114472)_(cropped).jpg",
    "title": "Irish soda bread (25292114472) (cropped).jpg"
  },
  "jollof-rice": {
    "src": "/photos/dishes/jollof-rice.jpg",
    "width": 1000,
    "height": 1010,
    "artist": "Atimukoh",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Native_Jollof_Rice_(cropped).jpg",
    "title": "Native Jollof Rice (cropped).jpg"
  },
  "kpokpoi": {
    "src": "/photos/dishes/kpokpoi.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Niiarmahktagoe",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Image_from_Homowo_Festival(Ga_Mashie)_1.jpg",
    "title": "Image from Homowo Festival(Ga Mashie) 1.jpg"
  },
  "tilkut": {
    "src": "/photos/dishes/tilkut.jpg",
    "width": 703,
    "height": 1250,
    "artist": "Goutam1962",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Tilkut_preparation_during_Sankranti_01.jpg",
    "title": "Tilkut preparation during Sankranti 01.jpg"
  },
  "ugadi-pachadi": {
    "src": "/photos/dishes/ugadi-pachadi.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Srinivas14",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:UgadiPachadi.JPG",
    "title": "UgadiPachadi.JPG"
  },
  "til-pitha": {
    "src": "/photos/dishes/til-pitha.jpg",
    "width": 1000,
    "height": 750,
    "artist": "পাপৰি বৰা",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Til_Pitha_2.jpg",
    "title": "Til Pitha 2.jpg"
  },
  "tompouce": {
    "src": "/photos/dishes/tompouce.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Amin",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Tompouce_tompoes.jpg",
    "title": "Tompouce tompoes.jpg"
  },
  "ambok": {
    "src": "/photos/dishes/ambok.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Willuconquer",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ak_Ambok.jpg",
    "title": "Ak Ambok.jpg"
  },
  "colada-morada": {
    "src": "/photos/dishes/colada-morada.jpg",
    "width": 960,
    "height": 720,
    "artist": "Juan Jorge Arellano Lima, Perú",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Colada_morada.jpg",
    "title": "Colada morada.jpg"
  },
  "churchkhela": {
    "src": "/photos/dishes/churchkhela.jpg",
    "width": 500,
    "height": 330,
    "artist": "Levan Gokadze (uploaded by Giorgi Balakhadze)",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kakheti,_Georgia_%E2%80%94_Churchkhela.jpg",
    "title": "Kakheti, Georgia — Churchkhela.jpg"
  },
  "maple-taffy": {
    "src": "/photos/dishes/maple-taffy.jpg",
    "width": 960,
    "height": 720,
    "artist": "MartialArtsNomad.com from Vancouver, Canada",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Taffysicles_(4068260392).jpg",
    "title": "Taffysicles (4068260392).jpg"
  },
  "kada-prasad": {
    "src": "/photos/dishes/kada-prasad.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Immanuelle",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Golden_Temple_complex-Karah_Parshad.jpg",
    "title": "Golden Temple complex-Karah Parshad.jpg"
  },
  "ftira": {
    "src": "/photos/dishes/ftira.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Slganado",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Ftira.JPG",
    "title": "Ftira.JPG"
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
  },
  "lehenga-choli": {
    "src": "/photos/attire/lehenga-choli.jpg",
    "width": 810,
    "height": 1250,
    "artist": "Usblogger27",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_flared_lehenga.jpg",
    "title": "A flared lehenga.jpg"
  },
  "shalwar-kameez": {
    "src": "/photos/attire/shalwar-kameez.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Bernard Gagnon",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Women_of_Puducherry.jpg",
    "title": "Women of Puducherry.jpg"
  },
  "qipao": {
    "src": "/photos/attire/qipao.jpg",
    "width": 833,
    "height": 1250,
    "artist": "Peachyeung316",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_White_cheongsam_at_Shum_Shui_Po.jpg",
    "title": "A White cheongsam at Shum Shui Po.jpg"
  },
  "mantilla": {
    "src": "/photos/attire/mantilla.jpg",
    "width": 960,
    "height": 1175,
    "artist": "Museu Valencià d'Etnologia from València, España",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Objectes_de_la_Sala_Sec%C3%A0_i_Muntanya_(26914857930).jpg",
    "title": "Objectes de la Sala Secà i Muntanya (26914857930).jpg"
  },
  "habesha-kemis": {
    "src": "/photos/attire/habesha-kemis.jpg",
    "width": 937,
    "height": 1250,
    "artist": "Elroe tadele",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Shimgilina.jpg",
    "title": "Shimgilina.jpg"
  },
  "kente": {
    "src": "/photos/attire/kente.jpg",
    "width": 1000,
    "height": 795,
    "artist": "Warmglow",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Different_Kente_cloth,_Tafi,_Volta_region.jpg",
    "title": "Different Kente cloth, Tafi, Volta region.jpg"
  },
  "chut-thai": {
    "src": "/photos/attire/chut-thai.jpg",
    "width": 960,
    "height": 1162,
    "artist": "Z3144228",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:(Detail)_Siam_traditional_clothes.jpg",
    "title": "(Detail) Siam traditional clothes.jpg"
  },
  "midsommarkrans": {
    "src": "/photos/attire/midsommarkrans.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Peter Salanki",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Midsommarkransar.jpg",
    "title": "Midsommarkransar.jpg"
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
  },
  "kohima": {
    "src": "/photos/places/kohima.jpg",
    "width": 1000,
    "height": 749,
    "artist": "The Anonymous Earthling",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Capital_Cultural_Hall.jpg",
    "title": "Capital Cultural Hall.jpg"
  },
  "paris": {
    "src": "/photos/places/paris.jpg",
    "width": 1000,
    "height": 625,
    "artist": "Yann Caradec from Paris, France",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques,_Paris_ao%C3%BBt_2014_(2).jpg",
    "title": "La Tour Eiffel vue de la Tour Saint-Jacques, Paris août 2014 (2).jpg"
  },
  "barranquilla": {
    "src": "/photos/places/barranquilla.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Jdvillalobos",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Antigua_Aduana_de_Barranquilla.jpg",
    "title": "Antigua Aduana de Barranquilla.jpg"
  },
  "porto": {
    "src": "/photos/places/porto.jpg",
    "width": 1000,
    "height": 617,
    "artist": "Diego Delso",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Puente_Don_Luis_I,_Oporto,_Portugal,_2012-05-09,_DD_13.JPG",
    "title": "Puente Don Luis I, Oporto, Portugal, 2012-05-09, DD 13.JPG"
  },
  "mendoza": {
    "src": "/photos/places/mendoza.jpg",
    "width": 720,
    "height": 405,
    "artist": "CavernSaga",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Mendoza.png",
    "title": "Aerial view of Mendoza.png"
  },
  "fes": {
    "src": "/photos/places/fes.jpg",
    "width": 1000,
    "height": 614,
    "artist": "This Photo was taken by Timothy A. Gonsalves. Feel free to use my photos, but pl",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bab_Bou_Jeloud_Frame_Minaret_Fes_Nov25_A7CR_09127-8_HDR3.jpg",
    "title": "Bab Bou Jeloud Frame Minaret Fes Nov25 A7CR 09127-8 HDR3.jpg"
  },
  "santiago-de-cuba": {
    "src": "/photos/places/santiago-de-cuba.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Alex Cano",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Santiago_de_cuba_al_atardecer.jpg",
    "title": "Santiago de cuba al atardecer.jpg"
  },
  "binche": {
    "src": "/photos/places/binche.jpg",
    "width": 1000,
    "height": 638,
    "artist": "Unknown",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Binche_JPG01.jpg",
    "title": "Binche JPG01.jpg"
  },
  "prague": {
    "src": "/photos/places/prague.jpg",
    "width": 1000,
    "height": 595,
    "artist": "Moyan Brenn from Italy",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Prague_(6365119737).jpg",
    "title": "Prague (6365119737).jpg"
  },
  "copenhagen": {
    "src": "/photos/places/copenhagen.jpg",
    "width": 1000,
    "height": 660,
    "artist": "Moahim",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:2018_-_Christiansborg_from_the_Marble_Bridge.jpg",
    "title": "2018 - Christiansborg from the Marble Bridge.jpg"
  },
  "paro": {
    "src": "/photos/places/paro.jpg",
    "width": 833,
    "height": 1250,
    "artist": "Christopher Michel",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Paro,_Paro,_Bhutan_(8026008882).jpg",
    "title": "Paro, Paro, Bhutan (8026008882).jpg"
  },
  "stone-town": {
    "src": "/photos/places/stone-town.jpg",
    "width": 1000,
    "height": 666,
    "artist": "No machine-readable author provided. Mbz1 assumed (based on copyright claims).",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Zanzibar_sultan_palace.jpg",
    "title": "Zanzibar sultan palace.jpg"
  },
  "saint-louis-senegal": {
    "src": "/photos/places/saint-louis-senegal.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Jim Williams",
    "license": "CC BY-SA 3.0 igo",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/igo/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Island_of_Saint-Louis-113799.jpg",
    "title": "Island of Saint-Louis-113799.jpg"
  },
  "santiago-chile": {
    "src": "/photos/places/santiago-chile.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Miguel hernandez",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Palacio_de_La_Moneda_-_miguelreflex.jpg",
    "title": "Palacio de La Moneda - miguelreflex.jpg"
  },
  "oruro": {
    "src": "/photos/places/oruro.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Parallelepiped09",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Santuario_de_Nuestra_Se%C3%B1ora_del_Socav%C3%B3n,_Oruro.jpg",
    "title": "Santuario de Nuestra Señora del Socavón, Oruro.jpg"
  },
  "vilnius": {
    "src": "/photos/places/vilnius.jpg",
    "width": 1000,
    "height": 666,
    "artist": "BigHead",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Vilnius_old_town_by_Augustas_Didzgalvis.jpg",
    "title": "Vilnius old town by Augustas Didzgalvis.jpg"
  },
  "heimaey": {
    "src": "/photos/places/heimaey.jpg",
    "width": 846,
    "height": 638,
    "artist": "Aerial_view_of_the_Westmen_Isles,_2009-02-01.jpg: Bruce McAdam Camera location62",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Heimaey,_2009-02-01.jpg",
    "title": "Aerial view of Heimaey, 2009-02-01.jpg"
  },
  "almaty": {
    "src": "/photos/places/almaty.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Dauren Nabijan",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Almaty_K%C3%B6k_T%C3%B6be.jpg",
    "title": "Almaty Kök Töbe.jpg"
  },
  "jerash": {
    "src": "/photos/places/jerash.jpg",
    "width": 1000,
    "height": 676,
    "artist": "Petar Milošević",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Oval_Plaza_(Forum_Romanum,_Gerasa_-_Jerash,_Jordan)_-_%D8%B3%D8%A7%D8%AD%D8%A9_%D8%A7%D9%84%D9%86%D8%AF%D9%88%D8%A9,_%D8%AC%D8%B1%D8%B4.jpg",
    "title": "Oval Plaza (Forum Romanum, Gerasa - Jerash, Jordan) - ساحة الندوة, جرش.jpg"
  },
  "segou": {
    "src": "/photos/places/segou.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Lyfengine",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Roundabout_in_Segou_1.jpg",
    "title": "Roundabout in Segou 1.jpg"
  },
  "jacmel": {
    "src": "/photos/places/jacmel.jpg",
    "width": 1000,
    "height": 695,
    "artist": "User:Doron",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:JacmelView.jpg",
    "title": "JacmelView.jpg"
  },
  "montevideo": {
    "src": "/photos/places/montevideo.jpg",
    "width": 1000,
    "height": 665,
    "artist": "Eduardo Ruggieri",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:PALACIO_LEGISLATIVO_01.JPG",
    "title": "PALACIO LEGISLATIVO 01.JPG"
  },
  "dubrovnik": {
    "src": "/photos/places/dubrovnik.jpg",
    "width": 1000,
    "height": 620,
    "artist": "Zysko serhii",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg",
    "title": "The walls of the fortress and View of the old city. panorama.jpg"
  },
  "guca": {
    "src": "/photos/places/guca.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Ванилица",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Wiki_%C5%A0umadija_VII_Gu%C4%8Da_480.jpg",
    "title": "Wiki Šumadija VII Guča 480.jpg"
  },
  "ptuj": {
    "src": "/photos/places/ptuj.jpg",
    "width": 1000,
    "height": 801,
    "artist": "Ptuj-mestnaHisa1.JPG: Sl-Ziga uploaded and derivative work: MrPanyGoff",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Ptuj_Town_Hall.jpg",
    "title": "Ptuj Town Hall.jpg"
  },
  "tallinn": {
    "src": "/photos/places/tallinn.jpg",
    "width": 1000,
    "height": 667,
    "artist": "Jorge Franganillo",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Raekoja_plats_at_night.jpg",
    "title": "Raekoja plats at night.jpg"
  },
  "yerevan": {
    "src": "/photos/places/yerevan.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Սէրուժ Ուրիշեան (Serouj Ourishian)",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mount_Ararat_and_the_Yerevan_skyline_(June_2018).jpg",
    "title": "Mount Ararat and the Yerevan skyline (June 2018).jpg"
  },
  "bukhara": {
    "src": "/photos/places/bukhara.jpg",
    "width": 1000,
    "height": 479,
    "artist": "Euyasik",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kalon-Ensemble_Buchara.jpg",
    "title": "Kalon-Ensemble Buchara.jpg"
  },
  "baalbek": {
    "src": "/photos/places/baalbek.jpg",
    "width": 1000,
    "height": 748,
    "artist": "Lodo from Moscow, Russia",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Temple_of_Bacchus,_Baalbek,_Lebanon_(49890013476).jpg",
    "title": "Temple of Bacchus, Baalbek, Lebanon (49890013476).jpg"
  },
  "douz": {
    "src": "/photos/places/douz.jpg",
    "width": 1000,
    "height": 666,
    "artist": "McKay Savage from London, UK",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Tunisia_10-12_-_064_-_Douz_and_the_Festival_of_the_Sahara_(6609290791).jpg",
    "title": "Tunisia 10-12 - 064 - Douz and the Festival of the Sahara (6609290791).jpg"
  },
  "mongu": {
    "src": "/photos/places/mongu.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Makeche at English Wikipedia",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Litungawinterpalace.jpg",
    "title": "Litungawinterpalace.jpg"
  },
  "douala": {
    "src": "/photos/places/douala.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Olivier Charly1",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Quarter_Bali_%C3%A0_Douala_Cameroun.jpg",
    "title": "Quarter Bali à Douala Cameroun.jpg"
  },
  "sumpango": {
    "src": "/photos/places/sumpango.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Jasonjdgr",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Festival_Sumpango_%2707_041.jpg",
    "title": "Festival Sumpango '07 041.jpg"
  },
  "suva": {
    "src": "/photos/places/suva.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Maksym Kozlenko",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Suva,_Fiji_77.jpg",
    "title": "Suva, Fiji 77.jpg"
  },
  "vychodna": {
    "src": "/photos/places/vychodna.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Achernar.sk",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Vychodna.JPG",
    "title": "Vychodna.JPG"
  },
  "luxembourg-city": {
    "src": "/photos/places/luxembourg-city.jpg",
    "width": 1000,
    "height": 528,
    "artist": "Benh LIEU SONG",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Luxembourg_City_Night_Wikimedia_Commons.jpg",
    "title": "Luxembourg City Night Wikimedia Commons.jpg"
  },
  "ohrid": {
    "src": "/photos/places/ohrid.jpg",
    "width": 1000,
    "height": 670,
    "artist": "xiquinhosilva",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:03760-Ohrid_(16064511578).jpg",
    "title": "03760-Ohrid (16064511578).jpg"
  },
  "sarajevo": {
    "src": "/photos/places/sarajevo.jpg",
    "width": 1000,
    "height": 598,
    "artist": "Julian Nyča",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sarajevo_City_Panorama.JPG",
    "title": "Sarajevo City Panorama.JPG"
  },
  "chisinau": {
    "src": "/photos/places/chisinau.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Rodion Gavriloi",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Consiliul_Municipal_Chi%C8%99in%C4%83u_(cropped).jpg",
    "title": "Consiliul Municipal Chișinău (cropped).jpg"
  },
  "escazu": {
    "src": "/photos/places/escazu.jpg",
    "width": 1000,
    "height": 664,
    "artist": "Armando Maynez from Mexico, Mexico",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Escaz%C3%BA_at_night_2009.jpg",
    "title": "Escazú at night 2009.jpg"
  },
  "jinja": {
    "src": "/photos/places/jinja.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Ilona1001",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Uganda_Jinja_Streetview.JPG",
    "title": "Uganda Jinja Streetview.JPG"
  },
  "lobamba": {
    "src": "/photos/places/lobamba.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Bernard Gagnon",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Parliament_building_of_Eswatini,_Lobamba.jpg",
    "title": "Parliament building of Eswatini, Lobamba.jpg"
  },
  "ouagadougou": {
    "src": "/photos/places/ouagadougou.jpg",
    "width": 600,
    "height": 800,
    "artist": "Thierry Draus",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ouagadougou_Skyline.jpg",
    "title": "Ouagadougou Skyline.jpg"
  },
  "grand-bassam": {
    "src": "/photos/places/grand-bassam.jpg",
    "width": 799,
    "height": 508,
    "artist": "Joker-x http://fr.wikipedia.org/wiki/User:Joker-x",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:800px-Grand-Bassam.jpg",
    "title": "800px-Grand-Bassam.jpg"
  },
  "san-salvador": {
    "src": "/photos/places/san-salvador.jpg",
    "width": 1000,
    "height": 563,
    "artist": "Frankjh",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Monumento_al_Salvador_del_Mundo_1.jpg",
    "title": "Monumento al Salvador del Mundo 1.jpg"
  },
  "bridgetown": {
    "src": "/photos/places/bridgetown.jpg",
    "width": 933,
    "height": 1250,
    "artist": "P.Lechien",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Bridgetown_aerial.JPG",
    "title": "Bridgetown aerial.JPG"
  },
  "bluefields": {
    "src": "/photos/places/bluefields.jpg",
    "width": 1000,
    "height": 563,
    "artist": "Ridiculopathy",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Historical_Museum_of_Afro-descendants,_Bluefields,_Nicaragua_09.jpg",
    "title": "Historical Museum of Afro-descendants, Bluefields, Nicaragua 09.jpg"
  },
  "nukualofa": {
    "src": "/photos/places/nukualofa.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Uhooep",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Royal_Palace,_Nuku%27alofa,_Nov_18.jpg",
    "title": "Royal Palace, Nuku'alofa, Nov 18.jpg"
  },
  "vaduz": {
    "src": "/photos/places/vaduz.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Lucas Kendall",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:View_of_Vaduz.jpg",
    "title": "View of Vaduz.jpg"
  },
  "kara": {
    "src": "/photos/places/kara.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Milos58",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kara,_Togo_-_panoramio.jpg",
    "title": "Kara, Togo - panoramio.jpg"
  },
  "luanda": {
    "src": "/photos/places/luanda.jpg",
    "width": 1000,
    "height": 605,
    "artist": "Iamdelcioborges",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Luanda_2025_focused_(cropped).jpg",
    "title": "Luanda 2025 focused (cropped).jpg"
  },
  "st-johns-antigua": {
    "src": "/photos/places/st-johns-antigua.jpg",
    "width": 1000,
    "height": 605,
    "artist": "This image or media was taken or created by Matt H. Wade. To see his entire port",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:St_Johns_Antigua_2012.jpg",
    "title": "St Johns Antigua 2012.jpg"
  },
  "brazzaville": {
    "src": "/photos/places/brazzaville.jpg",
    "width": 1000,
    "height": 563,
    "artist": "Africany",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Les_lieux_de_Brazzaville_03.jpg",
    "title": "Les lieux de Brazzaville 03.jpg"
  },
  "st-georges-grenada": {
    "src": "/photos/places/st-georges-grenada.jpg",
    "width": 1000,
    "height": 750,
    "artist": "cwi.aida",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:St_Georges_Grenada_Fort_-_panoramio.jpg",
    "title": "St Georges Grenada Fort - panoramio.jpg"
  },
  "bissau": {
    "src": "/photos/places/bissau.jpg",
    "width": 1000,
    "height": 488,
    "artist": "Original: Colleen Taugher from Lewiston Idaho, USA Modifications: The original u",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bissau-Stroossenzeen--w.jpg",
    "title": "Bissau-Stroossenzeen--w.jpg"
  },
  "la-ceiba": {
    "src": "/photos/places/la-ceiba.jpg",
    "width": 1000,
    "height": 563,
    "artist": "InterCoined",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Letras_de_La_Ceiba.jpg",
    "title": "Letras de La Ceiba.jpg"
  },
  "tarawa": {
    "src": "/photos/places/tarawa.jpg",
    "width": 1000,
    "height": 523,
    "artist": "Photo taken by Government of Kiribati employee in the course of their work",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:South_Tarawa_from_the_air.jpg",
    "title": "South Tarawa from the air.jpg"
  },
  "maseru": {
    "src": "/photos/places/maseru.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Lschefa",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Maseru_City_CBD.jpg",
    "title": "Maseru City CBD.jpg"
  },
  "monrovia": {
    "src": "/photos/places/monrovia.jpg",
    "width": 1000,
    "height": 663,
    "artist": "blk24ga",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Liberia,_Africa_-_panoramio_(256).jpg",
    "title": "Liberia, Africa - panoramio (256).jpg"
  },
  "antananarivo": {
    "src": "/photos/places/antananarivo.jpg",
    "width": 857,
    "height": 575,
    "artist": "Sascha Grabow www.saschagrabow.com",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lake_Anosy,_Central_Antananarivo,_Capital_of_Madagascar,_Photo_by_Sascha_Grabow.jpg",
    "title": "Lake Anosy, Central Antananarivo, Capital of Madagascar, Photo by Sascha Grabow.jpg"
  },
  "majuro": {
    "src": "/photos/places/majuro.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Cliff Hansen",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Eneko_Islet_02.JPG",
    "title": "Eneko Islet 02.JPG"
  },
  "yaren": {
    "src": "/photos/places/yaren.jpg",
    "width": 1000,
    "height": 747,
    "artist": "Sean Kelleher from Melbourne, Australia",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Parliament_(15403802091).jpg",
    "title": "Parliament (15403802091).jpg"
  },
  "koror": {
    "src": "/photos/places/koror.jpg",
    "width": 1000,
    "height": 666,
    "artist": "ito1117",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Main_St,_Koror,_Palau_-_panoramio_(1).jpg",
    "title": "Main St, Koror, Palau - panoramio (1).jpg"
  },
  "basseterre": {
    "src": "/photos/places/basseterre.jpg",
    "width": 1000,
    "height": 553,
    "artist": "giggel",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:St._Kitts,_Karibik_-_Marina_in_Basseterre_-_panoramio.jpg",
    "title": "St. Kitts, Karibik - Marina in Basseterre - panoramio.jpg"
  },
  "kingstown": {
    "src": "/photos/places/kingstown.jpg",
    "width": 800,
    "height": 531,
    "artist": "Unknown",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Kingstown.jpg",
    "title": "Kingstown.jpg"
  },
  "city-of-san-marino": {
    "src": "/photos/places/city-of-san-marino.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Francesco Bini",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:San_marino,_veduta_del_monte_titano_02.jpg",
    "title": "San marino, veduta del monte titano 02.jpg"
  },
  "victoria-seychelles": {
    "src": "/photos/places/victoria-seychelles.jpg",
    "width": 640,
    "height": 427,
    "artist": "Gerard Larose, Seychelles Tourism Board",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Victoria_clock_tower.jpg",
    "title": "Victoria clock tower.jpg"
  },
  "honiara": {
    "src": "/photos/places/honiara.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Kahunapule Michael Johnson from Pukalani, Hawaii, United States of America",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Honiara_View.jpg",
    "title": "Honiara View.jpg"
  },
  "funafuti": {
    "src": "/photos/places/funafuti.jpg",
    "width": 1000,
    "height": 664,
    "artist": "Michael Coghlan",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Funafuti_airport_-_Fiji_Airways.jpg",
    "title": "Funafuti airport - Fiji Airways.jpg"
  },
  "hoi-an": {
    "src": "/photos/places/hoi-an.jpg",
    "width": 500,
    "height": 332,
    "artist": "hienmtd",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:B%E1%BA%BFn_H%E1%BB%99i_An.jpg",
    "title": "Bến Hội An.jpg"
  },
  "kandy": {
    "src": "/photos/places/kandy.jpg",
    "width": 1000,
    "height": 666,
    "artist": "මියුරු සංකල්ප",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Front_view_of_Temple_of_the_Tooth,_Kandy.jpg",
    "title": "Front view of Temple of the Tooth, Kandy.jpg"
  },
  "oaxaca": {
    "src": "/photos/places/oaxaca.jpg",
    "width": 1000,
    "height": 750,
    "artist": "User: (WT-shared) Anyludes at  wts wikivoyage",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Colonial_Oaxaca.jpg",
    "title": "Colonial Oaxaca.jpg"
  },
  "hilo": {
    "src": "/photos/places/hilo.jpg",
    "width": 1000,
    "height": 562,
    "artist": "Robert Linsdell from St. Andrews, Canada",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Puhi_and_Kuhio_Bay,_Hilo_(503745)_(20340913684)_(cropped).jpg",
    "title": "Puhi and Kuhio Bay, Hilo (503745) (20340913684) (cropped).jpg"
  },
  "karasjok": {
    "src": "/photos/places/karasjok.jpg",
    "width": 1000,
    "height": 665,
    "artist": "Illustratedjc",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Karasjok-kirke.JPG",
    "title": "Karasjok-kirke.JPG"
  },
  "osogbo": {
    "src": "/photos/places/osogbo.jpg",
    "width": 960,
    "height": 640,
    "artist": "Hammed usman",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_statue_signifying_the_maternity_nature_of_iya_osun_at_the_sacred_grove_of_oshun2-1.jpg",
    "title": "A statue signifying the maternity nature of iya osun at the sacred grove of oshun2-1.jpg"
  },
  "goroka": {
    "src": "/photos/places/goroka.jpg",
    "width": 1000,
    "height": 322,
    "artist": "Manuel Hetzel",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Goroka.JPG",
    "title": "Goroka.JPG"
  },
  "musanze": {
    "src": "/photos/places/musanze.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Nina R",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Volcanoes_National_Park_Rwanda.jpg",
    "title": "Volcanoes National Park Rwanda.jpg"
  },
  "yare": {
    "src": "/photos/places/yare.jpg",
    "width": 1000,
    "height": 664,
    "artist": "Carlos Eduardo Ramírez Kalajzic",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_las_puertas_de_la_iglesia_de_San_Francisco_de_Yare.jpg",
    "title": "A las puertas de la iglesia de San Francisco de Yare.jpg"
  },
  "apia": {
    "src": "/photos/places/apia.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Stephen Glauser \n\nuploaded to Wikimedia Commons by Teinesavaii",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Central_Bank_of_Samoa_(2009).jpg",
    "title": "Central Bank of Samoa (2009).jpg"
  },
  "las-tablas": {
    "src": "/photos/places/las-tablas.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Deivis Quintero by Neblett Studio",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Iglesia_de_la_Patrona_Santa_Librada.jpg",
    "title": "Iglesia de la Patrona Santa Librada.jpg"
  },
  "herceg-novi": {
    "src": "/photos/places/herceg-novi.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Serbianboy",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Herceg_Novi_from_sea_1.jpg",
    "title": "Herceg Novi from sea 1.jpg"
  },
  "la-vega": {
    "src": "/photos/places/la-vega.jpg",
    "width": 1000,
    "height": 563,
    "artist": "Veganazo99",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:La_Vega_Dominican_Republic_downtown_architecture.jpg",
    "title": "La Vega Dominican Republic downtown architecture.jpg"
  },
  "mindelo": {
    "src": "/photos/places/mindelo.jpg",
    "width": 500,
    "height": 345,
    "artist": "Francisco Santos",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:2006.07.12.cv.sv.mindelo.palacio.jpg",
    "title": "2006.07.12.cv.sv.mindelo.palacio.jpg"
  },
  "dangriga": {
    "src": "/photos/places/dangriga.jpg",
    "width": 960,
    "height": 638,
    "artist": "Rick's Pics (Montreal)",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Dangriga,_Belize_-_2009_-_towards_the_Sea.jpg",
    "title": "Dangriga, Belize - 2009 - towards the Sea.jpg"
  },
  "pentecost-island": {
    "src": "/photos/places/pentecost-island.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Choguet",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Pentecost_Land_Diving_II.JPG",
    "title": "Pentecost Land Diving II.JPG"
  },
  "andorra-la-vella": {
    "src": "/photos/places/andorra-la-vella.jpg",
    "width": 1000,
    "height": 750,
    "artist": "August Dominus",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "source": "https://commons.wikimedia.org/wiki/File:Andorra_la_Vella_2025.jpg",
    "title": "Andorra la Vella 2025.jpg"
  },
  "monaco": {
    "src": "/photos/places/monaco.jpg",
    "width": 1000,
    "height": 753,
    "artist": "Georges Jansoone (JoJan)",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Harbour_of_Fontvielle,_Monaco_(view_from_above)_2009-05-09.jpg",
    "title": "Harbour of Fontvielle, Monaco (view from above) 2009-05-09.jpg"
  },
  "ghanzi": {
    "src": "/photos/places/ghanzi.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Cindy Heppelmann &amp; Hp.Baumeler",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Ghanzi_aerial_view_(2018).jpg",
    "title": "Ghanzi aerial view (2018).jpg"
  },
  "larnaca": {
    "src": "/photos/places/larnaca.jpg",
    "width": 1000,
    "height": 663,
    "artist": "Valantis Antoniades",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Aspect_of_the_old_town3.JPG",
    "title": "Aspect of the old town3.JPG"
  },
  "roseau": {
    "src": "/photos/places/roseau.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Nelro",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Roseau657.jpg",
    "title": "Roseau657.jpg"
  },
  "lake-malawi": {
    "src": "/photos/places/lake-malawi.jpg",
    "width": 500,
    "height": 375,
    "artist": "Yoni Lerner",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Canoes_on_Lake_Malawi.jpg",
    "title": "Canoes on Lake Malawi.jpg"
  },
  "yap": {
    "src": "/photos/places/yap.jpg",
    "width": 1000,
    "height": 657,
    "artist": "Dr. James P. McVey, NOAA Sea Grant Program",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Community_house_of_Yorlap_(Yap_Islands)_with_stone_money_made_in_Palau_NOAA.jpg",
    "title": "Community house of Yorlap (Yap Islands) with stone money made in Palau NOAA.jpg"
  },
  "okahandja": {
    "src": "/photos/places/okahandja.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Martin Hipangwa",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Okahandja_mucipality.jpg",
    "title": "Okahandja mucipality.jpg"
  },
  "castries": {
    "src": "/photos/places/castries.jpg",
    "width": 1000,
    "height": 666,
    "artist": "Prayitno / Thank you for (12 millions +) view from Los Angeles, USA",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Castries_Cruise_Port_(23678144863).jpg",
    "title": "Castries Cruise Port (23678144863).jpg"
  },
  "bunol": {
    "src": "/photos/places/bunol.jpg",
    "width": 960,
    "height": 656,
    "artist": "B25es",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Castillo_bu%C3%B1ol_20082000.jpg",
    "title": "Castillo buñol 20082000.jpg"
  },
  "addis-ababa": {
    "src": "/photos/places/addis-ababa.jpg",
    "width": 1000,
    "height": 750,
    "artist": "Bair175",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Meskel_celebrations_2003,_Meskel_Square,_Addis_Ababa,_before_fire_is_lit.jpg",
    "title": "Meskel celebrations 2003, Meskel Square, Addis Ababa, before fire is lit.jpg"
  },
  "wellington": {
    "src": "/photos/places/wellington.jpg",
    "width": 960,
    "height": 720,
    "artist": "Frozen-Coke-Rocks at English Wikipedia",
    "license": "Public domain",
    "licenseUrl": null,
    "source": "https://commons.wikimedia.org/wiki/File:Wellington_Waterfront_and_Skylined.jpg",
    "title": "Wellington Waterfront and Skylined.jpg"
  },
  "gulkula": {
    "src": "/photos/places/gulkula.jpg",
    "width": 937,
    "height": 1250,
    "artist": "CraigLHodges",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Timmy_Burarrwanga_at_Bawaka.JPG",
    "title": "Timmy Burarrwanga at Bawaka.JPG"
  }
};

const BY_ART_KIND: Record<string, Record<string, Photo>> = { rosette: FESTIVAL_PHOTOS, plate: DISH_PHOTOS, textile: ATTIRE_PHOTOS, locator: PLACE_PHOTOS };

/** The photograph for a piece of content, by its artwork kind and slug, if one has been sourced. */
export function photoFor(kind: string, slug: string): Photo | undefined {
  return BY_ART_KIND[kind]?.[slug];
}
