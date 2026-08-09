import type { Recipe } from '../domain/types'

/**
 * Domaca jela koja se dobiju s praznom bazom.
 *
 * Namjerno NISU upisana kao namirnice s procijenjenim vrijednostima: svako jelo
 * je popis sastojaka, pa se hranjive vrijednosti racunaju iz namirnica koje su
 * provjerene prema USDA. Time svaka brojka ima trag do laboratorijske analize,
 * a korisnik moze prilagoditi gramaze svom nacinu pripreme.
 *
 * `yieldFactor` je udio mase koji ostane nakon pripreme — kuhanjem i pecenjem
 * isparava voda, pa se ista energija rasporeduje na manju masu.
 */
export const STARTER_RECIPES: Recipe[] = [
  {
    id: 'rc-punjena-paprika',
    name: 'Punjena paprika',
    cat: 'Meso i riba',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Klasicna priprema s mljevenim mesom i rizom, u umaku od rajcice.',
    items: [
      { foodId: 'b39', g: 600 }, // Paprika crvena
      { foodId: 'b5', g: 400 }, // Mljeveno meso (miješano)
      { foodId: 'b22', g: 300 }, // Riža bijela (kuhana)
      { foodId: 'b44', g: 100 }, // Luk
      { foodId: 'b38', g: 400 }, // Rajčica
      { foodId: 'b62', g: 20 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-sarma',
    name: 'Sarma',
    cat: 'Meso i riba',
    servings: 6,
    yieldFactor: 0.9,
    note: 'S kupusom iz baze; ako koristis kiseli kupus, zamijeni sastojak.',
    items: [
      { foodId: 'b41', g: 800 }, // Kupus
      { foodId: 'b5', g: 600 }, // Mljeveno meso
      { foodId: 'b22', g: 300 }, // Riža bijela (kuhana)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b38', g: 300 }, // Rajčica
    ],
  },
  {
    id: 'rc-bolognese',
    name: 'Tjestenina bolognese',
    cat: 'Žitarice i kruh',
    servings: 4,
    items: [
      { foodId: 'b24', g: 600 }, // Tjestenina (kuhana)
      { foodId: 'b5', g: 400 }, // Mljeveno meso
      { foodId: 'b38', g: 400 }, // Rajčica
      { foodId: 'b37', g: 100 }, // Mrkva
      { foodId: 'b44', g: 100 }, // Luk
      { foodId: 'b62', g: 20 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-grah',
    name: 'Grah s povrćem',
    cat: 'Mahunarke',
    servings: 4,
    items: [
      { foodId: 'b30', g: 600 }, // Grah (kuhani)
      { foodId: 'b37', g: 150 }, // Mrkva
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'b38', g: 200 }, // Rajčica
      { foodId: 'b62', g: 20 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-musaka',
    name: 'Musaka s krumpirom',
    cat: 'Meso i riba',
    servings: 6,
    yieldFactor: 0.85,
    items: [
      { foodId: 'b26', g: 1000 }, // Krumpir (kuhani)
      { foodId: 'b5', g: 500 }, // Mljeveno meso
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'b13', g: 250 }, // Mlijeko
    ],
  },
  {
    id: 'rc-rizot-piletina',
    name: 'Rižot s piletinom',
    cat: 'Žitarice i kruh',
    servings: 4,
    items: [
      { foodId: 'b22', g: 600 }, // Riža bijela (kuhana)
      { foodId: 'b0', g: 400 }, // Pileća prsa
      { foodId: 'b33', g: 150 }, // Grašak
      { foodId: 'b37', g: 100 }, // Mrkva
      { foodId: 'b44', g: 80 }, // Luk
      { foodId: 'b62', g: 25 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-zapecena-tjestenina',
    name: 'Zapečena tjestenina sa sirom',
    cat: 'Žitarice i kruh',
    servings: 4,
    yieldFactor: 0.9,
    items: [
      { foodId: 'b24', g: 600 }, // Tjestenina (kuhana)
      { foodId: 'b16', g: 150 }, // Sir (gauda/edamer)
      { foodId: 'b11', g: 100 }, // Jaje
      { foodId: 'b13', g: 200 }, // Mlijeko
      { foodId: 'b19', g: 20 }, // Maslac
    ],
  },
  {
    id: 'rc-omlet',
    name: 'Omlet sa sirom',
    cat: 'Mliječno i jaja',
    servings: 1,
    yieldFactor: 0.9,
    items: [
      { foodId: 'b11', g: 150 }, // Jaje (3 komada)
      { foodId: 'b16', g: 30 }, // Sir
      { foodId: 'b19', g: 10 }, // Maslac
    ],
  },
  {
    id: 'rc-cevapi',
    name: 'Ćevapi',
    cat: 'Meso i riba',
    servings: 4,
    yieldFactor: 0.8,
    items: [
      { foodId: 'b5', g: 800 }, // Mljeveno meso
      { foodId: 'b44', g: 60 }, // Luk
    ],
  },
  {
    id: 'rc-pileca-juha',
    name: 'Pileća juha s povrćem',
    cat: 'Meso i riba',
    servings: 4,
    items: [
      { foodId: 'b1', g: 300 }, // Pileći batak
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b44', g: 80 }, // Luk
      { foodId: 'b24', g: 150 }, // Tjestenina
    ],
  },
]
