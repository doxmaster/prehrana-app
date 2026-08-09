import type { Menu, WeekPlan } from '../domain/types'

/**
 * Dnevni jelovnici i sezonski tjedni koji dolaze s praznom bazom.
 *
 * Količine su za JEDNU referentnu odraslu osobu (oko 2000 kcal). Za kućanstvo
 * se množe zbrojem udjela članova — vidi src/domain/household.ts.
 *
 * Jela su hrvatska i regionalna, a vrijednosti dolaze iz recepata i namirnica
 * provjerenih prema USDA, pa nijedna brojka nije procijenjena napamet.
 */
export const STARTER_MENUS: Menu[] = [
  {
    id: 'mn-piletina-riza',
    title: 'Piletina s rižom',
    desc: 'Uobičajen radni dan',
    meals: [
      [
        { foodId: 'b25', g: 70 }, // Zobene pahuljice
        { foodId: 'b13', g: 250 }, // Mlijeko
        { foodId: 'b48', g: 120 }, // Banana
      ],
      [{ foodId: 'r:rc-rizot-piletina', g: 560 }],
      [
        { foodId: 'b15', g: 150 }, // Grčki jogurt
        { foodId: 'b57', g: 30 }, // Orasi
      ],
      [
        { foodId: 'b47', g: 150 }, // Jabuka
        { foodId: 'b56', g: 30 },
      ],
    ],
  },
  {
    id: 'mn-sarma',
    title: 'Sarma',
    desc: 'Zimski klasik',
    meals: [
      [
        { foodId: 'b21', g: 110 }, // Kruh integralni
        { foodId: 'b16', g: 60 }, // Sir
        { foodId: 'b11', g: 100 }, // Jaje
        { foodId: 'b38', g: 100 }, // Rajčica
      ],
      [
        { foodId: 'r:rc-sarma', g: 620 },
        { foodId: 'b26', g: 150 }, // Krumpir
      ],
      [
        { foodId: 'b14', g: 250 }, // Jogurt
        { foodId: 'b21', g: 80 },
        { foodId: 'off:kulen', g: 40 },
      ],
      [
        { foodId: 'b49', g: 150 }, // Naranča
        { foodId: 'b57', g: 25 }, // Orasi
      ],
    ],
  },
  {
    id: 'mn-riblji-petak',
    title: 'Riblji petak',
    desc: 'Losos s krumpirom i brokulom',
    meals: [
      [
        { foodId: 'b11', g: 150 }, // Jaje
        { foodId: 'b21', g: 100 },
        { foodId: 'b19', g: 12 }, // Maslac
      ],
      [
        { foodId: 'b6', g: 180 }, // Losos
        { foodId: 'b26', g: 250 },
        { foodId: 'b35', g: 150 }, // Brokula
        { foodId: 'b62', g: 10 }, // Maslinovo ulje
      ],
      [
        { foodId: 'off:mozzarella', g: 100 },
        { foodId: 'b38', g: 150 },
        { foodId: 'b21', g: 90 },
        { foodId: 'b62', g: 12 },
      ],
      [{ foodId: 'b56', g: 35 }], // Bademi
    ],
  },
  {
    id: 'mn-grah',
    title: 'Grah s kobasicom',
    desc: 'Zasitan zimski ručak',
    meals: [
      [
        { foodId: 'off:musli', g: 80 },
        { foodId: 'b13', g: 250 },
        { foodId: 'b48', g: 120 },
      ],
      [
        { foodId: 'r:rc-grah', g: 520 },
        { foodId: 'off:kobasica', g: 80 },
        { foodId: 'b20', g: 60 }, // Kruh bijeli
      ],
      [{ foodId: 'r:rc-omlet', g: 260 }],
      [{ foodId: 'b53', g: 150 }], // Kruška
    ],
  },
  {
    id: 'mn-bolognese',
    title: 'Tjestenina bolognese',
    desc: 'Brz obiteljski ručak',
    meals: [
      [
        { foodId: 'b25', g: 60 },
        { foodId: 'b14', g: 200 },
        { foodId: 'b51', g: 80 }, // Borovnice
      ],
      [{ foodId: 'r:rc-bolognese', g: 560 }],
      [
        { foodId: 'b45', g: 120 }, // Salata
        { foodId: 'b7', g: 150 }, // Tuna
        { foodId: 'b21', g: 90 },
        { foodId: 'b62', g: 15 },
        { foodId: 'b16', g: 40 },
      ],
      [{ foodId: 'b52', g: 150 }], // Grožđe
    ],
  },
  {
    id: 'mn-punjena-paprika',
    title: 'Punjena paprika',
    desc: 'Jesenski ručak',
    meals: [
      [
        { foodId: 'b21', g: 110 },
        { foodId: 'b19', g: 15 }, // Maslac
        { foodId: 'b63', g: 20 }, // Med
        { foodId: 'b13', g: 250 },
      ],
      [
        { foodId: 'r:rc-punjena-paprika', g: 600 },
        { foodId: 'b26', g: 150 },
      ],
      [
        { foodId: 'b17', g: 200 }, // Svježi sir
        { foodId: 'b20', g: 100 },
        { foodId: 'b56', g: 25 },
      ],
      [{ foodId: 'b47', g: 180 }],
    ],
  },
  {
    id: 'mn-musaka',
    title: 'Musaka',
    desc: 'Krumpir s mljevenim mesom',
    meals: [
      [
        { foodId: 'b11', g: 100 },
        { foodId: 'b20', g: 60 },
        { foodId: 'b38', g: 100 },
      ],
      [
        { foodId: 'r:rc-musaka', g: 620 },
        { foodId: 'b41', g: 150 }, // Kupus (salata)
      ],
      [
        { foodId: 'b15', g: 200 },
        { foodId: 'b21', g: 90 },
        { foodId: 'b18', g: 50 }, // Feta
      ],
      [
        { foodId: 'b54', g: 150 }, // Kivi
        { foodId: 'b58', g: 25 }, // Lješnjaci
      ],
    ],
  },
  {
    id: 'mn-cevapi',
    title: 'Ćevapi',
    desc: 'Roštilj s prilogom',
    meals: [
      [
        { foodId: 'off:musli', g: 60 },
        { foodId: 'b13', g: 200 },
      ],
      [
        { foodId: 'r:rc-cevapi', g: 260 },
        { foodId: 'b20', g: 100 },
        { foodId: 'b44', g: 50 }, // Luk
      ],
      [
        { foodId: 'b45', g: 120 },
        { foodId: 'b40', g: 150 }, // Krastavac
        { foodId: 'b18', g: 80 }, // Feta
        { foodId: 'b21', g: 100 },
        { foodId: 'b62', g: 15 },
      ],
      [
        { foodId: 'b47', g: 150 },
        { foodId: 'b64', g: 25 },
      ],
    ],
  },
  {
    id: 'mn-pileca-juha',
    title: 'Pileća juha',
    desc: 'Lagan dan',
    meals: [
      [
        { foodId: 'b25', g: 60 },
        { foodId: 'b13', g: 200 },
        { foodId: 'b48', g: 100 },
      ],
      [
        { foodId: 'r:rc-pileca-juha', g: 500 },
        { foodId: 'b21', g: 60 },
      ],
      [{ foodId: 'r:rc-zapecena-tjestenina', g: 400 }],
      [{ foodId: 'b49', g: 150 }],
    ],
  },
  {
    id: 'mn-ljetni-lagani',
    title: 'Ljetni lagani dan',
    desc: 'Salate i svježe voće',
    meals: [
      [
        { foodId: 'b15', g: 250 },
        { foodId: 'b50', g: 150 }, // Jagode
        { foodId: 'b61', g: 20 }, // Chia
        { foodId: 'b56', g: 30 }, // Bademi
        { foodId: 'b63', g: 20 }, // Med
      ],
      [
        { foodId: 'b0', g: 200 },
        { foodId: 'b45', g: 150 },
        { foodId: 'b38', g: 150 },
        { foodId: 'b40', g: 100 },
        { foodId: 'off:masline-zelene', g: 40 },
        { foodId: 'b62', g: 20 },
        { foodId: 'b21', g: 100 },
        { foodId: 'b18', g: 60 },
      ],
      [
        { foodId: 'b43', g: 200 }, // Tikvica
        { foodId: 'b11', g: 150 },
        { foodId: 'b21', g: 100 },
        { foodId: 'b16', g: 40 },
      ],
      [{ foodId: 'b55', g: 300 }], // Lubenica
    ],
  },
  {
    id: 'mn-proljetni-povrce',
    title: 'Proljetno povrće',
    desc: 'Mlado povrće i riba',
    meals: [
      [
        { foodId: 'b11', g: 100 },
        { foodId: 'b21', g: 70 },
        { foodId: 'b46', g: 60 }, // Avokado
      ],
      [
        { foodId: 'b8', g: 160 }, // Skuša
        { foodId: 'b29', g: 200 }, // Kvinoja
        { foodId: 'b36', g: 150 }, // Špinat
      ],
      [
        { foodId: 'b31', g: 300 }, // Leća
        { foodId: 'b37', g: 100 },
        { foodId: 'b21', g: 90 },
        { foodId: 'b62', g: 12 },
      ],
      [
        { foodId: 'b54', g: 150 },
        { foodId: 'b57', g: 25 },
      ],
    ],
  },
  {
    id: 'mn-nedjeljni-rucak',
    title: 'Nedjeljni ručak',
    desc: 'Pečenje s prilogom',
    meals: [
      [
        { foodId: 'off:krafna', g: 100 },
        { foodId: 'b76', g: 200 }, // Kava
        { foodId: 'b11', g: 100 },
        { foodId: 'b21', g: 60 },
      ],
      [
        { foodId: 'r:rc-pileca-juha', g: 300 },
        { foodId: 'b4', g: 180 }, // Svinjetina
        { foodId: 'b26', g: 250 },
        { foodId: 'b41', g: 150 },
      ],
      [
        { foodId: 'b21', g: 60 },
        { foodId: 'off:kulen', g: 40 },
        { foodId: 'b16', g: 30 },
      ],
      [{ foodId: 'b64', g: 25 }], // Tamna čokolada
    ],
  },
  {
    id: 'mn-vegetarijanski',
    title: 'Bez mesa',
    desc: 'Mahunarke i sir',
    meals: [
      [
        { foodId: 'b25', g: 70 },
        { foodId: 'b13', g: 250 },
        { foodId: 'b58', g: 20 }, // Lješnjaci
      ],
      [
        { foodId: 'b32', g: 250 }, // Slanutak
        { foodId: 'b39', g: 150 }, // Paprika
        { foodId: 'b38', g: 150 },
        { foodId: 'b62', g: 15 },
      ],
      [{ foodId: 'r:rc-zapecena-tjestenina', g: 380 }],
      [{ foodId: 'b53', g: 150 }],
    ],
  },
  {
    id: 'mn-zimski-jaki',
    title: 'Zimski zasitan dan',
    desc: 'Palenta i gulaš od junetine',
    meals: [
      [
        { foodId: 'off:griz-pšenična-krupica', g: 60 },
        { foodId: 'b13', g: 250 },
        { foodId: 'b63', g: 15 },
      ],
      [
        { foodId: 'b3', g: 220 }, // Junetina
        { foodId: 'b27', g: 350 }, // Palenta
        { foodId: 'b37', g: 100 },
        { foodId: 'b44', g: 60 },
        { foodId: 'b62', g: 15 },
      ],
      [
        { foodId: 'b30', g: 300 }, // Grah
        { foodId: 'b20', g: 100 },
        { foodId: 'off:kobasica', g: 60 },
      ],
      [{ foodId: 'b47', g: 150 }],
    ],
  },
]

/** Sezonski tjedni, od ponedjeljka do nedjelje. */
export const STARTER_WEEKS: WeekPlan[] = [
  {
    id: 'wk-proljece',
    title: 'Proljetni tjedan',
    desc: 'Mlado povrće, riba i lakši obroci',
    season: 'proljeće',
    days: [
      'mn-piletina-riza',
      'mn-proljetni-povrce',
      'mn-bolognese',
      'mn-vegetarijanski',
      'mn-riblji-petak',
      'mn-cevapi',
      'mn-nedjeljni-rucak',
    ],
  },
  {
    id: 'wk-ljeto',
    title: 'Ljetni tjedan',
    desc: 'Salate, roštilj i svježe voće',
    season: 'ljeto',
    days: [
      'mn-ljetni-lagani',
      'mn-piletina-riza',
      'mn-ljetni-lagani',
      'mn-bolognese',
      'mn-riblji-petak',
      'mn-cevapi',
      'mn-nedjeljni-rucak',
    ],
  },
  {
    id: 'wk-jesen',
    title: 'Jesenski tjedan',
    desc: 'Punjena paprika, musaka i juhe',
    season: 'jesen',
    days: [
      'mn-punjena-paprika',
      'mn-pileca-juha',
      'mn-musaka',
      'mn-vegetarijanski',
      'mn-riblji-petak',
      'mn-bolognese',
      'mn-nedjeljni-rucak',
    ],
  },
  {
    id: 'wk-zima',
    title: 'Zimski tjedan',
    desc: 'Sarma, grah i zasitni obroci',
    season: 'zima',
    days: [
      'mn-grah',
      'mn-zimski-jaki',
      'mn-sarma',
      'mn-pileca-juha',
      'mn-riblji-petak',
      'mn-musaka',
      'mn-nedjeljni-rucak',
    ],
  },
]
