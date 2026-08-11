/**
 * GENERIRANO — ne uređivati ručno.
 * Generator: scripts/generate-menus.mjs
 *
 * 89 dnevnih jelovnika složenih iz kataloga jela. Svaki dan ima doručak,
 * ručak, večeru i međuobrok, a količine su za JEDNU referentnu odraslu osobu
 * (1950–2250 kcal, najmanje 70 g bjelančevina).
 *
 * Zajedno s ručno složenima iz menus.ts daju dovoljno dana da se u dva tjedna
 * ništa ne mora ponoviti — vidi src/domain/generateWeek.ts.
 */
import type { Menu } from '../domain/types'

export const GENERATED_MENUS: Menu[] = [
  {
    id: 'mn-g-arambasici',
    cuisine: 'hrvatska',
    title: "Arambašići",
    desc: "Uz večeru: Ajvar",
    // 1987 kcal, bjelančevine 107 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-arambasici', g: 300 }, // Arambašići
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-ajvar-domaci', g: 152 }, // Ajvar
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-bakalar-na-bijelo',
    cuisine: 'hrvatska',
    title: "Bakalar na bijelo",
    desc: "Uz večeru: Goveđa juha",
    // 1961 kcal, bjelančevine 147 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-bakalar-bijeli', g: 213 }, // Bakalar na bijelo
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-govedska-juha', g: 267 }, // Goveđa juha
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-begova-corba',
    cuisine: 'regionalna',
    title: "Begova čorba",
    desc: "Uz večeru: Heljda s gljivama",
    // 1963 kcal, bjelančevine 91 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-begova-corba', g: 310 }, // Begova čorba
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-heljda-gljive', g: 276 }, // Heljda s gljivama
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-bosanski-lonac',
    cuisine: 'regionalna',
    title: "Bosanski lonac",
    desc: "Uz večeru: Jota",
    // 1969 kcal, bjelančevine 114 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-bosanski-lonac', g: 442 }, // Bosanski lonac
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-jota', g: 312 }, // Jota
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-brudet',
    cuisine: 'hrvatska',
    title: "Brudet",
    desc: "Uz večeru: Juha od rajčice",
    // 1989 kcal, bjelančevine 107 g
    meals: [
      [
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
        { foodId: 'b25', g: 50 }, // Zobene pahuljice
        { foodId: 'b50', g: 120 }, // Jagode
        { foodId: 'b56', g: 20 }, // Bademi
      ],
      [
        { foodId: 'r:rc-brudet', g: 412 }, // Brudet
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-juha-rajcica', g: 294 }, // Juha od rajčice
      ],
      [
        { foodId: 'b53', g: 150 }, // Kruška
        { foodId: 'b59', g: 30 }, // Kikiriki
      ],
    ],
  },
  {
    id: 'mn-g-buncek-s-grahom',
    cuisine: 'hrvatska',
    title: "Buncek s grahom",
    desc: "Uz večeru: Kelj lešo",
    // 2026 kcal, bjelančevine 106 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-buncek-grah', g: 355 }, // Buncek s grahom
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-kelj-lešo', g: 311 }, // Kelj lešo
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-carbonara',
    cuisine: 'regionalna',
    title: "Carbonara",
    desc: "Uz večeru: Kuhani krumpir",
    // 1975 kcal, bjelančevine 90 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-carbonara', g: 310 }, // Carbonara
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-kuhani-krumpir', g: 156 }, // Kuhani krumpir
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-crni-rizot',
    cuisine: 'hrvatska',
    title: "Crni rižot",
    desc: "Uz večeru: Musaka",
    // 2165 kcal, bjelančevine 118 g
    meals: [
      [
        { foodId: 'b21', g: 90 }, // Kruh integralni
        { foodId: 'b18', g: 50 }, // Feta sir
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b45', g: 60 }, // Salata (zelena)
      ],
      [
        { foodId: 'r:rc-crni-rizot', g: 411 }, // Crni rižot
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-musaka', g: 286 }, // Musaka
      ],
      [
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-cobanac',
    cuisine: 'hrvatska',
    title: "Čobanac",
    desc: "Uz večeru: Omlet sa sirom i šunkom",
    // 1953 kcal, bjelančevine 141 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-cobanac', g: 313 }, // Čobanac
      ],
      [
        { foodId: 'r:rc-omlet-sir-sunka', g: 185 }, // Omlet sa sirom i šunkom
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-cufte-u-umaku-od-rajcice',
    cuisine: 'regionalna',
    title: "Ćufte u umaku od rajčice",
    desc: "Uz večeru: Pileća juha s povrćem",
    // 1968 kcal, bjelančevine 97 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-cufte-umak', g: 305 }, // Ćufte u umaku od rajčice
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-pileca-juha', g: 183 }, // Pileća juha s povrćem
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-dagnje-na-buzaru',
    cuisine: 'hrvatska',
    title: "Dagnje na buzaru",
    desc: "Uz večeru: Prebranac",
    // 1965 kcal, bjelančevine 112 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-dagnje-buzara', g: 263 }, // Dagnje na buzaru
        { foodId: 'b26', g: 150 }, // Krumpir (kuhani)
      ],
      [
        { foodId: 'r:rc-prebranac', g: 297 }, // Prebranac
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-duvec',
    cuisine: 'regionalna',
    title: "Đuveč",
    desc: "Uz večeru: Riba na gradele",
    // 2057 kcal, bjelančevine 131 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-djuvec', g: 417 }, // Đuveč
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-riba-gradele', g: 198 }, // Riba na gradele
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-fis-paprikas',
    cuisine: 'hrvatska',
    title: "Fiš paprikaš",
    desc: "Uz večeru: Riža s graškom i kukuruzom",
    // 1957 kcal, bjelančevine 102 g
    meals: [
      [
        { foodId: 'b21', g: 90 }, // Kruh integralni
        { foodId: 'b19', g: 15 }, // Maslac
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b13', g: 200 }, // Mlijeko 2.8%
      ],
      [
        { foodId: 'r:rc-fis-paprikas', g: 339 }, // Fiš paprikaš
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-riža-s-graškom-i-kukuruzom', g: 226 }, // Riža s graškom i kukuruzom
      ],
      [
        { foodId: 'b53', g: 150 }, // Kruška
        { foodId: 'b59', g: 30 }, // Kikiriki
      ],
    ],
  },
  {
    id: 'mn-g-gibanica-sa-sirom',
    cuisine: 'regionalna',
    title: "Gibanica sa sirom",
    desc: "Uz večeru: Salata s tunom i grahom",
    // 2064 kcal, bjelančevine 107 g
    meals: [
      [
        { foodId: 'b21', g: 100 }, // Kruh integralni
        { foodId: 'b16', g: 50 }, // Sir (gauda/edamer)
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-gibanica', g: 216 }, // Gibanica sa sirom
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-tuna-salata', g: 247 }, // Salata s tunom i grahom
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-goveda-juha',
    cuisine: 'hrvatska',
    title: "Goveđa juha",
    desc: "Uz večeru: Sekeli gulaš",
    // 1969 kcal, bjelančevine 126 g
    meals: [
      [
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
        { foodId: 'b25', g: 50 }, // Zobene pahuljice
        { foodId: 'b50', g: 120 }, // Jagode
        { foodId: 'b56', g: 20 }, // Bademi
      ],
      [
        { foodId: 'r:rc-govedska-juha', g: 267 }, // Goveđa juha
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hr-sekeli-gulaš', g: 239 }, // Sekeli gulaš
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-gregada',
    cuisine: 'hrvatska',
    title: "Gregada",
    desc: "Uz večeru: Tunjevina u graham pecivu",
    // 1950 kcal, bjelančevine 135 g
    meals: [
      [
        { foodId: 'b17', g: 200 }, // Svježi sir (posni)
        { foodId: 'b21', g: 80 }, // Kruh integralni
        { foodId: 'b39', g: 100 }, // Paprika crvena
      ],
      [
        { foodId: 'r:rc-gregada', g: 390 }, // Gregada
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hr-tunjevina-u-graham-pecivu', g: 130 }, // Tunjevina u graham pecivu
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-gulas',
    cuisine: 'regionalna',
    title: "Gulaš",
    desc: "Uz večeru: Varivo od graška",
    // 1962 kcal, bjelančevine 136 g
    meals: [
      [
        { foodId: 'b11', g: 120 }, // Jaje (cijelo)
        { foodId: 'b20', g: 80 }, // Kruh bijeli
        { foodId: 'b10', g: 60 }, // Šunka (pileća)
        { foodId: 'b40', g: 80 }, // Krastavac
      ],
      [
        { foodId: 'r:rc-gulas', g: 398 }, // Gulaš
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-grasak-varivo', g: 361 }, // Varivo od graška
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-hobotnica-ispod-peke',
    cuisine: 'hrvatska',
    title: "Hobotnica ispod peke",
    desc: "Uz večeru: Varivo od korabice s mrkvom i graškom",
    // 1953 kcal, bjelančevine 130 g
    meals: [
      [
        { foodId: 'b21', g: 90 }, // Kruh integralni
        { foodId: 'b18', g: 50 }, // Feta sir
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b45', g: 60 }, // Salata (zelena)
      ],
      [
        { foodId: 'r:rc-hobotnica-peka', g: 409 }, // Hobotnica ispod peke
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-korabice-s-mrkvom-i-graškom', g: 347 }, // Varivo od korabice s mrkvom i graškom
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-istarska-manestra',
    cuisine: 'hrvatska',
    title: "Istarska maneštra",
    desc: "Uz večeru: Varivo od mahuna s junećim mesom",
    // 1957 kcal, bjelančevine 88 g
    meals: [
      [
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b13', g: 200 }, // Mlijeko 2.8%
        { foodId: 'b47', g: 150 }, // Jabuka
      ],
      [
        { foodId: 'r:rc-manestra', g: 323 }, // Istarska maneštra
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-mahuna-s-junećim-mesom', g: 279 }, // Varivo od mahuna s junećim mesom
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-janjetina-ispod-peke',
    cuisine: 'hrvatska',
    title: "Janjetina ispod peke",
    desc: "Uz večeru: Blitva s krumpirom",
    // 2020 kcal, bjelančevine 119 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-janjetina-peka', g: 335 }, // Janjetina ispod peke
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-blitva-krumpir', g: 254 }, // Blitva s krumpirom
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-japrak',
    cuisine: 'regionalna',
    title: "Japrak",
    desc: "Uz večeru: Grah s povrćem",
    // 1963 kcal, bjelančevine 79 g
    meals: [
      [
        { foodId: 'b25', g: 70 }, // Zobene pahuljice
        { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
        { foodId: 'b48', g: 120 }, // Banana
      ],
      [
        { foodId: 'r:rc-japrak', g: 356 }, // Japrak
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-grah', g: 273 }, // Grah s povrćem
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-jota',
    cuisine: 'regionalna',
    title: "Jota",
    desc: "Uz večeru: Humus",
    // 2005 kcal, bjelančevine 88 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-jota', g: 312 }, // Jota
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-humus-domaci', g: 117 }, // Humus
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-karadordeva-snicla',
    cuisine: 'regionalna',
    title: "Karađorđeva šnicla",
    desc: "Uz večeru: Juha od bundeve",
    // 2201 kcal, bjelančevine 133 g
    meals: [
      [
        { foodId: 'b17', g: 200 }, // Svježi sir (posni)
        { foodId: 'b21', g: 80 }, // Kruh integralni
        { foodId: 'b39', g: 100 }, // Paprika crvena
      ],
      [
        { foodId: 'r:rc-karadordeva', g: 288 }, // Karađorđeva šnicla
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-juha-bundeva', g: 354 }, // Juha od bundeve
      ],
      [
        { foodId: 'b54', g: 150 }, // Kivi
        { foodId: 'b15', g: 150 }, // Grčki jogurt
      ],
    ],
  },
  {
    id: 'mn-g-kiseli-kupus-s-rebrima',
    cuisine: 'hrvatska',
    title: "Kiseli kupus s rebrima",
    desc: "Uz večeru: Juneća šnicla u umaku",
    // 2236 kcal, bjelančevine 149 g
    meals: [
      [
        { foodId: 'b21', g: 100 }, // Kruh integralni
        { foodId: 'b16', g: 50 }, // Sir (gauda/edamer)
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-kiseli-kupus-rebra', g: 330 }, // Kiseli kupus s rebrima
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hr-juneća-šnicla-u-umaku', g: 117 }, // Juneća šnicla u umaku
      ],
      [
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-klepe',
    cuisine: 'regionalna',
    title: "Klepe",
    desc: "Uz večeru: Kosani odrezak",
    // 1959 kcal, bjelančevine 98 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-klepe', g: 254 }, // Klepe
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-kosani-odrezak', g: 117 }, // Kosani odrezak
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-kobasica-s-kiselim-kupusom',
    cuisine: 'regionalna',
    title: "Kobasica s kiselim kupusom",
    desc: "Uz večeru: Lečo",
    // 1963 kcal, bjelančevine 85 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-kranjska-zelje', g: 451 }, // Kobasica s kiselim kupusom
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-lecso', g: 381 }, // Lečo
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-kotlovina',
    cuisine: 'hrvatska',
    title: "Kotlovina",
    desc: "Uz večeru: Obara",
    // 1953 kcal, bjelančevine 127 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-kotlovina', g: 325 }, // Kotlovina
        { foodId: 'b26', g: 150 }, // Krumpir (kuhani)
      ],
      [
        { foodId: 'r:rc-obara', g: 362 }, // Obara
      ],
      [
        { foodId: 'b48', g: 120 }, // Banana
        { foodId: 'b58', g: 25 }, // Lješnjaci
      ],
    ],
  },
  {
    id: 'mn-g-krumpir-paprikas',
    cuisine: 'hrvatska',
    title: "Krumpir paprikaš",
    desc: "Uz večeru: Palačinke",
    // 1976 kcal, bjelančevine 71 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-krumpir-paprikas', g: 386 }, // Krumpir paprikaš
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-palacinke', g: 175 }, // Palačinke
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-lazanje',
    cuisine: 'regionalna',
    title: "Lazanje",
    desc: "Uz večeru: Pileća juha s rezancima",
    // 1956 kcal, bjelančevine 111 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-lazanje', g: 369 }, // Lazanje
        { foodId: 'b45', g: 80 }, // Salata (zelena)
        { foodId: 'b62', g: 10 }, // Maslinovo ulje
      ],
      [
        { foodId: 'r:rc-pileca-juha-rezanci', g: 283 }, // Pileća juha s rezancima
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-leco',
    cuisine: 'regionalna',
    title: "Lečo",
    desc: "Uz večeru: Punjene rajčice",
    // 1967 kcal, bjelančevine 72 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-lecso', g: 381 }, // Lečo
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-punjena-rajcica', g: 336 }, // Punjene rajčice
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-licki-lonac',
    cuisine: 'hrvatska',
    title: "Lički lonac",
    desc: "Uz večeru: Riba pečena s povrćem",
    // 2083 kcal, bjelančevine 138 g
    meals: [
      [
        { foodId: 'b25', g: 70 }, // Zobene pahuljice
        { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
        { foodId: 'b48', g: 120 }, // Banana
      ],
      [
        { foodId: 'r:rc-licki-lonac', g: 381 }, // Lički lonac
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-riba-pecena-povrce', g: 377 }, // Riba pečena s povrćem
      ],
      [
        { foodId: 'b54', g: 150 }, // Kivi
        { foodId: 'b15', g: 150 }, // Grčki jogurt
      ],
    ],
  },
  {
    id: 'mn-g-mijesano-meso-s-rostilja',
    cuisine: 'regionalna',
    title: "Miješano meso s roštilja",
    desc: "Uz večeru: Salata od hobotnice",
    // 2233 kcal, bjelančevine 172 g
    meals: [
      [
        { foodId: 'b17', g: 200 }, // Svježi sir (posni)
        { foodId: 'b21', g: 80 }, // Kruh integralni
        { foodId: 'b39', g: 100 }, // Paprika crvena
      ],
      [
        { foodId: 'r:rc-rostilj-mix', g: 280 }, // Miješano meso s roštilja
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hobotnica-salata', g: 274 }, // Salata od hobotnice
      ],
      [
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-mijesano-varivo-s-bijelim-mesom-i-noklicama',
    cuisine: 'hrvatska',
    title: "Miješano varivo s bijelim mesom i noklicama",
    desc: "Uz večeru: Sarma",
    // 1953 kcal, bjelančevine 99 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-hr-miješano-varivo-s-bijelim-mesom-i-noklicama', g: 397 }, // Miješano varivo s bijelim mesom i noklicama
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-sarma', g: 323 }, // Sarma
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-muckalica',
    cuisine: 'regionalna',
    title: "Mućkalica",
    desc: "Uz večeru: Škampi na buzaru",
    // 1955 kcal, bjelančevine 146 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-muckalica', g: 345 }, // Mućkalica
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-buzara', g: 278 }, // Škampi na buzaru
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-musaka-s-krumpirom',
    cuisine: 'regionalna',
    title: "Musaka s krumpirom",
    desc: "Uz večeru: Varivo od graha",
    // 1972 kcal, bjelančevine 86 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-musaka-krumpir', g: 331 }, // Musaka s krumpirom
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-grah-varivo', g: 281 }, // Varivo od graha
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-njoki-s-umakom-od-rajcice',
    cuisine: 'regionalna',
    title: "Njoki s umakom od rajčice",
    desc: "Uz večeru: Varivo od ječmene kaše s miješanim mesom",
    // 2016 kcal, bjelančevine 85 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-njoki-umak', g: 400 }, // Njoki s umakom od rajčice
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-ječmene-kaše-s-miješanim-mesom', g: 345 }, // Varivo od ječmene kaše s miješanim mesom
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-obara',
    cuisine: 'regionalna',
    title: "Obara",
    desc: "Uz večeru: Varivo od leće",
    // 1967 kcal, bjelančevine 102 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-obara', g: 362 }, // Obara
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-leca-varivo', g: 274 }, // Varivo od leće
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-palacinke',
    cuisine: 'hrvatska',
    title: "Palačinke",
    desc: "Uz večeru: Žganci s čvarcima",
    // 1997 kcal, bjelančevine 78 g
    meals: [
      [
        { foodId: 'b21', g: 100 }, // Kruh integralni
        { foodId: 'b16', g: 50 }, // Sir (gauda/edamer)
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-palacinke', g: 175 }, // Palačinke
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-zganci', g: 228 }, // Žganci s čvarcima
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-palenta-sa-sirom',
    cuisine: 'hrvatska',
    title: "Palenta sa sirom",
    desc: "Uz večeru: Francuska salata",
    // 2006 kcal, bjelančevine 77 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-palenta-sir', g: 285 }, // Palenta sa sirom
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-francuska-salata', g: 250 }, // Francuska salata
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-pasta-fazol',
    cuisine: 'hrvatska',
    title: "Pašta fažol",
    desc: "Uz večeru: Grah salata",
    // 1979 kcal, bjelančevine 95 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-pasta-fazol', g: 325 }, // Pašta fažol
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-grah-salata-luk', g: 206 }, // Grah salata
      ],
      [
        { foodId: 'b53', g: 150 }, // Kruška
        { foodId: 'b59', g: 30 }, // Kikiriki
      ],
    ],
  },
  {
    id: 'mn-g-pasticada',
    cuisine: 'hrvatska',
    title: "Pašticada",
    desc: "Uz večeru: Istarska maneštra",
    // 1956 kcal, bjelančevine 123 g
    meals: [
      [
        { foodId: 'b25', g: 70 }, // Zobene pahuljice
        { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
        { foodId: 'b48', g: 120 }, // Banana
      ],
      [
        { foodId: 'r:rc-pasticada', g: 331 }, // Pašticada
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-manestra', g: 323 }, // Istarska maneštra
      ],
      [
        { foodId: 'b47', g: 150 }, // Jabuka
        { foodId: 'b56', g: 30 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-pecena-pastrva',
    cuisine: 'hrvatska',
    title: "Pečena pastrva",
    desc: "Uz večeru: Juha od gljiva",
    // 2028 kcal, bjelančevine 108 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-pastrva-pecena', g: 203 }, // Pečena pastrva
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-juha-gljive', g: 316 }, // Juha od gljiva
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-pecena-patka-s-tjesteninom',
    cuisine: 'hrvatska',
    title: "Pečena patka s tjesteninom",
    desc: "Uz večeru: Kajgana s rajčicom",
    // 1955 kcal, bjelančevine 103 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-patka-mlinci', g: 254 }, // Pečena patka s tjesteninom
        { foodId: 'b26', g: 150 }, // Krumpir (kuhani)
      ],
      [
        { foodId: 'r:rc-kajgana-rajcica', g: 270 }, // Kajgana s rajčicom
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-pecena-pileca-krilca',
    cuisine: 'regionalna',
    title: "Pečena pileća krilca",
    desc: "Uz večeru: Krumpir salata",
    // 1984 kcal, bjelančevine 119 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-pileca-krilca-pecena', g: 224 }, // Pečena pileća krilca
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-krumpir-salata', g: 258 }, // Krumpir salata
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-perkelt-od-piletine',
    cuisine: 'hrvatska',
    title: "Perkelt od piletine",
    desc: "Uz večeru: Minestrone",
    // 1959 kcal, bjelančevine 106 g
    meals: [
      [
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
        { foodId: 'b25', g: 50 }, // Zobene pahuljice
        { foodId: 'b50', g: 120 }, // Jagode
        { foodId: 'b56', g: 20 }, // Bademi
      ],
      [
        { foodId: 'r:rc-perkelt', g: 330 }, // Perkelt od piletine
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-minestrone', g: 328 }, // Minestrone
      ],
      [
        { foodId: 'b53', g: 150 }, // Kruška
        { foodId: 'b59', g: 30 }, // Kikiriki
      ],
    ],
  },
  {
    id: 'mn-g-pileca-jetrica-na-lukovima',
    cuisine: 'hrvatska',
    title: "Pileća jetrica na lukovima",
    desc: "Uz večeru: Omlet sa sirom",
    // 1965 kcal, bjelančevine 127 g
    meals: [
      [
        { foodId: 'b17', g: 200 }, // Svježi sir (posni)
        { foodId: 'b21', g: 80 }, // Kruh integralni
        { foodId: 'b39', g: 100 }, // Paprika crvena
      ],
      [
        { foodId: 'r:rc-jetrica', g: 254 }, // Pileća jetrica na lukovima
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-omlet', g: 171 }, // Omlet sa sirom
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-pileca-juha-s-rezancima',
    cuisine: 'hrvatska',
    title: "Pileća juha s rezancima",
    desc: "Uz večeru: Pečeni krumpir s ružmarinom",
    // 1953 kcal, bjelančevine 100 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-pileca-juha-rezanci', g: 283 }, // Pileća juha s rezancima
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-krumpir-pecen', g: 205 }, // Pečeni krumpir s ružmarinom
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-pljeskavica',
    cuisine: 'regionalna',
    title: "Pljeskavica",
    desc: "Uz večeru: Pire krumpir",
    // 2027 kcal, bjelančevine 112 g
    meals: [
      [
        { foodId: 'b21', g: 90 }, // Kruh integralni
        { foodId: 'b18', g: 50 }, // Feta sir
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b45', g: 60 }, // Salata (zelena)
      ],
      [
        { foodId: 'r:rc-pljeskavica', g: 256 }, // Pljeskavica
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hr-pire-krumpir', g: 203 }, // Pire krumpir
      ],
      [
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-podvarak',
    cuisine: 'regionalna',
    title: "Podvarak",
    desc: "Uz večeru: Pureća prsa u umaku",
    // 1971 kcal, bjelančevine 113 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-podvarak', g: 304 }, // Podvarak
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-pureća-prsa-u-umaku', g: 121 }, // Pureća prsa u umaku
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-pohane-gljive',
    cuisine: 'hrvatska',
    title: "Pohane gljive",
    desc: "Uz večeru: Riblja juha",
    // 1981 kcal, bjelančevine 94 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-gljive-pohane', g: 234 }, // Pohane gljive
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-riblja-juha', g: 268 }, // Riblja juha
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-pohane-tikvice',
    cuisine: 'hrvatska',
    title: "Pohane tikvice",
    desc: "Uz večeru: Salata od krastavaca s vrhnjem",
    // 1967 kcal, bjelančevine 86 g
    meals: [
      [
        { foodId: 'b21', g: 100 }, // Kruh integralni
        { foodId: 'b16', g: 50 }, // Sir (gauda/edamer)
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-tikvice-pohane', g: 305 }, // Pohane tikvice
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-salata-krastavac', g: 219 }, // Salata od krastavaca s vrhnjem
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-prebranac',
    cuisine: 'regionalna',
    title: "Prebranac",
    desc: "Uz večeru: Sataraš",
    // 1960 kcal, bjelančevine 94 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-prebranac', g: 297 }, // Prebranac
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-sataras', g: 283 }, // Sataraš
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-punjena-paprika-u-umaku',
    cuisine: 'hrvatska',
    title: "Punjena paprika u umaku",
    desc: "Uz večeru: Šopska salata",
    // 1984 kcal, bjelančevine 80 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-punjena-paprika-klasik', g: 392 }, // Punjena paprika u umaku
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-sopska-salata', g: 315 }, // Šopska salata
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-punjena-piletina',
    cuisine: 'hrvatska',
    title: "Punjena piletina",
    desc: "Uz večeru: Varivo od graha s puretinom",
    // 2123 kcal, bjelančevine 150 g
    meals: [
      [
        { foodId: 'b21', g: 100 }, // Kruh integralni
        { foodId: 'b16', g: 50 }, // Sir (gauda/edamer)
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-punjena-piletina', g: 236 }, // Punjena piletina
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-graha-s-puretinom', g: 233 }, // Varivo od graha s puretinom
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-punjene-lignje',
    cuisine: 'hrvatska',
    title: "Punjene lignje",
    desc: "Uz večeru: Varivo od kelja",
    // 2073 kcal, bjelančevine 121 g
    meals: [
      [
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
        { foodId: 'b25', g: 50 }, // Zobene pahuljice
        { foodId: 'b50', g: 120 }, // Jagode
        { foodId: 'b56', g: 20 }, // Bademi
      ],
      [
        { foodId: 'r:rc-lignje-punjene', g: 235 }, // Punjene lignje
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-kelj-varivo', g: 378 }, // Varivo od kelja
      ],
      [
        { foodId: 'b54', g: 150 }, // Kivi
        { foodId: 'b15', g: 150 }, // Grčki jogurt
      ],
    ],
  },
  {
    id: 'mn-g-punjene-tikvice',
    cuisine: 'hrvatska',
    title: "Punjene tikvice",
    desc: "Uz večeru: Varivo od mahuna",
    // 1965 kcal, bjelančevine 105 g
    meals: [
      [
        { foodId: 'b17', g: 200 }, // Svježi sir (posni)
        { foodId: 'b21', g: 80 }, // Kruh integralni
        { foodId: 'b39', g: 100 }, // Paprika crvena
      ],
      [
        { foodId: 'r:rc-punjene-tikvice', g: 489 }, // Punjene tikvice
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-mahune-varivo', g: 332 }, // Varivo od mahuna
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-punjeni-krumpir',
    cuisine: 'hrvatska',
    title: "Punjeni krumpir",
    desc: "Uz večeru: Ajvar",
    // 2021 kcal, bjelančevine 74 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-punjeni-krumpir', g: 340 }, // Punjeni krumpir
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-ajvar-domaci', g: 152 }, // Ajvar
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-punjeni-patlidzan',
    cuisine: 'regionalna',
    title: "Punjeni patlidžan",
    desc: "Uz večeru: Goveđa juha",
    // 1954 kcal, bjelančevine 122 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-punjeni-patlidzan', g: 406 }, // Punjeni patlidžan
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-govedska-juha', g: 267 }, // Goveđa juha
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-pureci-rizoto-sa-sezonskim-povrcem',
    cuisine: 'hrvatska',
    title: "Pureći rižoto sa sezonskim povrćem",
    desc: "Uz večeru: Heljda s gljivama",
    // 1965 kcal, bjelančevine 79 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-hr-pureći-rižoto-sa-sezonskim-povrćem', g: 362 }, // Pureći rižoto sa sezonskim povrćem
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-heljda-gljive', g: 276 }, // Heljda s gljivama
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-purica-s-tjesteninom',
    cuisine: 'hrvatska',
    title: "Purica s tjesteninom",
    desc: "Uz večeru: Jota",
    // 1970 kcal, bjelančevine 126 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-purica-mlinci', g: 300 }, // Purica s tjesteninom
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-jota', g: 312 }, // Jota
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-riba-na-gradele',
    cuisine: 'hrvatska',
    title: "Riba na gradele",
    desc: "Uz večeru: Juha od rajčice",
    // 1953 kcal, bjelančevine 115 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-riba-gradele', g: 198 }, // Riba na gradele
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-juha-rajcica', g: 294 }, // Juha od rajčice
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-riba-pecena-s-povrcem',
    cuisine: 'hrvatska',
    title: "Riba pečena s povrćem",
    desc: "Uz večeru: Kelj lešo",
    // 1981 kcal, bjelančevine 101 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-riba-pecena-povrce', g: 377 }, // Riba pečena s povrćem
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-kelj-lešo', g: 311 }, // Kelj lešo
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-ricet',
    cuisine: 'regionalna',
    title: "Ričet",
    desc: "Uz večeru: Kuhani krumpir",
    // 1989 kcal, bjelančevine 88 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-ricet', g: 375 }, // Ričet
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hr-kuhani-krumpir', g: 156 }, // Kuhani krumpir
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-rizot-s-gljivama',
    cuisine: 'regionalna',
    title: "Rižot s gljivama",
    desc: "Uz večeru: Musaka",
    // 2115 kcal, bjelančevine 110 g
    meals: [
      [
        { foodId: 'b21', g: 100 }, // Kruh integralni
        { foodId: 'b16', g: 50 }, // Sir (gauda/edamer)
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-rizot-gljive', g: 410 }, // Rižot s gljivama
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-musaka', g: 286 }, // Musaka
      ],
      [
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-rizot-s-plodovima-mora',
    cuisine: 'hrvatska',
    title: "Rižot s plodovima mora",
    desc: "Uz večeru: Omlet sa sirom i šunkom",
    // 1975 kcal, bjelančevine 114 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-rizot-morski', g: 428 }, // Rižot s plodovima mora
      ],
      [
        { foodId: 'r:rc-omlet-sir-sunka', g: 185 }, // Omlet sa sirom i šunkom
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-salata-od-hobotnice',
    cuisine: 'hrvatska',
    title: "Salata od hobotnice",
    desc: "Uz večeru: Pileća juha s povrćem",
    // 1962 kcal, bjelančevine 129 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-hobotnica-salata', g: 274 }, // Salata od hobotnice
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-pileca-juha', g: 183 }, // Pileća juha s povrćem
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-salata-s-tunom-i-grahom',
    cuisine: 'hrvatska',
    title: "Salata s tunom i grahom",
    desc: "Uz večeru: Prebranac",
    // 1955 kcal, bjelančevine 98 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-tuna-salata', g: 247 }, // Salata s tunom i grahom
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-prebranac', g: 297 }, // Prebranac
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-sarma-s-dimljenim-mesom',
    cuisine: 'hrvatska',
    title: "Sarma s dimljenim mesom",
    desc: "Uz večeru: Riba na gradele",
    // 1968 kcal, bjelančevine 120 g
    meals: [
      [
        { foodId: 'b25', g: 70 }, // Zobene pahuljice
        { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
        { foodId: 'b48', g: 120 }, // Banana
      ],
      [
        { foodId: 'r:rc-sarma-klasik', g: 366 }, // Sarma s dimljenim mesom
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-riba-gradele', g: 198 }, // Riba na gradele
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-sogan-dolma',
    cuisine: 'regionalna',
    title: "Sogan dolma",
    desc: "Uz večeru: Riža s graškom i kukuruzom",
    // 1986 kcal, bjelančevine 74 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-sogan-dolma', g: 347 }, // Sogan dolma
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-riža-s-graškom-i-kukuruzom', g: 226 }, // Riža s graškom i kukuruzom
      ],
      [
        { foodId: 'b53', g: 150 }, // Kruška
        { foodId: 'b59', g: 30 }, // Kikiriki
      ],
    ],
  },
  {
    id: 'mn-g-soparnik',
    cuisine: 'hrvatska',
    title: "Soparnik",
    desc: "Uz večeru: Salata s tunom i grahom",
    // 2042 kcal, bjelančevine 89 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-soparnik', g: 222 }, // Soparnik
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-tuna-salata', g: 247 }, // Salata s tunom i grahom
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-srdele-na-gradele',
    cuisine: 'hrvatska',
    title: "Srdele na gradele",
    desc: "Uz večeru: Sekeli gulaš",
    // 1961 kcal, bjelančevine 111 g
    meals: [
      [
        { foodId: 'b25', g: 70 }, // Zobene pahuljice
        { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
        { foodId: 'b48', g: 120 }, // Banana
      ],
      [
        { foodId: 'r:rc-srdele-gradele', g: 176 }, // Srdele na gradele
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-sekeli-gulaš', g: 239 }, // Sekeli gulaš
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-svinjsko-pecenje',
    cuisine: 'hrvatska',
    title: "Svinjsko pečenje",
    desc: "Uz večeru: Tunjevina u graham pecivu",
    // 2131 kcal, bjelančevine 146 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-svinjetina-pecena', g: 308 }, // Svinjsko pečenje
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hr-tunjevina-u-graham-pecivu', g: 130 }, // Tunjevina u graham pecivu
      ],
      [
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-skampi-na-buzaru',
    cuisine: 'hrvatska',
    title: "Škampi na buzaru",
    desc: "Uz večeru: Varivo od graška",
    // 1982 kcal, bjelančevine 110 g
    meals: [
      [
        { foodId: 'b21', g: 90 }, // Kruh integralni
        { foodId: 'b19', g: 15 }, // Maslac
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b13', g: 200 }, // Mlijeko 2.8%
      ],
      [
        { foodId: 'r:rc-buzara', g: 278 }, // Škampi na buzaru
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-grasak-varivo', g: 361 }, // Varivo od graška
      ],
      [
        { foodId: 'b47', g: 150 }, // Jabuka
        { foodId: 'b56', g: 30 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-teleci-medaljoni-u-umaku-od-gljiva',
    cuisine: 'regionalna',
    title: "Teleći medaljoni u umaku od gljiva",
    desc: "Uz večeru: Varivo od korabice s mrkvom i graškom",
    // 1959 kcal, bjelančevine 133 g
    meals: [
      [
        { foodId: 'b21', g: 100 }, // Kruh integralni
        { foodId: 'b16', g: 50 }, // Sir (gauda/edamer)
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-teleci-medaljoni', g: 321 }, // Teleći medaljoni u umaku od gljiva
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-korabice-s-mrkvom-i-graškom', g: 347 }, // Varivo od korabice s mrkvom i graškom
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-tjestenina-s-istarskim-gulasom',
    cuisine: 'hrvatska',
    title: "Tjestenina s istarskim gulašom",
    desc: "Uz večeru: Varivo od mahuna s junećim mesom",
    // 2012 kcal, bjelančevine 113 g
    meals: [
      [
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
        { foodId: 'b25', g: 50 }, // Zobene pahuljice
        { foodId: 'b50', g: 120 }, // Jagode
        { foodId: 'b56', g: 20 }, // Bademi
      ],
      [
        { foodId: 'r:rc-fuzi-gulas', g: 394 }, // Tjestenina s istarskim gulašom
        { foodId: 'b26', g: 150 }, // Krumpir (kuhani)
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-mahuna-s-junećim-mesom', g: 279 }, // Varivo od mahuna s junećim mesom
      ],
      [
        { foodId: 'b48', g: 120 }, // Banana
        { foodId: 'b58', g: 25 }, // Lješnjaci
      ],
    ],
  },
  {
    id: 'mn-g-tjestenina-s-tunom',
    cuisine: 'regionalna',
    title: "Tjestenina s tunom",
    desc: "Uz večeru: Blitva s krumpirom",
    // 2002 kcal, bjelančevine 86 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-pasta-tuna', g: 361 }, // Tjestenina s tunom
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-blitva-krumpir', g: 254 }, // Blitva s krumpirom
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-tjestenina-sa-skampima',
    cuisine: 'hrvatska',
    title: "Tjestenina sa škampima",
    desc: "Uz večeru: Grah s povrćem",
    // 1966 kcal, bjelančevine 93 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-pasta-skampi', g: 374 }, // Tjestenina sa škampima
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-grah', g: 273 }, // Grah s povrćem
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-varivo-od-graha-s-puretinom',
    cuisine: 'hrvatska',
    title: "Varivo od graha s puretinom",
    desc: "Uz večeru: Humus",
    // 1956 kcal, bjelančevine 89 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-graha-s-puretinom', g: 233 }, // Varivo od graha s puretinom
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-humus-domaci', g: 117 }, // Humus
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-varivo-od-graska',
    cuisine: 'hrvatska',
    title: "Varivo od graška",
    desc: "Uz večeru: Juha od bundeve",
    // 1997 kcal, bjelančevine 83 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-grasak-varivo', g: 361 }, // Varivo od graška
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-juha-bundeva', g: 354 }, // Juha od bundeve
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-varivo-od-jecmene-kase-s-mijesanim-mesom',
    cuisine: 'hrvatska',
    title: "Varivo od ječmene kaše s miješanim mesom",
    desc: "Uz večeru: Kajgana s rajčicom",
    // 1961 kcal, bjelančevine 101 g
    meals: [
      [
        { foodId: 'b15', g: 200 }, // Grčki jogurt
        { foodId: 'b25', g: 40 }, // Zobene pahuljice
        { foodId: 'b51', g: 100 }, // Borovnice
        { foodId: 'b57', g: 20 }, // Orasi
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-ječmene-kaše-s-miješanim-mesom', g: 345 }, // Varivo od ječmene kaše s miješanim mesom
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-kajgana-rajcica', g: 270 }, // Kajgana s rajčicom
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-varivo-od-kelja',
    cuisine: 'hrvatska',
    title: "Varivo od kelja",
    desc: "Uz večeru: Kosani odrezak",
    // 1987 kcal, bjelančevine 114 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-kelj-varivo', g: 378 }, // Varivo od kelja
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hr-kosani-odrezak', g: 117 }, // Kosani odrezak
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-varivo-od-korabice-s-mrkvom-i-graskom',
    cuisine: 'hrvatska',
    title: "Varivo od korabice s mrkvom i graškom",
    desc: "Uz večeru: Lečo",
    // 1954 kcal, bjelančevine 82 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-korabice-s-mrkvom-i-graškom', g: 347 }, // Varivo od korabice s mrkvom i graškom
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-lecso', g: 381 }, // Lečo
      ],
      [
        { foodId: 'b52', g: 150 }, // Grožđe
        { foodId: 'b56', g: 25 }, // Bademi
      ],
    ],
  },
  {
    id: 'mn-g-varivo-od-mahuna-s-junecim-mesom',
    cuisine: 'hrvatska',
    title: "Varivo od mahuna s junećim mesom",
    desc: "Uz večeru: Obara",
    // 1966 kcal, bjelančevine 112 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-hr-varivo-od-mahuna-s-junećim-mesom', g: 279 }, // Varivo od mahuna s junećim mesom
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-obara', g: 362 }, // Obara
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-zagorski-strukli',
    cuisine: 'hrvatska',
    title: "Zagorski štrukli",
    desc: "Uz večeru: Palačinke",
    // 1950 kcal, bjelančevine 91 g
    meals: [
      [
        { foodId: 'b21', g: 100 }, // Kruh integralni
        { foodId: 'b16', g: 50 }, // Sir (gauda/edamer)
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-strukli', g: 219 }, // Zagorski štrukli
        { foodId: 'b20', g: 70 }, // Kruh bijeli
      ],
      [
        { foodId: 'r:rc-palacinke', g: 175 }, // Palačinke
      ],
      [
        { foodId: 'b20', g: 60 }, // Kruh bijeli
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-zagrebacki-odrezak',
    cuisine: 'hrvatska',
    title: "Zagrebački odrezak",
    desc: "Uz večeru: Pileća juha s rezancima",
    // 2096 kcal, bjelančevine 142 g
    meals: [
      [
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
        { foodId: 'b25', g: 50 }, // Zobene pahuljice
        { foodId: 'b50', g: 120 }, // Jagode
        { foodId: 'b56', g: 20 }, // Bademi
      ],
      [
        { foodId: 'r:rc-zagrebacki-odrezak', g: 306 }, // Zagrebački odrezak
        { foodId: 'b45', g: 80 }, // Salata (zelena)
        { foodId: 'b62', g: 10 }, // Maslinovo ulje
      ],
      [
        { foodId: 'r:rc-pileca-juha-rezanci', g: 283 }, // Pileća juha s rezancima
      ],
      [
        { foodId: 'b53', g: 150 }, // Kruška
        { foodId: 'b59', g: 30 }, // Kikiriki
      ],
    ],
  },
  {
    id: 'mn-g-zapecena-cvjetaca',
    cuisine: 'hrvatska',
    title: "Zapečena cvjetača",
    desc: "Uz večeru: Punjene rajčice",
    // 2108 kcal, bjelančevine 79 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-cvjetaca-zapecena', g: 313 }, // Zapečena cvjetača
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-punjena-rajcica', g: 336 }, // Punjene rajčice
      ],
      [
        { foodId: 'b14', g: 200 }, // Jogurt (obični)
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-g-zapecena-tjestenina-s-piletinom-i-rajcicom',
    cuisine: 'hrvatska',
    title: "Zapečena tjestenina s piletinom i rajčicom",
    desc: "Uz večeru: Riba pečena s povrćem",
    // 2066 kcal, bjelančevine 147 g
    meals: [
      [
        { foodId: 'b11', g: 120 }, // Jaje (cijelo)
        { foodId: 'b20', g: 80 }, // Kruh bijeli
        { foodId: 'b10', g: 60 }, // Šunka (pileća)
        { foodId: 'b40', g: 80 }, // Krastavac
      ],
      [
        { foodId: 'r:rc-hr-zapečena-tjestenina-s-piletinom-i-rajčicom', g: 342 }, // Zapečena tjestenina s piletinom i rajčicom
        { foodId: 'b27', g: 250 }, // Palenta (kukuruzna krupica)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-riba-pecena-povrce', g: 377 }, // Riba pečena s povrćem
      ],
      [
        { foodId: 'b54', g: 150 }, // Kivi
        { foodId: 'b15', g: 150 }, // Grčki jogurt
      ],
    ],
  },
  {
    id: 'mn-g-zapecena-tjestenina-sa-sunkom',
    cuisine: 'regionalna',
    title: "Zapečena tjestenina sa šunkom",
    desc: "Uz večeru: Salata od hobotnice",
    // 2037 kcal, bjelančevine 135 g
    meals: [
      [
        { foodId: 'b21', g: 90 }, // Kruh integralni
        { foodId: 'b18', g: 50 }, // Feta sir
        { foodId: 'b11', g: 60 }, // Jaje (cijelo)
        { foodId: 'b45', g: 60 }, // Salata (zelena)
      ],
      [
        { foodId: 'r:rc-zapecena-tjestenina-sunka', g: 281 }, // Zapečena tjestenina sa šunkom
        { foodId: 'b21', g: 120 }, // Kruh integralni
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
      [
        { foodId: 'r:rc-hobotnica-salata', g: 274 }, // Salata od hobotnice
      ],
      [
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b16', g: 40 }, // Sir (gauda/edamer)
      ],
    ],
  },
  {
    id: 'mn-g-zganci-s-cvarcima',
    cuisine: 'hrvatska',
    title: "Žganci s čvarcima",
    desc: "Uz večeru: Sarma",
    // 2012 kcal, bjelančevine 76 g
    meals: [
      [
        { foodId: 'b20', g: 90 }, // Kruh bijeli
        { foodId: 'off:kulen', g: 40 }, // Kulen
        { foodId: 'b14', g: 250 }, // Jogurt (obični)
      ],
      [
        { foodId: 'r:rc-zganci', g: 228 }, // Žganci s čvarcima
        { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
        { foodId: 'b21', g: 60 }, // Kruh integralni
      ],
      [
        { foodId: 'r:rc-sarma', g: 323 }, // Sarma
      ],
      [
        { foodId: 'b47', g: 150 }, // Jabuka
        { foodId: 'b56', g: 30 }, // Bademi
      ],
    ],
  },
]
