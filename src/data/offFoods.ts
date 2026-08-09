/**
 * GENERIRANO — ne uređivati ručno.
 * Izvor: Open Food Facts, generator: scripts/generate-off-foods.mjs
 *
 * Ovo su PAKIRANI proizvodi. Vrijednost je medijan preko više proizvoda iste
 * kategorije, pa je tržišni prosjek, a ne analiza konkretnog artikla. Za točne
 * vrijednosti proizvoda koji stvarno kupuješ koristi barkod skener.
 *
 * Uvršteni su samo pojmovi kod kojih se proizvodi međusobno slažu
 * (međukvartilni raspon kalorija do 35 %).
 */
import type { Food } from '../domain/types'

export const OFF_FOODS: Food[] = [
  { id: 'off:čips-od-krumpira', name: 'Čips od krumpira', cat: 'Ostalo', kcal: 522, p: 6.2, c: 52, f: 31, fib: 4.8, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 40, source: 'off', sourceId: '49 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:dimljeni-sir', name: 'Dimljeni sir', cat: 'Mliječno i jaja', kcal: 301, p: 22.5, c: 1.5, f: 24, fib: 0, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 40, source: 'off', sourceId: '45 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:griz-pšenična-krupica', name: 'Griz (pšenična krupica)', cat: 'Žitarice i kruh', kcal: 347.83, p: 10.5, c: 73.3, f: 1, fib: 1.46, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 60, source: 'off', sourceId: '17 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:gusti-sok-nektar', name: 'Gusti sok (nektar)', cat: 'Pića', kcal: 44.5, p: 0.3, c: 10.5, f: 0, fib: 0.15, fe: 0.18, ca: 21, mg: 0, vc: 30, vd: 0, serv: 200, source: 'off', sourceId: '44 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:inćuni-fileti-u-ulju', name: 'Inćuni (fileti u ulju)', cat: 'Meso i riba', kcal: 222, p: 26.75, c: 0, f: 11.9, fib: 0, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 20, source: 'off', sourceId: '40 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:kečap', name: 'Kečap', cat: 'Ostalo', kcal: 102, p: 1.2, c: 23.2, f: 0.1, fib: 0.6, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 20, source: 'off', sourceId: '45 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:keks', name: 'Keks', cat: 'Ostalo', kcal: 451, p: 7.62, c: 65, f: 17, fib: 5.1, fe: 2.6, ca: 144, mg: 144, vc: 0, vd: 2, serv: 30, source: 'off', sourceId: '49 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:kobasica', name: 'Kobasica', cat: 'Meso i riba', kcal: 259.8, p: 14, c: 1.3, f: 23, fib: 0, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 80, source: 'off', sourceId: '46 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:krafna', name: 'Krafna', cat: 'Žitarice i kruh', kcal: 438, p: 5.63, c: 49.1, f: 24, fib: 1.55, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 80, source: 'off', sourceId: '46 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:krekeri', name: 'Krekeri', cat: 'Žitarice i kruh', kcal: 461.64, p: 11, c: 60.25, f: 18.06, fib: 4.65, fe: 3.33, ca: 108.14, mg: 0, vc: 0, vd: 0, serv: 30, source: 'off', sourceId: '50 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:krem-namaz-od-lješnjaka', name: 'Krem namaz od lješnjaka', cat: 'Ostalo', kcal: 539, p: 6.3, c: 55, f: 32, fib: 3.5, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 20, source: 'off', sourceId: '49 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:kulen', name: 'Kulen', cat: 'Meso i riba', kcal: 427, p: 23.8, c: 2.7, f: 36.8, fib: 0, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 40, source: 'off', sourceId: '3 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:margarin', name: 'Margarin', cat: 'Orašasti i masti', kcal: 495, p: 0, c: 0.1, f: 55, fib: 0, fe: 0, ca: 0, mg: 0, vc: 0, vd: 7.5, serv: 15, source: 'off', sourceId: '45 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:masline-zelene', name: 'Masline zelene', cat: 'Povrće', kcal: 150.5, p: 1.1, c: 0.5, f: 15, fib: 3, fe: 0, ca: 0, mg: 0, vc: 5, vd: 0, serv: 30, source: 'off', sourceId: '48 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:mliječna-čokolada', name: 'Mliječna čokolada', cat: 'Ostalo', kcal: 554, p: 7.4, c: 52.9, f: 34.1, fib: 2.5, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 30, source: 'off', sourceId: '49 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:mortadela', name: 'Mortadela', cat: 'Meso i riba', kcal: 260, p: 14, c: 1, f: 22, fib: 0.05, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 40, source: 'off', sourceId: '39 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:mozzarella', name: 'Mozzarella', cat: 'Mliječno i jaja', kcal: 247, p: 17.5, c: 1.4, f: 19, fib: 0, fe: 0, ca: 591, mg: 0, vc: 0, vd: 0, serv: 60, source: 'off', sourceId: '43 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:musli', name: 'Musli', cat: 'Žitarice i kruh', kcal: 432, p: 10, c: 60, f: 13, fib: 9.1, fe: 2.5, ca: 0, mg: 81.85, vc: 0, vd: 0, serv: 60, source: 'off', sourceId: '49 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:napolitanke', name: 'Napolitanke', cat: 'Ostalo', kcal: 514.5, p: 6.34, c: 62.5, f: 26.3, fib: 3, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 40, source: 'off', sourceId: '48 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:pelati-guljene-rajčice', name: 'Pelati (guljene rajčice)', cat: 'Povrće', kcal: 22, p: 1.15, c: 3.4, f: 0.34, fib: 1.1, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 200, source: 'off', sourceId: '38 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:protein-pločica', name: 'Protein pločica', cat: 'Suplementi', kcal: 406, p: 23, c: 33, f: 17, fib: 6.5, fe: 0, ca: 283, mg: 0, vc: 0, vd: 0, serv: 50, source: 'off', sourceId: '45 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:salama', name: 'Salama', cat: 'Meso i riba', kcal: 370, p: 23.78, c: 1, f: 29, fib: 0.25, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 40, source: 'off', sourceId: '49 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:senf', name: 'Senf', cat: 'Ostalo', kcal: 157, p: 7.05, c: 3.25, f: 11.19, fib: 2.7, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 10, source: 'off', sourceId: '48 proizvoda', verifiedAt: '2026-08-09', base: true },
  { id: 'off:suncokretovo-ulje', name: 'Suncokretovo ulje', cat: 'Orašasti i masti', kcal: 828, p: 0, c: 0, f: 92, fib: 0, fe: 0, ca: 0, mg: 0, vc: 0, vd: 11.25, serv: 10, source: 'off', sourceId: '45 proizvoda', verifiedAt: '2026-08-09', base: true },
]
