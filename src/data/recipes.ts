/**
 * GENERIRANO — ne uređivati ručno.
 * Izvor: scripts/recipes-source.json, generator: scripts/generate-recipes.mjs
 *
 * 142 tradicionalnih jela hrvatske i susjednih kuhinja. Vrijednosti se
 * računaju iz sastojaka provjerenih prema USDA, pa nijedna brojka nije procijenjena.
 *
 * `drink` je preporučeno piće uz jelo — dodaje se posebno i NE ulazi u
 * hranjive vrijednosti jela.
 */
import type { Recipe } from '../domain/types'

export const STARTER_RECIPES: Recipe[] = [
  {
    id: 'rc-punjena-paprika',
    name: 'Punjena paprika',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Klasicna priprema s mljevenim mesom i rizom.',
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
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.9,
    note: 'S kupusom iz baze; za kiseli kupus zamijeni sastojak.',
    items: [
      { foodId: 'b41', g: 800 }, // Kupus
      { foodId: 'b5', g: 600 }, // Mljeveno meso (miješano)
      { foodId: 'b22', g: 300 }, // Riža bijela (kuhana)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b38', g: 300 }, // Rajčica
    ],
  },
  {
    id: 'rc-bolognese',
    name: 'Tjestenina bolognese',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 4,
    items: [
      { foodId: 'b24', g: 600 }, // Tjestenina (kuhana)
      { foodId: 'b5', g: 400 }, // Mljeveno meso (miješano)
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
    cuisine: 'hrvatska',
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
    name: 'Musaka',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 6,
    yieldFactor: 0.85,
    items: [
      { foodId: 'b26', g: 1000 }, // Krumpir (kuhani)
      { foodId: 'b5', g: 500 }, // Mljeveno meso (miješano)
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
    ],
  },
  {
    id: 'rc-rizot-piletina',
    name: 'Rižot s piletinom',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    items: [
      { foodId: 'b22', g: 600 }, // Riža bijela (kuhana)
      { foodId: 'b0', g: 400 }, // Pileća prsa (pečena)
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
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.9,
    items: [
      { foodId: 'b24', g: 600 }, // Tjestenina (kuhana)
      { foodId: 'b16', g: 150 }, // Sir (gauda/edamer)
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'b13', g: 200 }, // Mlijeko 2.8%
      { foodId: 'b19', g: 20 }, // Maslac
    ],
  },
  {
    id: 'rc-omlet',
    name: 'Omlet sa sirom',
    cat: 'Mliječno i jaja',
    cuisine: 'regionalna',
    servings: 1,
    yieldFactor: 0.9,
    items: [
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'b16', g: 30 }, // Sir (gauda/edamer)
      { foodId: 'b19', g: 10 }, // Maslac
    ],
  },
  {
    id: 'rc-cevapi',
    name: 'Ćevapi',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.8,
    items: [
      { foodId: 'b5', g: 800 }, // Mljeveno meso (miješano)
      { foodId: 'b44', g: 60 }, // Luk
    ],
  },
  {
    id: 'rc-pileca-juha',
    name: 'Pileća juha s povrćem',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    items: [
      { foodId: 'b1', g: 300 }, // Pileći batak
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b44', g: 80 }, // Luk
      { foodId: 'b24', g: 150 }, // Tjestenina (kuhana)
    ],
  },
  {
    id: 'rc-pasticada',
    name: 'Pašticada',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.8,
    note: 'Dalmatinska govedina u umaku od suhih šljiva i vina.',
    drink: { foodId: 'b70', g: 150 },
    items: [
      { foodId: 'u:junetina-za-gulaš', g: 1200 }, // Junetina za gulaš
      { foodId: 'b44', g: 250 }, // Luk
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'u:celer-korijen', g: 100 }, // Celer korijen
      { foodId: 'u:suhe-šljive', g: 120 }, // Suhe šljive
      { foodId: 'off:pelati-guljene-rajčice', g: 300 }, // Pelati (guljene rajčice)
      { foodId: 'b70', g: 250 }, // Vino crno
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
    ],
  },
  {
    id: 'rc-brudet',
    name: 'Brudet',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Riblji gulaš, poslužuje se uz palentu.',
    drink: { foodId: 'u:vino-bijelo-suho', g: 150 },
    items: [
      { foodId: 'u:oslić', g: 600 }, // Oslić
      { foodId: 'u:škampi', g: 200 }, // Škampi
      { foodId: 'u:lignje', g: 300 }, // Lignje
      { foodId: 'off:pelati-guljene-rajčice', g: 400 }, // Pelati (guljene rajčice)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
      { foodId: 'b62', g: 50 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 20 }, // Peršin
      { foodId: 'u:vino-bijelo-suho', g: 150 }, // Vino bijelo (suho)
    ],
  },
  {
    id: 'rc-crni-rizot',
    name: 'Crni rižot',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Rižot s lignjama.',
    drink: { foodId: 'u:vino-bijelo-pinot-gris', g: 150 },
    items: [
      { foodId: 'u:lignje', g: 600 }, // Lignje
      { foodId: 'b22', g: 700 }, // Riža bijela (kuhana)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'b62', g: 45 }, // Maslinovo ulje
      { foodId: 'u:vino-bijelo-suho', g: 120 }, // Vino bijelo (suho)
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-buzara',
    name: 'Škampi na buzaru',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Škampi u umaku od vina, češnjaka i mrvica.',
    drink: { foodId: 'u:vino-bijelo-suho', g: 150 },
    items: [
      { foodId: 'u:škampi', g: 800 }, // Škampi
      { foodId: 'u:češnjak', g: 25 }, // Češnjak
      { foodId: 'u:peršin', g: 20 }, // Peršin
      { foodId: 'u:krušne-mrvice', g: 40 }, // Krušne mrvice
      { foodId: 'b62', g: 50 }, // Maslinovo ulje
      { foodId: 'u:vino-bijelo-suho', g: 150 }, // Vino bijelo (suho)
      { foodId: 'off:pelati-guljene-rajčice', g: 150 }, // Pelati (guljene rajčice)
    ],
  },
  {
    id: 'rc-dagnje-buzara',
    name: 'Dagnje na buzaru',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Klasik jadranske obale.',
    drink: { foodId: 'u:vino-bijelo-sauvignon', g: 150 },
    items: [
      { foodId: 'u:dagnje', g: 900 }, // Dagnje
      { foodId: 'u:češnjak', g: 25 }, // Češnjak
      { foodId: 'u:peršin', g: 20 }, // Peršin
      { foodId: 'b62', g: 45 }, // Maslinovo ulje
      { foodId: 'u:vino-bijelo-suho', g: 150 }, // Vino bijelo (suho)
      { foodId: 'u:krušne-mrvice', g: 30 }, // Krušne mrvice
    ],
  },
  {
    id: 'rc-hobotnica-peka',
    name: 'Hobotnica ispod peke',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.75,
    note: 'Hobotnica s krumpirom, sporo pečena.',
    drink: { foodId: 'u:vino-bijelo-suho', g: 150 },
    items: [
      { foodId: 'u:hobotnica', g: 800 }, // Hobotnica
      { foodId: 'b26', g: 800 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'b37', g: 150 }, // Mrkva
      { foodId: 'b62', g: 60 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
      { foodId: 'u:vino-bijelo-suho', g: 150 }, // Vino bijelo (suho)
      { foodId: 'u:origano-suhi', g: 3 }, // Origano (suhi)
    ],
  },
  {
    id: 'rc-gregada',
    name: 'Gregada',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Hvarski ribarski lonac s krumpirom.',
    drink: { foodId: 'u:vino-bijelo-suho', g: 150 },
    items: [
      { foodId: 'u:brancin', g: 700 }, // Brancin
      { foodId: 'b26', g: 700 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
      { foodId: 'b62', g: 50 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 15 }, // Peršin
      { foodId: 'u:vino-bijelo-suho', g: 150 }, // Vino bijelo (suho)
    ],
  },
  {
    id: 'rc-riba-gradele',
    name: 'Riba na gradele',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Orada s maslinovim uljem i češnjakom.',
    drink: { foodId: 'u:vino-bijelo-chardonnay', g: 150 },
    items: [
      { foodId: 'u:orada', g: 800 }, // Orada
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:peršin', g: 15 }, // Peršin
      { foodId: 'u:limun', g: 60 }, // Limun
    ],
  },
  {
    id: 'rc-blitva-krumpir',
    name: 'Blitva s krumpirom',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.8,
    note: 'Dalmatinski prilog uz ribu.',
    items: [
      { foodId: 'u:blitva', g: 700 }, // Blitva
      { foodId: 'b26', g: 500 }, // Krumpir (kuhani)
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
      { foodId: 'b62', g: 50 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-pasta-fazol',
    name: 'Pašta fažol',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Grah s tjesteninom, primorski i istarski klasik.',
    items: [
      { foodId: 'b30', g: 500 }, // Grah (kuhani)
      { foodId: 'b24', g: 300 }, // Tjestenina (kuhana)
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'b37', g: 100 }, // Mrkva
      { foodId: 'off:kobasica', g: 100 }, // Kobasica
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
      { foodId: 'off:pelati-guljene-rajčice', g: 150 }, // Pelati (guljene rajčice)
    ],
  },
  {
    id: 'rc-manestra',
    name: 'Istarska maneštra',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 5,
    note: 'Gusta juha od kukuruza i graha.',
    items: [
      { foodId: 'b30', g: 400 }, // Grah (kuhani)
      { foodId: 'u:kukuruz-šećerac', g: 300 }, // Kukuruz šećerac
      { foodId: 'b26', g: 350 }, // Krumpir (kuhani)
      { foodId: 'b37', g: 150 }, // Mrkva
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'b4', g: 150 }, // Svinjetina (but)
      { foodId: 'off:kobasica', g: 120 }, // Kobasica
      { foodId: 'b62', g: 25 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-jota',
    name: 'Jota',
    cat: 'Mahunarke',
    cuisine: 'regionalna',
    servings: 5,
    note: 'Kiseli kupus, grah i krumpir — istarska i slovenska.',
    items: [
      { foodId: 'b41', g: 500 }, // Kupus
      { foodId: 'b30', g: 400 }, // Grah (kuhani)
      { foodId: 'b26', g: 350 }, // Krumpir (kuhani)
      { foodId: 'off:kobasica', g: 150 }, // Kobasica
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:svinjska-mast', g: 25 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-soparnik',
    name: 'Soparnik',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.85,
    note: 'Poljička pita s blitvom.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 500 }, // Brašno glatko (pšenično)
      { foodId: 'u:blitva', g: 800 }, // Blitva
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:peršin', g: 30 }, // Peršin
      { foodId: 'b62', g: 70 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
    ],
  },
  {
    id: 'rc-arambasici',
    name: 'Arambašići',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.9,
    note: 'Sinjski sarmi s ručno rezanim mesom.',
    items: [
      { foodId: 'b41', g: 800 }, // Kupus
      { foodId: 'u:junetina-za-gulaš', g: 700 }, // Junetina za gulaš
      { foodId: 'b4', g: 300 }, // Svinjetina (but)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:cimet', g: 2 }, // Cimet
      { foodId: 'u:svinjska-mast', g: 30 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-janjetina-peka',
    name: 'Janjetina ispod peke',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.7,
    note: 'Janjetina s krumpirom, sporo pečena.',
    drink: { foodId: 'b70', g: 150 },
    items: [
      { foodId: 'u:janjetina', g: 1400 }, // Janjetina
      { foodId: 'b26', g: 1000 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b62', g: 50 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
      { foodId: 'u:origano-suhi', g: 4 }, // Origano (suhi)
    ],
  },
  {
    id: 'rc-cobanac',
    name: 'Čobanac',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.85,
    note: 'Slavonski lovački gulaš od više vrsta mesa.',
    drink: { foodId: 'b70', g: 150 },
    items: [
      { foodId: 'u:junetina-za-gulaš', g: 600 }, // Junetina za gulaš
      { foodId: 'b4', g: 500 }, // Svinjetina (but)
      { foodId: 'u:janjetina', g: 300 }, // Janjetina
      { foodId: 'b44', g: 400 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 20 }, // Crvena mljevena paprika
      { foodId: 'u:ljuta-paprika', g: 20 }, // Ljuta paprika
      { foodId: 'off:pelati-guljene-rajčice', g: 300 }, // Pelati (guljene rajčice)
      { foodId: 'u:svinjska-mast', g: 50 }, // Svinjska mast
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
    ],
  },
  {
    id: 'rc-fis-paprikas',
    name: 'Fiš paprikaš',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 5,
    yieldFactor: 0.9,
    note: 'Baranjski riblji paprikaš od šarana.',
    drink: { foodId: 'u:vino-bijelo-rizling', g: 150 },
    items: [
      { foodId: 'u:šaran', g: 1200 }, // Šaran
      { foodId: 'b44', g: 400 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 30 }, // Crvena mljevena paprika
      { foodId: 'u:ljuta-paprika', g: 15 }, // Ljuta paprika
      { foodId: 'off:pelati-guljene-rajčice', g: 200 }, // Pelati (guljene rajčice)
      { foodId: 'off:suncokretovo-ulje', g: 40 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-krumpir-paprikas',
    name: 'Krumpir paprikaš',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Jednostavan slavonski ručak s kobasicom.',
    items: [
      { foodId: 'b26', g: 900 }, // Krumpir (kuhani)
      { foodId: 'off:kobasica', g: 250 }, // Kobasica
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 12 }, // Crvena mljevena paprika
      { foodId: 'u:svinjska-mast', g: 30 }, // Svinjska mast
      { foodId: 'b39', g: 150 }, // Paprika crvena
    ],
  },
  {
    id: 'rc-perkelt',
    name: 'Perkelt od piletine',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Piletina u umaku od paprike i luka.',
    items: [
      { foodId: 'b1', g: 800 }, // Pileći batak
      { foodId: 'b44', g: 300 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 18 }, // Crvena mljevena paprika
      { foodId: 'b39', g: 200 }, // Paprika crvena
      { foodId: 'off:pelati-guljene-rajčice', g: 200 }, // Pelati (guljene rajčice)
      { foodId: 'u:svinjska-mast', g: 35 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-strukli',
    name: 'Zagorski štrukli',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.9,
    note: 'Vučeno tijesto sa svježim sirom.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 350 }, // Brašno glatko (pšenično)
      { foodId: 'b17', g: 700 }, // Svježi sir (posni)
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'u:vrhnje-za-šlag', g: 200 }, // Vrhnje za šlag
      { foodId: 'b19', g: 60 }, // Maslac
    ],
  },
  {
    id: 'rc-zagrebacki-odrezak',
    name: 'Zagrebački odrezak',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Teletina punjena šunkom i sirom, pohana.',
    items: [
      { foodId: 'u:teletina', g: 700 }, // Teletina
      { foodId: 'b10', g: 150 }, // Šunka (pileća)
      { foodId: 'b16', g: 150 }, // Sir (gauda/edamer)
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'u:krušne-mrvice', g: 120 }, // Krušne mrvice
      { foodId: 'u:brašno-glatko-pšenično', g: 60 }, // Brašno glatko (pšenično)
      { foodId: 'off:suncokretovo-ulje', g: 80 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-purica-mlinci',
    name: 'Purica s tjesteninom',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.85,
    note: 'Zagorska pečena purica; mlinci zamijenjeni tjesteninom.',
    drink: { foodId: 'u:vino-bijelo-suho', g: 150 },
    items: [
      { foodId: 'b2', g: 1200 }, // Pureća prsa
      { foodId: 'b24', g: 700 }, // Tjestenina (kuhana)
      { foodId: 'u:svinjska-mast', g: 50 }, // Svinjska mast
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
    ],
  },
  {
    id: 'rc-buncek-grah',
    name: 'Buncek s grahom',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 5,
    note: 'Dimljeno meso s grahom i kiselim kupusom.',
    items: [
      { foodId: 'b4', g: 600 }, // Svinjetina (but)
      { foodId: 'b30', g: 600 }, // Grah (kuhani)
      { foodId: 'b41', g: 400 }, // Kupus
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 10 }, // Crvena mljevena paprika
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
    ],
  },
  {
    id: 'rc-kotlovina',
    name: 'Kotlovina',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.8,
    note: 'Kotleti i kobasice u umaku od vina i rajčice.',
    drink: { foodId: 'b68', g: 500 },
    items: [
      { foodId: 'u:svinjski-kotlet', g: 900 }, // Svinjski kotlet
      { foodId: 'off:kobasica', g: 400 }, // Kobasica
      { foodId: 'b44', g: 300 }, // Luk
      { foodId: 'off:pelati-guljene-rajčice', g: 400 }, // Pelati (guljene rajčice)
      { foodId: 'b39', g: 200 }, // Paprika crvena
      { foodId: 'u:vino-bijelo-suho', g: 200 }, // Vino bijelo (suho)
      { foodId: 'u:svinjska-mast', g: 40 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-licki-lonac',
    name: 'Lički lonac',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.85,
    note: 'Meso i povrće slagano u lonac, dugo kuhano.',
    items: [
      { foodId: 'u:janjetina', g: 600 }, // Janjetina
      { foodId: 'b4', g: 400 }, // Svinjetina (but)
      { foodId: 'b26', g: 700 }, // Krumpir (kuhani)
      { foodId: 'b41', g: 400 }, // Kupus
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'b39', g: 150 }, // Paprika crvena
      { foodId: 'u:svinjska-mast', g: 40 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-kiseli-kupus-rebra',
    name: 'Kiseli kupus s rebrima',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 5,
    yieldFactor: 0.85,
    note: 'Zimsko jelo, poslužuje se s krumpirom.',
    items: [
      { foodId: 'u:svinjska-rebra', g: 900 }, // Svinjska rebra
      { foodId: 'b41', g: 800 }, // Kupus
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 12 }, // Crvena mljevena paprika
      { foodId: 'u:lovorov-list', g: 1 }, // Lovorov list
      { foodId: 'u:svinjska-mast', g: 30 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-begova-corba',
    name: 'Begova čorba',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 5,
    note: 'Bosanska juha od piletine i povrća, zgusnuta.',
    items: [
      { foodId: 'b0', g: 500 }, // Pileća prsa (pečena)
      { foodId: 'b33', g: 200 }, // Grašak
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'u:celer-korijen', g: 100 }, // Celer korijen
      { foodId: 'b26', g: 300 }, // Krumpir (kuhani)
      { foodId: 'u:vrhnje-za-šlag', g: 150 }, // Vrhnje za šlag
      { foodId: 'u:brašno-glatko-pšenično', g: 40 }, // Brašno glatko (pšenično)
      { foodId: 'b19', g: 40 }, // Maslac
      { foodId: 'u:peršin', g: 20 }, // Peršin
    ],
  },
  {
    id: 'rc-bosanski-lonac',
    name: 'Bosanski lonac',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 6,
    yieldFactor: 0.85,
    note: 'Meso i povrće slagano u slojevima, dugo kuhano.',
    items: [
      { foodId: 'u:junetina-za-gulaš', g: 600 }, // Junetina za gulaš
      { foodId: 'u:janjetina', g: 400 }, // Janjetina
      { foodId: 'b26', g: 700 }, // Krumpir (kuhani)
      { foodId: 'b41', g: 400 }, // Kupus
      { foodId: 'b37', g: 250 }, // Mrkva
      { foodId: 'b44', g: 250 }, // Luk
      { foodId: 'b39', g: 200 }, // Paprika crvena
      { foodId: 'b38', g: 300 }, // Rajčica
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
    ],
  },
  {
    id: 'rc-japrak',
    name: 'Japrak',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.9,
    note: 'Punjeni listovi zelja s mesom i rižom.',
    items: [
      { foodId: 'u:blitva', g: 600 }, // Blitva
      { foodId: 'b5', g: 600 }, // Mljeveno meso (miješano)
      { foodId: 'b22', g: 350 }, // Riža bijela (kuhana)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'b14', g: 200 }, // Jogurt (obični)
      { foodId: 'u:svinjska-mast', g: 30 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-sogan-dolma',
    name: 'Sogan dolma',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.9,
    note: 'Punjeni luk s mljevenim mesom.',
    items: [
      { foodId: 'b44', g: 900 }, // Luk
      { foodId: 'b5', g: 500 }, // Mljeveno meso (miješano)
      { foodId: 'b22', g: 300 }, // Riža bijela (kuhana)
      { foodId: 'off:pelati-guljene-rajčice', g: 200 }, // Pelati (guljene rajčice)
      { foodId: 'u:svinjska-mast', g: 30 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-klepe',
    name: 'Klepe',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.9,
    note: 'Punjeni tjesteninski jastučići s češnjakom i jogurtom.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 350 }, // Brašno glatko (pšenično)
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'b5', g: 400 }, // Mljeveno meso (miješano)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b14', g: 350 }, // Jogurt (obični)
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
      { foodId: 'b19', g: 40 }, // Maslac
    ],
  },
  {
    id: 'rc-karadordeva',
    name: 'Karađorđeva šnicla',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Rolana teletina punjena vrhnjem, pohana.',
    items: [
      { foodId: 'u:teletina', g: 700 }, // Teletina
      { foodId: 'u:vrhnje-za-šlag', g: 200 }, // Vrhnje za šlag
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'u:krušne-mrvice', g: 130 }, // Krušne mrvice
      { foodId: 'u:brašno-glatko-pšenično', g: 60 }, // Brašno glatko (pšenično)
      { foodId: 'off:suncokretovo-ulje', g: 90 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-podvarak',
    name: 'Podvarak',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.8,
    note: 'Kiseli kupus zapečen s mesom.',
    items: [
      { foodId: 'b41', g: 900 }, // Kupus
      { foodId: 'b4', g: 500 }, // Svinjetina (but)
      { foodId: 'off:kobasica', g: 200 }, // Kobasica
      { foodId: 'b44', g: 250 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 12 }, // Crvena mljevena paprika
      { foodId: 'u:svinjska-mast', g: 40 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-gibanica',
    name: 'Gibanica sa sirom',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 8,
    yieldFactor: 0.9,
    note: 'Slojevita pita sa sirom i jajima.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 400 }, // Brašno glatko (pšenično)
      { foodId: 'b17', g: 800 }, // Svježi sir (posni)
      { foodId: 'b11', g: 300 }, // Jaje (cijelo)
      { foodId: 'b14', g: 300 }, // Jogurt (obični)
      { foodId: 'off:suncokretovo-ulje', g: 120 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-prebranac',
    name: 'Prebranac',
    cat: 'Mahunarke',
    cuisine: 'regionalna',
    servings: 5,
    note: 'Zapečeni bijeli grah s puno luka.',
    items: [
      { foodId: 'u:bijeli-grah-kuhani', g: 800 }, // Bijeli grah (kuhani)
      { foodId: 'b44', g: 600 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 15 }, // Crvena mljevena paprika
      { foodId: 'off:suncokretovo-ulje', g: 70 }, // Suncokretovo ulje
      { foodId: 'u:lovorov-list', g: 1 }, // Lovorov list
    ],
  },
  {
    id: 'rc-muckalica',
    name: 'Mućkalica',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.85,
    note: 'Svinjetina s pečenim paprikama i rajčicom.',
    items: [
      { foodId: 'b4', g: 800 }, // Svinjetina (but)
      { foodId: 'b39', g: 500 }, // Paprika crvena
      { foodId: 'b38', g: 400 }, // Rajčica
      { foodId: 'b44', g: 250 }, // Luk
      { foodId: 'u:ljuta-paprika', g: 20 }, // Ljuta paprika
      { foodId: 'off:suncokretovo-ulje', g: 40 }, // Suncokretovo ulje
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
    ],
  },
  {
    id: 'rc-ricet',
    name: 'Ričet',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 5,
    note: 'Slovenski ječam s grahom i suhim mesom.',
    items: [
      { foodId: 'u:ječam-kuhani', g: 600 }, // Ječam (kuhani)
      { foodId: 'b30', g: 400 }, // Grah (kuhani)
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b26', g: 300 }, // Krumpir (kuhani)
      { foodId: 'off:kobasica', g: 200 }, // Kobasica
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:svinjska-mast', g: 25 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-obara',
    name: 'Obara',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 5,
    note: 'Slovenski lonac s piletinom i povrćem.',
    items: [
      { foodId: 'b1', g: 700 }, // Pileći batak
      { foodId: 'b26', g: 500 }, // Krumpir (kuhani)
      { foodId: 'b37', g: 250 }, // Mrkva
      { foodId: 'u:poriluk', g: 200 }, // Poriluk
      { foodId: 'u:celer-korijen', g: 100 }, // Celer korijen
      { foodId: 'u:brašno-glatko-pšenično', g: 30 }, // Brašno glatko (pšenično)
      { foodId: 'b19', g: 30 }, // Maslac
    ],
  },
  {
    id: 'rc-kranjska-zelje',
    name: 'Kobasica s kiselim kupusom',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Kranjska kobasica s kupusom i krumpirom.',
    drink: { foodId: 'b68', g: 500 },
    items: [
      { foodId: 'off:kobasica', g: 500 }, // Kobasica
      { foodId: 'b41', g: 600 }, // Kupus
      { foodId: 'b26', g: 500 }, // Krumpir (kuhani)
      { foodId: 'off:senf', g: 30 }, // Senf
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:svinjska-mast', g: 25 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-gulas',
    name: 'Gulaš',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.85,
    note: 'Mađarski gulaš s puno luka i paprike.',
    drink: { foodId: 'b70', g: 150 },
    items: [
      { foodId: 'u:junetina-za-gulaš', g: 900 }, // Junetina za gulaš
      { foodId: 'b44', g: 500 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 25 }, // Crvena mljevena paprika
      { foodId: 'b39', g: 200 }, // Paprika crvena
      { foodId: 'off:pelati-guljene-rajčice', g: 250 }, // Pelati (guljene rajčice)
      { foodId: 'b26', g: 400 }, // Krumpir (kuhani)
      { foodId: 'u:svinjska-mast', g: 45 }, // Svinjska mast
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
    ],
  },
  {
    id: 'rc-djuvec',
    name: 'Đuveč',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.85,
    note: 'Povrće i riža zapečeni s mesom.',
    items: [
      { foodId: 'b39', g: 400 }, // Paprika crvena
      { foodId: 'u:patlidžan', g: 300 }, // Patlidžan
      { foodId: 'b43', g: 300 }, // Tikvica
      { foodId: 'b38', g: 400 }, // Rajčica
      { foodId: 'b22', g: 400 }, // Riža bijela (kuhana)
      { foodId: 'b4', g: 400 }, // Svinjetina (but)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'off:suncokretovo-ulje', g: 50 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-lecso',
    name: 'Lečo',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Paprika i rajčica pirjane s kobasicom.',
    items: [
      { foodId: 'b39', g: 600 }, // Paprika crvena
      { foodId: 'u:paprika-zelena', g: 300 }, // Paprika zelena
      { foodId: 'b38', g: 400 }, // Rajčica
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'off:kobasica', g: 250 }, // Kobasica
      { foodId: 'off:suncokretovo-ulje', g: 35 }, // Suncokretovo ulje
      { foodId: 'u:crvena-mljevena-paprika', g: 10 }, // Crvena mljevena paprika
    ],
  },
  {
    id: 'rc-rizot-gljive',
    name: 'Rižot s gljivama',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Kremasti rižot sa šampinjonima i parmezanom.',
    drink: { foodId: 'u:vino-bijelo-chardonnay', g: 150 },
    items: [
      { foodId: 'b22', g: 700 }, // Riža bijela (kuhana)
      { foodId: 'u:šampinjoni', g: 400 }, // Šampinjoni
      { foodId: 'u:bukovače', g: 150 }, // Bukovače
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'u:parmezan', g: 80 }, // Parmezan
      { foodId: 'b19', g: 50 }, // Maslac
      { foodId: 'u:vino-bijelo-suho', g: 120 }, // Vino bijelo (suho)
      { foodId: 'b62', g: 20 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-njoki-umak',
    name: 'Njoki s umakom od rajčice',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Krumpirovi njoki; tijesto od krumpira i brašna.',
    items: [
      { foodId: 'b26', g: 800 }, // Krumpir (kuhani)
      { foodId: 'u:brašno-glatko-pšenično', g: 250 }, // Brašno glatko (pšenično)
      { foodId: 'b11', g: 50 }, // Jaje (cijelo)
      { foodId: 'off:pelati-guljene-rajčice', g: 400 }, // Pelati (guljene rajčice)
      { foodId: 'u:parmezan', g: 60 }, // Parmezan
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 10 }, // Češnjak
    ],
  },
  {
    id: 'rc-minestrone',
    name: 'Minestrone',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 5,
    note: 'Gusta juha od sezonskog povrća i tjestenine.',
    items: [
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'u:celer-stabljika', g: 150 }, // Celer (stabljika)
      { foodId: 'b43', g: 200 }, // Tikvica
      { foodId: 'b30', g: 300 }, // Grah (kuhani)
      { foodId: 'b24', g: 250 }, // Tjestenina (kuhana)
      { foodId: 'off:pelati-guljene-rajčice', g: 300 }, // Pelati (guljene rajčice)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:parmezan', g: 50 }, // Parmezan
    ],
  },
  {
    id: 'rc-frittata',
    name: 'Frittata s povrćem',
    cat: 'Mliječno i jaja',
    cuisine: 'regionalna',
    servings: 3,
    yieldFactor: 0.9,
    note: 'Zapečena jaja s tikvicom i sirom.',
    items: [
      { foodId: 'b11', g: 400 }, // Jaje (cijelo)
      { foodId: 'b43', g: 250 }, // Tikvica
      { foodId: 'b39', g: 150 }, // Paprika crvena
      { foodId: 'b16', g: 100 }, // Sir (gauda/edamer)
      { foodId: 'b62', g: 25 }, // Maslinovo ulje
      { foodId: 'b44', g: 80 }, // Luk
    ],
  },
  {
    id: 'rc-lazanje',
    name: 'Lazanje',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 6,
    yieldFactor: 0.9,
    note: 'Slojevi tjestenine, mesnog umaka i bešamela.',
    items: [
      { foodId: 'b24', g: 500 }, // Tjestenina (kuhana)
      { foodId: 'b5', g: 600 }, // Mljeveno meso (miješano)
      { foodId: 'off:pelati-guljene-rajčice', g: 500 }, // Pelati (guljene rajčice)
      { foodId: 'b13', g: 400 }, // Mlijeko 2.8%
      { foodId: 'u:brašno-glatko-pšenično', g: 50 }, // Brašno glatko (pšenično)
      { foodId: 'b19', g: 60 }, // Maslac
      { foodId: 'u:parmezan', g: 100 }, // Parmezan
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b37', g: 100 }, // Mrkva
    ],
  },
  {
    id: 'rc-carbonara',
    name: 'Carbonara',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Tjestenina s jajima, sirom i suhomesnatim.',
    items: [
      { foodId: 'b24', g: 700 }, // Tjestenina (kuhana)
      { foodId: 'b11', g: 200 }, // Jaje (cijelo)
      { foodId: 'u:parmezan', g: 120 }, // Parmezan
      { foodId: 'b10', g: 200 }, // Šunka (pileća)
      { foodId: 'b62', g: 20 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-pasta-tuna',
    name: 'Tjestenina s tunom',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Brz ručak s tunom, rajčicom i maslinama.',
    items: [
      { foodId: 'b24', g: 700 }, // Tjestenina (kuhana)
      { foodId: 'b7', g: 300 }, // Tuna (konzerva u vodi)
      { foodId: 'off:pelati-guljene-rajčice', g: 300 }, // Pelati (guljene rajčice)
      { foodId: 'off:masline-zelene', g: 80 }, // Masline zelene
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'b62', g: 35 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-pasta-skampi',
    name: 'Tjestenina sa škampima',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Škampi, rajčica i vino.',
    drink: { foodId: 'u:vino-bijelo-sauvignon', g: 150 },
    items: [
      { foodId: 'b24', g: 700 }, // Tjestenina (kuhana)
      { foodId: 'u:škampi', g: 350 }, // Škampi
      { foodId: 'off:pelati-guljene-rajčice', g: 250 }, // Pelati (guljene rajčice)
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
      { foodId: 'u:vino-bijelo-suho', g: 120 }, // Vino bijelo (suho)
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-fuzi-gulas',
    name: 'Tjestenina s istarskim gulašom',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Fuži s gulašom od junetine.',
    items: [
      { foodId: 'b24', g: 600 }, // Tjestenina (kuhana)
      { foodId: 'u:junetina-za-gulaš', g: 500 }, // Junetina za gulaš
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'off:pelati-guljene-rajčice', g: 250 }, // Pelati (guljene rajčice)
      { foodId: 'b70', g: 120 }, // Vino crno
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
      { foodId: 'u:parmezan', g: 50 }, // Parmezan
    ],
  },
  {
    id: 'rc-sarma-klasik',
    name: 'Sarma s dimljenim mesom',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.9,
    note: 'Kiseli kupus punjen mesom i rižom.',
    items: [
      { foodId: 'b41', g: 900 }, // Kupus
      { foodId: 'b5', g: 700 }, // Mljeveno meso (miješano)
      { foodId: 'b22', g: 350 }, // Riža bijela (kuhana)
      { foodId: 'b4', g: 250 }, // Svinjetina (but)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 12 }, // Crvena mljevena paprika
      { foodId: 'u:svinjska-mast', g: 30 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-punjene-tikvice',
    name: 'Punjene tikvice',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Tikvice punjene mesom i rižom u umaku.',
    items: [
      { foodId: 'b43', g: 900 }, // Tikvica
      { foodId: 'b5', g: 400 }, // Mljeveno meso (miješano)
      { foodId: 'b22', g: 250 }, // Riža bijela (kuhana)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'off:pelati-guljene-rajčice', g: 300 }, // Pelati (guljene rajčice)
      { foodId: 'b14', g: 150 }, // Jogurt (obični)
      { foodId: 'b62', g: 25 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-punjeni-patlidzan',
    name: 'Punjeni patlidžan',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Patlidžan s mesom i sirom.',
    items: [
      { foodId: 'u:patlidžan', g: 900 }, // Patlidžan
      { foodId: 'b5', g: 400 }, // Mljeveno meso (miješano)
      { foodId: 'b38', g: 300 }, // Rajčica
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b16', g: 120 }, // Sir (gauda/edamer)
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-grah-varivo',
    name: 'Varivo od graha',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 5,
    note: 'Osnovno zimsko varivo.',
    items: [
      { foodId: 'b30', g: 700 }, // Grah (kuhani)
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b26', g: 300 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:crvena-mljevena-paprika', g: 10 }, // Crvena mljevena paprika
      { foodId: 'off:suncokretovo-ulje', g: 30 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-leca-varivo',
    name: 'Varivo od leće',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Leća s mrkvom i lovorom.',
    items: [
      { foodId: 'b31', g: 600 }, // Leća (kuhana)
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:celer-stabljika', g: 100 }, // Celer (stabljika)
      { foodId: 'u:lovorov-list', g: 1 }, // Lovorov list
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
    ],
  },
  {
    id: 'rc-grasak-varivo',
    name: 'Varivo od graška',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Grašak s mrkvom i mesnim okruglicama.',
    items: [
      { foodId: 'b33', g: 600 }, // Grašak
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
      { foodId: 'b5', g: 250 }, // Mljeveno meso (miješano)
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'off:suncokretovo-ulje', g: 25 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-mahune-varivo',
    name: 'Varivo od mahuna',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Mahune s krumpirom i vrhnjem.',
    items: [
      { foodId: 'u:mahune-kuhane', g: 700 }, // Mahune (kuhane)
      { foodId: 'b26', g: 350 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'u:vrhnje-za-šlag', g: 100 }, // Vrhnje za šlag
      { foodId: 'u:brašno-glatko-pšenično', g: 20 }, // Brašno glatko (pšenično)
      { foodId: 'u:češnjak', g: 12 }, // Češnjak
      { foodId: 'off:suncokretovo-ulje', g: 25 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-kelj-varivo',
    name: 'Varivo od kelja',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Kelj s krumpirom i suhim mesom.',
    items: [
      { foodId: 'u:kelj', g: 700 }, // Kelj
      { foodId: 'b26', g: 400 }, // Krumpir (kuhani)
      { foodId: 'b4', g: 250 }, // Svinjetina (but)
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:svinjska-mast', g: 25 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-cvjetaca-zapecena',
    name: 'Zapečena cvjetača',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Cvjetača s jajima, vrhnjem i sirom.',
    items: [
      { foodId: 'b42', g: 800 }, // Cvjetača
      { foodId: 'b11', g: 200 }, // Jaje (cijelo)
      { foodId: 'u:vrhnje-za-šlag', g: 200 }, // Vrhnje za šlag
      { foodId: 'b16', g: 120 }, // Sir (gauda/edamer)
      { foodId: 'u:krušne-mrvice', g: 40 }, // Krušne mrvice
      { foodId: 'b19', g: 30 }, // Maslac
    ],
  },
  {
    id: 'rc-punjena-paprika-klasik',
    name: 'Punjena paprika u umaku',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 5,
    yieldFactor: 0.9,
    note: 'Paprike punjene mesom i rižom.',
    items: [
      { foodId: 'b39', g: 800 }, // Paprika crvena
      { foodId: 'b5', g: 500 }, // Mljeveno meso (miješano)
      { foodId: 'b22', g: 300 }, // Riža bijela (kuhana)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'off:pelati-guljene-rajčice', g: 400 }, // Pelati (guljene rajčice)
      { foodId: 'off:suncokretovo-ulje', g: 30 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-musaka-krumpir',
    name: 'Musaka s krumpirom',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 6,
    yieldFactor: 0.85,
    note: 'Slojevi krumpira i mesa, preliveni jajima.',
    items: [
      { foodId: 'b26', g: 1100 }, // Krumpir (kuhani)
      { foodId: 'b5', g: 550 }, // Mljeveno meso (miješano)
      { foodId: 'b11', g: 200 }, // Jaje (cijelo)
      { foodId: 'b13', g: 300 }, // Mlijeko 2.8%
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'off:suncokretovo-ulje', g: 35 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-pileca-juha-rezanci',
    name: 'Pileća juha s rezancima',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 5,
    note: 'Bistra juha s mrkvom i tjesteninom.',
    items: [
      { foodId: 'b1', g: 600 }, // Pileći batak
      { foodId: 'b37', g: 250 }, // Mrkva
      { foodId: 'u:celer-korijen', g: 100 }, // Celer korijen
      { foodId: 'u:pastrnjak', g: 100 }, // Pastrnjak
      { foodId: 'b44', g: 100 }, // Luk
      { foodId: 'b24', g: 250 }, // Tjestenina (kuhana)
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-govedska-juha',
    name: 'Goveđa juha',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 5,
    note: 'Bistra juha s korjenastim povrćem.',
    items: [
      { foodId: 'u:junetina-za-gulaš', g: 600 }, // Junetina za gulaš
      { foodId: 'b37', g: 250 }, // Mrkva
      { foodId: 'u:celer-korijen', g: 120 }, // Celer korijen
      { foodId: 'u:pastrnjak', g: 100 }, // Pastrnjak
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'off:griz-pšenična-krupica', g: 80 }, // Griz (pšenična krupica)
      { foodId: 'b11', g: 50 }, // Jaje (cijelo)
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-juha-rajcica',
    name: 'Juha od rajčice',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Kremasta juha s rižom i vrhnjem.',
    items: [
      { foodId: 'off:pelati-guljene-rajčice', g: 700 }, // Pelati (guljene rajčice)
      { foodId: 'b22', g: 200 }, // Riža bijela (kuhana)
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'u:vrhnje-za-šlag', g: 120 }, // Vrhnje za šlag
      { foodId: 'b62', g: 25 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 10 }, // Češnjak
    ],
  },
  {
    id: 'rc-juha-bundeva',
    name: 'Juha od bundeve',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Kremasta juha s đumbirom i sjemenkama.',
    items: [
      { foodId: 'u:bundeva', g: 900 }, // Bundeva
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'u:vrhnje-za-šlag', g: 120 }, // Vrhnje za šlag
      { foodId: 'u:đumbir', g: 10 }, // Đumbir
      { foodId: 'b60', g: 40 }, // Sjemenke bundeve
      { foodId: 'b62', g: 25 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-juha-gljive',
    name: 'Juha od gljiva',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Šampinjoni i bukovače s vrhnjem.',
    items: [
      { foodId: 'u:šampinjoni', g: 500 }, // Šampinjoni
      { foodId: 'u:bukovače', g: 200 }, // Bukovače
      { foodId: 'b26', g: 250 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'u:vrhnje-za-šlag', g: 150 }, // Vrhnje za šlag
      { foodId: 'b19', g: 30 }, // Maslac
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-riblja-juha',
    name: 'Riblja juha',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Bijela riba s rižom i povrćem.',
    items: [
      { foodId: 'u:oslić', g: 500 }, // Oslić
      { foodId: 'b22', g: 200 }, // Riža bijela (kuhana)
      { foodId: 'b37', g: 150 }, // Mrkva
      { foodId: 'u:celer-korijen', g: 80 }, // Celer korijen
      { foodId: 'b44', g: 100 }, // Luk
      { foodId: 'b62', g: 25 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-bakalar-bijeli',
    name: 'Bakalar na bijelo',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 5,
    yieldFactor: 0.85,
    note: 'Badnjačko jelo s krumpirom i češnjakom.',
    drink: { foodId: 'u:vino-bijelo-suho', g: 150 },
    items: [
      { foodId: 'u:bakalar-suhi', g: 400 }, // Bakalar (suhi)
      { foodId: 'b26', g: 700 }, // Krumpir (kuhani)
      { foodId: 'u:češnjak', g: 30 }, // Češnjak
      { foodId: 'b62', g: 100 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 20 }, // Peršin
    ],
  },
  {
    id: 'rc-srdele-gradele',
    name: 'Srdele na gradele',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Pečene srdele s uljem i češnjakom.',
    drink: { foodId: 'u:vino-bijelo-suho', g: 150 },
    items: [
      { foodId: 'b9', g: 700 }, // Srdele
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:peršin', g: 15 }, // Peršin
      { foodId: 'u:limun', g: 60 }, // Limun
    ],
  },
  {
    id: 'rc-lignje-punjene',
    name: 'Punjene lignje',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Lignje punjene mrvicama i pršutom.',
    drink: { foodId: 'u:vino-bijelo-chardonnay', g: 150 },
    items: [
      { foodId: 'u:lignje', g: 700 }, // Lignje
      { foodId: 'u:krušne-mrvice', g: 100 }, // Krušne mrvice
      { foodId: 'b10', g: 120 }, // Šunka (pileća)
      { foodId: 'u:parmezan', g: 60 }, // Parmezan
      { foodId: 'b11', g: 50 }, // Jaje (cijelo)
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 20 }, // Peršin
    ],
  },
  {
    id: 'rc-tuna-salata',
    name: 'Salata s tunom i grahom',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 3,
    note: 'Hladno predjelo ili lagan ručak.',
    items: [
      { foodId: 'b7', g: 250 }, // Tuna (konzerva u vodi)
      { foodId: 'u:bijeli-grah-kuhani', g: 350 }, // Bijeli grah (kuhani)
      { foodId: 'b44', g: 80 }, // Luk
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
      { foodId: 'u:ocat-jabučni', g: 15 }, // Ocat (jabučni)
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-hobotnica-salata',
    name: 'Salata od hobotnice',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Hobotnica s krumpirom i uljem.',
    items: [
      { foodId: 'u:hobotnica', g: 500 }, // Hobotnica
      { foodId: 'b26', g: 400 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 100 }, // Luk
      { foodId: 'u:peršin', g: 20 }, // Peršin
      { foodId: 'b62', g: 45 }, // Maslinovo ulje
      { foodId: 'u:ocat-jabučni', g: 20 }, // Ocat (jabučni)
      { foodId: 'u:češnjak', g: 10 }, // Češnjak
    ],
  },
  {
    id: 'rc-francuska-salata',
    name: 'Francuska salata',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 6,
    note: 'Kuhano povrće s majonezom; blagdanski prilog.',
    items: [
      { foodId: 'b26', g: 500 }, // Krumpir (kuhani)
      { foodId: 'b37', g: 300 }, // Mrkva
      { foodId: 'b33', g: 250 }, // Grašak
      { foodId: 'b40', g: 150 }, // Krastavac
      { foodId: 'u:jaje-kuhano', g: 150 }, // Jaje (kuhano)
      { foodId: 'u:vrhnje-za-šlag', g: 150 }, // Vrhnje za šlag
    ],
  },
  {
    id: 'rc-sopska-salata',
    name: 'Šopska salata',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Rajčica, krastavac i sir.',
    items: [
      { foodId: 'b38', g: 500 }, // Rajčica
      { foodId: 'b40', g: 300 }, // Krastavac
      { foodId: 'u:paprika-zelena', g: 200 }, // Paprika zelena
      { foodId: 'b18', g: 150 }, // Feta sir
      { foodId: 'b44', g: 80 }, // Luk
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-salata-cikla',
    name: 'Salata od cikle',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Zimski prilog uz pečenje.',
    items: [
      { foodId: 'u:cikla', g: 600 }, // Cikla
      { foodId: 'u:hren', g: 30 }, // Hren
      { foodId: 'u:ocat-jabučni', g: 25 }, // Ocat (jabučni)
      { foodId: 'off:suncokretovo-ulje', g: 25 }, // Suncokretovo ulje
      { foodId: 'u:češnjak', g: 8 }, // Češnjak
    ],
  },
  {
    id: 'rc-salata-krastavac',
    name: 'Salata od krastavaca s vrhnjem',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Ljetni prilog.',
    items: [
      { foodId: 'b40', g: 700 }, // Krastavac
      { foodId: 'u:vrhnje-za-šlag', g: 150 }, // Vrhnje za šlag
      { foodId: 'u:češnjak', g: 10 }, // Češnjak
      { foodId: 'u:ocat-jabučni', g: 15 }, // Ocat (jabučni)
    ],
  },
  {
    id: 'rc-salata-kupus',
    name: 'Salata od kiselog kupusa',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Zimska salata s uljem i paprikom.',
    items: [
      { foodId: 'b41', g: 600 }, // Kupus
      { foodId: 'b44', g: 100 }, // Luk
      { foodId: 'off:suncokretovo-ulje', g: 35 }, // Suncokretovo ulje
      { foodId: 'u:crvena-mljevena-paprika', g: 5 }, // Crvena mljevena paprika
    ],
  },
  {
    id: 'rc-ajvar-domaci',
    name: 'Ajvar',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 10,
    yieldFactor: 0.55,
    note: 'Pečena paprika i patlidžan, dugo kuhani.',
    items: [
      { foodId: 'b39', g: 2000 }, // Paprika crvena
      { foodId: 'u:patlidžan', g: 500 }, // Patlidžan
      { foodId: 'u:češnjak', g: 30 }, // Češnjak
      { foodId: 'off:suncokretovo-ulje', g: 200 }, // Suncokretovo ulje
      { foodId: 'u:ocat-jabučni', g: 40 }, // Ocat (jabučni)
    ],
  },
  {
    id: 'rc-lecso-namaz',
    name: 'Namaz od pečene paprike',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 8,
    yieldFactor: 0.7,
    note: 'Blaži namaz od pečene paprike i sira.',
    items: [
      { foodId: 'b39', g: 1000 }, // Paprika crvena
      { foodId: 'b17', g: 300 }, // Svježi sir (posni)
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'b62', g: 60 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-humus-domaci',
    name: 'Humus',
    cat: 'Mahunarke',
    cuisine: 'regionalna',
    servings: 6,
    note: 'Slanutak s tahinijem i limunom.',
    items: [
      { foodId: 'b32', g: 500 }, // Slanutak (kuhani)
      { foodId: 'u:tahini', g: 80 }, // Tahini
      { foodId: 'u:limun', g: 60 }, // Limun
      { foodId: 'u:češnjak', g: 12 }, // Češnjak
      { foodId: 'b62', g: 50 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-punjena-rajcica',
    name: 'Punjene rajčice',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Rajčice punjene rižom i sirom.',
    items: [
      { foodId: 'b38', g: 900 }, // Rajčica
      { foodId: 'b22', g: 300 }, // Riža bijela (kuhana)
      { foodId: 'b18', g: 150 }, // Feta sir
      { foodId: 'b44', g: 100 }, // Luk
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-sataras',
    name: 'Sataraš',
    cat: 'Povrće',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Paprika, rajčica i luk s jajima.',
    items: [
      { foodId: 'b39', g: 500 }, // Paprika crvena
      { foodId: 'b38', g: 400 }, // Rajčica
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'b11', g: 200 }, // Jaje (cijelo)
      { foodId: 'off:suncokretovo-ulje', g: 30 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-grah-salata-luk',
    name: 'Grah salata',
    cat: 'Mahunarke',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Kuhani grah s lukom i uljem.',
    items: [
      { foodId: 'b30', g: 600 }, // Grah (kuhani)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:ocat-jabučni', g: 20 }, // Ocat (jabučni)
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-palenta-sir',
    name: 'Palenta sa sirom',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Palenta s dimljenim sirom i vrhnjem.',
    items: [
      { foodId: 'b27', g: 800 }, // Palenta (kukuruzna krupica)
      { foodId: 'off:dimljeni-sir', g: 150 }, // Dimljeni sir
      { foodId: 'u:vrhnje-za-šlag', g: 150 }, // Vrhnje za šlag
      { foodId: 'b19', g: 40 }, // Maslac
    ],
  },
  {
    id: 'rc-zganci',
    name: 'Žganci s čvarcima',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Kukuruzni žganci sa svinjskom masti.',
    items: [
      { foodId: 'b27', g: 700 }, // Palenta (kukuruzna krupica)
      { foodId: 'u:svinjska-mast', g: 60 }, // Svinjska mast
      { foodId: 'off:kobasica', g: 150 }, // Kobasica
    ],
  },
  {
    id: 'rc-krumpir-pecen',
    name: 'Pečeni krumpir s ružmarinom',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Prilog uz meso i ribu.',
    items: [
      { foodId: 'b26', g: 900 }, // Krumpir (kuhani)
      { foodId: 'b62', g: 45 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:origano-suhi', g: 3 }, // Origano (suhi)
    ],
  },
  {
    id: 'rc-krumpir-salata',
    name: 'Krumpir salata',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Topla salata s lukom i uljem.',
    items: [
      { foodId: 'b26', g: 800 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'off:suncokretovo-ulje', g: 40 }, // Suncokretovo ulje
      { foodId: 'u:ocat-jabučni', g: 25 }, // Ocat (jabučni)
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-omlet-sir-sunka',
    name: 'Omlet sa sirom i šunkom',
    cat: 'Mliječno i jaja',
    cuisine: 'regionalna',
    servings: 2,
    yieldFactor: 0.9,
    note: 'Brz doručak.',
    items: [
      { foodId: 'b11', g: 250 }, // Jaje (cijelo)
      { foodId: 'b16', g: 60 }, // Sir (gauda/edamer)
      { foodId: 'b10', g: 80 }, // Šunka (pileća)
      { foodId: 'b19', g: 20 }, // Maslac
    ],
  },
  {
    id: 'rc-kajgana-rajcica',
    name: 'Kajgana s rajčicom',
    cat: 'Mliječno i jaja',
    cuisine: 'hrvatska',
    servings: 2,
    yieldFactor: 0.9,
    note: 'Jaja s rajčicom i lukom.',
    items: [
      { foodId: 'b11', g: 250 }, // Jaje (cijelo)
      { foodId: 'b38', g: 250 }, // Rajčica
      { foodId: 'b44', g: 80 }, // Luk
      { foodId: 'b62', g: 20 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-palacinke',
    name: 'Palačinke',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 5,
    yieldFactor: 0.9,
    note: 'Tanke palačinke; nadjev po želji.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 250 }, // Brašno glatko (pšenično)
      { foodId: 'b13', g: 500 }, // Mlijeko 2.8%
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'off:suncokretovo-ulje', g: 40 }, // Suncokretovo ulje
      { foodId: 'u:šećer-bijeli', g: 30 }, // Šećer (bijeli)
    ],
  },
  {
    id: 'rc-palacinke-orasi',
    name: 'Palačinke s orasima',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 5,
    yieldFactor: 0.9,
    note: 'Palačinke s nadjevom od oraha.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 250 }, // Brašno glatko (pšenično)
      { foodId: 'b13', g: 500 }, // Mlijeko 2.8%
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'b57', g: 200 }, // Orasi
      { foodId: 'u:šećer-bijeli', g: 100 }, // Šećer (bijeli)
      { foodId: 'off:suncokretovo-ulje', g: 40 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-fritule',
    name: 'Fritule',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 8,
    yieldFactor: 0.9,
    note: 'Male pržene krafnice s grožđicama.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 500 }, // Brašno glatko (pšenično)
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'u:grožđice', g: 120 }, // Grožđice
      { foodId: 'u:šećer-bijeli', g: 100 }, // Šećer (bijeli)
      { foodId: 'u:kvasac-suhi', g: 10 }, // Kvasac (suhi)
      { foodId: 'off:suncokretovo-ulje', g: 150 }, // Suncokretovo ulje
      { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
    ],
  },
  {
    id: 'rc-strudla-jabuka',
    name: 'Savijača s jabukama',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 8,
    yieldFactor: 0.85,
    note: 'Vučeno tijesto s jabukama i cimetom.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 400 }, // Brašno glatko (pšenično)
      { foodId: 'b47', g: 900 }, // Jabuka
      { foodId: 'u:šećer-bijeli', g: 120 }, // Šećer (bijeli)
      { foodId: 'u:cimet', g: 5 }, // Cimet
      { foodId: 'u:krušne-mrvice', g: 60 }, // Krušne mrvice
      { foodId: 'b19', g: 80 }, // Maslac
      { foodId: 'u:grožđice', g: 80 }, // Grožđice
    ],
  },
  {
    id: 'rc-strudla-sir',
    name: 'Savijača sa sirom',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 8,
    yieldFactor: 0.85,
    note: 'Savijača sa svježim sirom.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 400 }, // Brašno glatko (pšenično)
      { foodId: 'b17', g: 700 }, // Svježi sir (posni)
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'u:šećer-bijeli', g: 100 }, // Šećer (bijeli)
      { foodId: 'u:vrhnje-za-šlag', g: 150 }, // Vrhnje za šlag
      { foodId: 'b19', g: 60 }, // Maslac
    ],
  },
  {
    id: 'rc-knedle-sljive',
    name: 'Knedle sa šljivama',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.95,
    note: 'Krumpirovo tijesto sa šljivama.',
    items: [
      { foodId: 'b26', g: 700 }, // Krumpir (kuhani)
      { foodId: 'u:brašno-glatko-pšenično', g: 250 }, // Brašno glatko (pšenično)
      { foodId: 'b11', g: 50 }, // Jaje (cijelo)
      { foodId: 'u:šljiva', g: 600 }, // Šljiva
      { foodId: 'u:krušne-mrvice', g: 100 }, // Krušne mrvice
      { foodId: 'b19', g: 60 }, // Maslac
      { foodId: 'u:šećer-bijeli', g: 60 }, // Šećer (bijeli)
    ],
  },
  {
    id: 'rc-orehnjaca',
    name: 'Orehnjača',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 12,
    yieldFactor: 0.9,
    note: 'Dizano tijesto s nadjevom od oraha.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 600 }, // Brašno glatko (pšenično)
      { foodId: 'b57', g: 400 }, // Orasi
      { foodId: 'u:šećer-bijeli', g: 250 }, // Šećer (bijeli)
      { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
      { foodId: 'b19', g: 120 }, // Maslac
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'u:kvasac-suhi', g: 12 }, // Kvasac (suhi)
    ],
  },
  {
    id: 'rc-makovnjaca',
    name: 'Makovnjača',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 12,
    yieldFactor: 0.9,
    note: 'Dizano tijesto s nadjevom; mak zamijenjen sezamom.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 600 }, // Brašno glatko (pšenično)
      { foodId: 'u:sezam', g: 300 }, // Sezam
      { foodId: 'u:šećer-bijeli', g: 250 }, // Šećer (bijeli)
      { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
      { foodId: 'b19', g: 120 }, // Maslac
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'u:kvasac-suhi', g: 12 }, // Kvasac (suhi)
    ],
  },
  {
    id: 'rc-rozata',
    name: 'Rožata',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 6,
    note: 'Dubrovački karamel kremasti desert.',
    items: [
      { foodId: 'u:mlijeko-punomasno-3-2', g: 700 }, // Mlijeko punomasno 3,2 %
      { foodId: 'b11', g: 300 }, // Jaje (cijelo)
      { foodId: 'u:šećer-bijeli', g: 180 }, // Šećer (bijeli)
    ],
  },
  {
    id: 'rc-krempita',
    name: 'Kremšnita',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 10,
    note: 'Lisnato tijesto s kremom od jaja i mlijeka.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 300 }, // Brašno glatko (pšenično)
      { foodId: 'u:mlijeko-punomasno-3-2', g: 900 }, // Mlijeko punomasno 3,2 %
      { foodId: 'b11', g: 300 }, // Jaje (cijelo)
      { foodId: 'u:šećer-bijeli', g: 250 }, // Šećer (bijeli)
      { foodId: 'b19', g: 150 }, // Maslac
      { foodId: 'u:vrhnje-za-šlag', g: 250 }, // Vrhnje za šlag
    ],
  },
  {
    id: 'rc-tufahije',
    name: 'Tufahije',
    cat: 'Ostalo',
    cuisine: 'regionalna',
    servings: 6,
    note: 'Kuhane jabuke punjene orasima.',
    items: [
      { foodId: 'b47', g: 900 }, // Jabuka
      { foodId: 'b57', g: 250 }, // Orasi
      { foodId: 'u:šećer-bijeli', g: 200 }, // Šećer (bijeli)
      { foodId: 'u:vrhnje-za-šlag', g: 150 }, // Vrhnje za šlag
    ],
  },
  {
    id: 'rc-kolac-jabuke',
    name: 'Kolač s jabukama',
    cat: 'Ostalo',
    cuisine: 'hrvatska',
    servings: 10,
    yieldFactor: 0.9,
    note: 'Mrvičasti kolač s jabukama i cimetom.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 450 }, // Brašno glatko (pšenično)
      { foodId: 'b47', g: 900 }, // Jabuka
      { foodId: 'u:šećer-bijeli', g: 200 }, // Šećer (bijeli)
      { foodId: 'b19', g: 200 }, // Maslac
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'u:cimet', g: 5 }, // Cimet
    ],
  },
  {
    id: 'rc-cokoladni-kolac',
    name: 'Čokoladni kolač',
    cat: 'Ostalo',
    cuisine: 'regionalna',
    servings: 10,
    yieldFactor: 0.9,
    note: 'Vlažni kolač s kakaom.',
    items: [
      { foodId: 'u:brašno-glatko-pšenično', g: 300 }, // Brašno glatko (pšenično)
      { foodId: 'u:kakao-prah-nezaslađen', g: 80 }, // Kakao prah (nezaslađen)
      { foodId: 'u:šećer-bijeli', g: 250 }, // Šećer (bijeli)
      { foodId: 'b11', g: 200 }, // Jaje (cijelo)
      { foodId: 'b19', g: 180 }, // Maslac
      { foodId: 'b13', g: 200 }, // Mlijeko 2.8%
    ],
  },
  {
    id: 'rc-pileca-krilca-pecena',
    name: 'Pečena pileća krilca',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Krilca s medom i paprikom.',
    drink: { foodId: 'b68', g: 500 },
    items: [
      { foodId: 'u:pileća-krilca', g: 900 }, // Pileća krilca
      { foodId: 'b63', g: 60 }, // Med
      { foodId: 'u:crvena-mljevena-paprika', g: 10 }, // Crvena mljevena paprika
      { foodId: 'u:umak-od-soje', g: 40 }, // Umak od soje
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'off:suncokretovo-ulje', g: 30 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-jetrica',
    name: 'Pileća jetrica na lukovima',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Jetrica pirjana s lukom.',
    items: [
      { foodId: 'u:pileća-jetra', g: 700 }, // Pileća jetra
      { foodId: 'b44', g: 350 }, // Luk
      { foodId: 'u:crvena-mljevena-paprika', g: 10 }, // Crvena mljevena paprika
      { foodId: 'u:svinjska-mast', g: 35 }, // Svinjska mast
      { foodId: 'b70', g: 100 }, // Vino crno
    ],
  },
  {
    id: 'rc-patka-mlinci',
    name: 'Pečena patka s tjesteninom',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 5,
    yieldFactor: 0.75,
    note: 'Pačja prsa s tjesteninom.',
    drink: { foodId: 'b70', g: 150 },
    items: [
      { foodId: 'u:pačja-prsa', g: 900 }, // Pačja prsa
      { foodId: 'b24', g: 600 }, // Tjestenina (kuhana)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:svinjska-mast', g: 30 }, // Svinjska mast
    ],
  },
  {
    id: 'rc-punjena-piletina',
    name: 'Punjena piletina',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Pileća prsa punjena sirom i špinatom.',
    items: [
      { foodId: 'b0', g: 700 }, // Pileća prsa (pečena)
      { foodId: 'b36', g: 250 }, // Špinat
      { foodId: 'b16', g: 120 }, // Sir (gauda/edamer)
      { foodId: 'u:češnjak', g: 12 }, // Češnjak
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-piletina-povrce-wok',
    name: 'Piletina s povrćem',
    cat: 'Meso i riba',
    cuisine: 'ostalo',
    servings: 4,
    note: 'Brzo pirjana piletina s povrćem i sojom.',
    items: [
      { foodId: 'b0', g: 500 }, // Pileća prsa (pečena)
      { foodId: 'b39', g: 250 }, // Paprika crvena
      { foodId: 'b37', g: 200 }, // Mrkva
      { foodId: 'u:mahune-kuhane', g: 200 }, // Mahune (kuhane)
      { foodId: 'u:umak-od-soje', g: 40 }, // Umak od soje
      { foodId: 'u:đumbir', g: 15 }, // Đumbir
      { foodId: 'u:repičino-ulje', g: 30 }, // Repičino ulje
      { foodId: 'b22', g: 500 }, // Riža bijela (kuhana)
    ],
  },
  {
    id: 'rc-cufte-umak',
    name: 'Ćufte u umaku od rajčice',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.85,
    note: 'Mesne okruglice u umaku.',
    items: [
      { foodId: 'b5', g: 700 }, // Mljeveno meso (miješano)
      { foodId: 'b22', g: 200 }, // Riža bijela (kuhana)
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'off:pelati-guljene-rajčice', g: 500 }, // Pelati (guljene rajčice)
      { foodId: 'u:krušne-mrvice', g: 60 }, // Krušne mrvice
      { foodId: 'off:suncokretovo-ulje', g: 35 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-pljeskavica',
    name: 'Pljeskavica',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.8,
    note: 'Mljeveno meso s lukom, na žaru.',
    drink: { foodId: 'b68', g: 500 },
    items: [
      { foodId: 'b5', g: 800 }, // Mljeveno meso (miješano)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:češnjak', g: 12 }, // Češnjak
      { foodId: 'u:somun-pita-kruh', g: 320 }, // Somun / pita kruh
    ],
  },
  {
    id: 'rc-rostilj-mix',
    name: 'Miješano meso s roštilja',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.8,
    note: 'Ćevapi, kotlet i kobasica.',
    drink: { foodId: 'b68', g: 500 },
    items: [
      { foodId: 'b5', g: 400 }, // Mljeveno meso (miješano)
      { foodId: 'u:svinjski-kotlet', g: 400 }, // Svinjski kotlet
      { foodId: 'off:kobasica', g: 250 }, // Kobasica
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b20', g: 200 }, // Kruh bijeli
    ],
  },
  {
    id: 'rc-teleci-medaljoni',
    name: 'Teleći medaljoni u umaku od gljiva',
    cat: 'Meso i riba',
    cuisine: 'regionalna',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Teletina s vrhnjem i šampinjonima.',
    drink: { foodId: 'b70', g: 150 },
    items: [
      { foodId: 'u:teletina', g: 700 }, // Teletina
      { foodId: 'u:šampinjoni', g: 350 }, // Šampinjoni
      { foodId: 'u:vrhnje-za-šlag', g: 200 }, // Vrhnje za šlag
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'b19', g: 40 }, // Maslac
      { foodId: 'u:vino-bijelo-suho', g: 100 }, // Vino bijelo (suho)
    ],
  },
  {
    id: 'rc-svinjetina-pecena',
    name: 'Svinjsko pečenje',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 6,
    yieldFactor: 0.75,
    note: 'But pečen s krumpirom.',
    drink: { foodId: 'b70', g: 150 },
    items: [
      { foodId: 'b4', g: 1300 }, // Svinjetina (but)
      { foodId: 'b26', g: 900 }, // Krumpir (kuhani)
      { foodId: 'b44', g: 200 }, // Luk
      { foodId: 'u:češnjak', g: 20 }, // Češnjak
      { foodId: 'u:svinjska-mast', g: 40 }, // Svinjska mast
      { foodId: 'u:origano-suhi', g: 4 }, // Origano (suhi)
    ],
  },
  {
    id: 'rc-riba-pecena-povrce',
    name: 'Riba pečena s povrćem',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Oslić s tikvicom i rajčicom.',
    drink: { foodId: 'u:vino-bijelo-rizling', g: 150 },
    items: [
      { foodId: 'u:oslić', g: 700 }, // Oslić
      { foodId: 'b43', g: 300 }, // Tikvica
      { foodId: 'b38', g: 300 }, // Rajčica
      { foodId: 'b26', g: 400 }, // Krumpir (kuhani)
      { foodId: 'b62', g: 45 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-pastrva-pecena',
    name: 'Pečena pastrva',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Pastrva s limunom i peršinom.',
    drink: { foodId: 'u:vino-bijelo-suho', g: 150 },
    items: [
      { foodId: 'u:pastrva', g: 800 }, // Pastrva
      { foodId: 'u:limun', g: 80 }, // Limun
      { foodId: 'u:peršin', g: 20 }, // Peršin
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
    ],
  },
  {
    id: 'rc-tofu-povrce',
    name: 'Tofu s povrćem',
    cat: 'Mahunarke',
    cuisine: 'ostalo',
    servings: 3,
    note: 'Biljni obrok s tofuom i rižom.',
    items: [
      { foodId: 'b34', g: 400 }, // Tofu
      { foodId: 'b35', g: 250 }, // Brokula
      { foodId: 'b37', g: 150 }, // Mrkva
      { foodId: 'b39', g: 150 }, // Paprika crvena
      { foodId: 'u:umak-od-soje', g: 35 }, // Umak od soje
      { foodId: 'b23', g: 400 }, // Riža smeđa (kuhana)
      { foodId: 'u:repičino-ulje', g: 25 }, // Repičino ulje
      { foodId: 'u:đumbir', g: 10 }, // Đumbir
    ],
  },
  {
    id: 'rc-slanutak-curry',
    name: 'Slanutak u umaku',
    cat: 'Mahunarke',
    cuisine: 'ostalo',
    servings: 4,
    note: 'Slanutak s rajčicom i začinima.',
    items: [
      { foodId: 'b32', g: 600 }, // Slanutak (kuhani)
      { foodId: 'off:pelati-guljene-rajčice', g: 400 }, // Pelati (guljene rajčice)
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:đumbir', g: 12 }, // Đumbir
      { foodId: 'b62', g: 30 }, // Maslinovo ulje
      { foodId: 'b22', g: 400 }, // Riža bijela (kuhana)
    ],
  },
  {
    id: 'rc-punjeni-krumpir',
    name: 'Punjeni krumpir',
    cat: 'Žitarice i kruh',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Pečeni krumpir sa sirom i vrhnjem.',
    items: [
      { foodId: 'b26', g: 1000 }, // Krumpir (kuhani)
      { foodId: 'b16', g: 150 }, // Sir (gauda/edamer)
      { foodId: 'u:vrhnje-za-šlag', g: 150 }, // Vrhnje za šlag
      { foodId: 'b10', g: 150 }, // Šunka (pileća)
      { foodId: 'u:mladi-luk', g: 60 }, // Mladi luk
    ],
  },
  {
    id: 'rc-tikvice-pohane',
    name: 'Pohane tikvice',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Tikvice u pohanju, uz umak od češnjaka.',
    items: [
      { foodId: 'b43', g: 800 }, // Tikvica
      { foodId: 'u:brašno-glatko-pšenično', g: 100 }, // Brašno glatko (pšenično)
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'u:krušne-mrvice', g: 120 }, // Krušne mrvice
      { foodId: 'off:suncokretovo-ulje', g: 100 }, // Suncokretovo ulje
      { foodId: 'b14', g: 200 }, // Jogurt (obični)
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
    ],
  },
  {
    id: 'rc-gljive-pohane',
    name: 'Pohane gljive',
    cat: 'Povrće',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.85,
    note: 'Šampinjoni u pohanju.',
    items: [
      { foodId: 'u:šampinjoni', g: 700 }, // Šampinjoni
      { foodId: 'u:brašno-glatko-pšenično', g: 90 }, // Brašno glatko (pšenično)
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'u:krušne-mrvice', g: 110 }, // Krušne mrvice
      { foodId: 'off:suncokretovo-ulje', g: 100 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-sir-pohani',
    name: 'Pohani sir',
    cat: 'Mliječno i jaja',
    cuisine: 'hrvatska',
    servings: 4,
    yieldFactor: 0.9,
    note: 'Trapist u pohanju, uz tartar.',
    items: [
      { foodId: 'u:trapist', g: 500 }, // Trapist
      { foodId: 'u:brašno-glatko-pšenično', g: 80 }, // Brašno glatko (pšenično)
      { foodId: 'b11', g: 100 }, // Jaje (cijelo)
      { foodId: 'u:krušne-mrvice', g: 120 }, // Krušne mrvice
      { foodId: 'off:suncokretovo-ulje', g: 90 }, // Suncokretovo ulje
    ],
  },
  {
    id: 'rc-zapecena-tjestenina-sunka',
    name: 'Zapečena tjestenina sa šunkom',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 5,
    yieldFactor: 0.9,
    note: 'Tjestenina s jajima, sirom i šunkom.',
    items: [
      { foodId: 'b24', g: 700 }, // Tjestenina (kuhana)
      { foodId: 'b10', g: 250 }, // Šunka (pileća)
      { foodId: 'b16', g: 180 }, // Sir (gauda/edamer)
      { foodId: 'b11', g: 150 }, // Jaje (cijelo)
      { foodId: 'b13', g: 250 }, // Mlijeko 2.8%
      { foodId: 'b19', g: 30 }, // Maslac
    ],
  },
  {
    id: 'rc-rizot-morski',
    name: 'Rižot s plodovima mora',
    cat: 'Meso i riba',
    cuisine: 'hrvatska',
    servings: 4,
    note: 'Škampi, dagnje i lignje s rižom.',
    drink: { foodId: 'u:vino-bijelo-sauvignon', g: 150 },
    items: [
      { foodId: 'b22', g: 650 }, // Riža bijela (kuhana)
      { foodId: 'u:škampi', g: 250 }, // Škampi
      { foodId: 'u:dagnje', g: 250 }, // Dagnje
      { foodId: 'u:lignje', g: 250 }, // Lignje
      { foodId: 'b44', g: 120 }, // Luk
      { foodId: 'u:češnjak', g: 15 }, // Češnjak
      { foodId: 'u:vino-bijelo-suho', g: 120 }, // Vino bijelo (suho)
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-kus-kus-povrce',
    name: 'Kus-kus s povrćem',
    cat: 'Žitarice i kruh',
    cuisine: 'ostalo',
    servings: 4,
    note: 'Lagan obrok s pečenim povrćem.',
    items: [
      { foodId: 'u:kus-kus-kuhani', g: 600 }, // Kus-kus (kuhani)
      { foodId: 'b43', g: 250 }, // Tikvica
      { foodId: 'b39', g: 200 }, // Paprika crvena
      { foodId: 'u:patlidžan', g: 200 }, // Patlidžan
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
      { foodId: 'u:limun', g: 40 }, // Limun
      { foodId: 'u:peršin', g: 20 }, // Peršin
    ],
  },
  {
    id: 'rc-bulgur-salata',
    name: 'Salata od bulgura',
    cat: 'Žitarice i kruh',
    cuisine: 'ostalo',
    servings: 4,
    note: 'Bulgur s rajčicom, peršinom i limunom.',
    items: [
      { foodId: 'u:bulgur-kuhani', g: 500 }, // Bulgur (kuhani)
      { foodId: 'b38', g: 300 }, // Rajčica
      { foodId: 'u:peršin', g: 60 }, // Peršin
      { foodId: 'u:mladi-luk', g: 80 }, // Mladi luk
      { foodId: 'u:limun', g: 60 }, // Limun
      { foodId: 'b62', g: 40 }, // Maslinovo ulje
    ],
  },
  {
    id: 'rc-kvinoja-salata',
    name: 'Salata od kvinoje',
    cat: 'Žitarice i kruh',
    cuisine: 'ostalo',
    servings: 4,
    note: 'Kvinoja s povrćem i fetom.',
    items: [
      { foodId: 'b29', g: 500 }, // Kvinoja (kuhana)
      { foodId: 'b40', g: 200 }, // Krastavac
      { foodId: 'b38', g: 250 }, // Rajčica
      { foodId: 'b18', g: 120 }, // Feta sir
      { foodId: 'off:masline-zelene', g: 60 }, // Masline zelene
      { foodId: 'b62', g: 35 }, // Maslinovo ulje
      { foodId: 'u:limun', g: 40 }, // Limun
    ],
  },
  {
    id: 'rc-heljda-gljive',
    name: 'Heljda s gljivama',
    cat: 'Žitarice i kruh',
    cuisine: 'regionalna',
    servings: 4,
    note: 'Heljda pirjana sa šampinjonima i lukom.',
    items: [
      { foodId: 'b28', g: 600 }, // Heljda (kuhana)
      { foodId: 'u:šampinjoni', g: 300 }, // Šampinjoni
      { foodId: 'b44', g: 150 }, // Luk
      { foodId: 'b19', g: 40 }, // Maslac
      { foodId: 'u:peršin', g: 15 }, // Peršin
    ],
  },
  {
    id: 'rc-zobena-kasa',
    name: 'Zobena kaša s voćem',
    cat: 'Žitarice i kruh',
    cuisine: 'ostalo',
    servings: 2,
    note: 'Doručak sa zobi, mlijekom i voćem.',
    items: [
      { foodId: 'b25', g: 120 }, // Zobene pahuljice
      { foodId: 'b13', g: 400 }, // Mlijeko 2.8%
      { foodId: 'b48', g: 150 }, // Banana
      { foodId: 'b51', g: 100 }, // Borovnice
      { foodId: 'b63', g: 30 }, // Med
      { foodId: 'b57', g: 30 }, // Orasi
    ],
  },
  {
    id: 'rc-jogurt-granola',
    name: 'Jogurt s muslijem i voćem',
    cat: 'Mliječno i jaja',
    cuisine: 'ostalo',
    servings: 2,
    note: 'Brz doručak.',
    items: [
      { foodId: 'b15', g: 400 }, // Grčki jogurt
      { foodId: 'off:musli', g: 120 }, // Musli
      { foodId: 'b50', g: 150 }, // Jagode
      { foodId: 'b63', g: 30 }, // Med
      { foodId: 'u:sjemenke-lana', g: 20 }, // Sjemenke lana
    ],
  },
  {
    id: 'rc-smoothie-zeleni',
    name: 'Zeleni smoothie',
    cat: 'Pića',
    cuisine: 'ostalo',
    servings: 2,
    note: 'Špinat, banana i jabuka.',
    items: [
      { foodId: 'b36', g: 100 }, // Špinat
      { foodId: 'b48', g: 200 }, // Banana
      { foodId: 'b47', g: 200 }, // Jabuka
      { foodId: 'u:zobeno-mlijeko', g: 300 }, // Zobeno mlijeko
      { foodId: 'b61', g: 15 }, // Chia sjemenke
    ],
  },
  {
    id: 'rc-namaz-tuna',
    name: 'Namaz od tune',
    cat: 'Meso i riba',
    cuisine: 'ostalo',
    servings: 4,
    note: 'Tuna sa svježim sirom i lukom.',
    items: [
      { foodId: 'b7', g: 300 }, // Tuna (konzerva u vodi)
      { foodId: 'b17', g: 250 }, // Svježi sir (posni)
      { foodId: 'u:mladi-luk', g: 60 }, // Mladi luk
      { foodId: 'u:limun', g: 30 }, // Limun
    ],
  },
  {
    id: 'rc-namaz-jaje',
    name: 'Namaz od jaja',
    cat: 'Mliječno i jaja',
    cuisine: 'ostalo',
    servings: 4,
    note: 'Kuhana jaja sa senfom i vrhnjem.',
    items: [
      { foodId: 'u:jaje-kuhano', g: 400 }, // Jaje (kuhano)
      { foodId: 'u:vrhnje-za-šlag', g: 100 }, // Vrhnje za šlag
      { foodId: 'off:senf', g: 25 }, // Senf
      { foodId: 'u:mladi-luk', g: 50 }, // Mladi luk
    ],
  },
]
