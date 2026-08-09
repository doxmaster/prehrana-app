import type { Food } from '../../src/domain/types'

/**
 * Zamrznute vrijednosti namirnica onakve kakve su bile u legacy/index.html u
 * trenutku prijenosa. Zlatni testovi zbrajanja koriste OVO, a ne zivu bazu —
 * oni provjeravaju motor izracuna, ne sadrzaj podataka. Kad se baza osvjezi
 * prema USDA, ovaj fixture se namjerno ne dira.
 */
export const LEGACY_FOODS: Food[] = [
  { id: 'b0', name: 'Pileća prsa (pečena)', cat: 'Meso i riba', kcal: 165, p: 31, c: 0, f: 3.6, fib: 0, fe: 1, ca: 15, mg: 29, vc: 0, vd: 0.1, serv: 100, source: 'user' },
  { id: 'b6', name: 'Losos', cat: 'Meso i riba', kcal: 208, p: 20, c: 0, f: 13, fib: 0, fe: 0.3, ca: 12, mg: 29, vc: 0, vd: 11, serv: 100, source: 'user' },
  { id: 'b13', name: 'Mlijeko 2.8%', cat: 'Mliječno i jaja', kcal: 64, p: 3.3, c: 4.8, f: 3.5, fib: 0, fe: 0.05, ca: 120, mg: 11, vc: 1, vd: 0.1, serv: 100, source: 'user' },
  { id: 'b15', name: 'Grčki jogurt', cat: 'Mliječno i jaja', kcal: 97, p: 9, c: 3.9, f: 5, fib: 0, fe: 0.1, ca: 100, mg: 11, vc: 0, vd: 0, serv: 100, source: 'user' },
  { id: 'b22', name: 'Riža bijela (kuhana)', cat: 'Žitarice i kruh', kcal: 130, p: 2.7, c: 28, f: 0.3, fib: 0.4, fe: 1.2, ca: 10, mg: 12, vc: 0, vd: 0, serv: 100, source: 'user' },
  { id: 'b25', name: 'Zobene pahuljice', cat: 'Žitarice i kruh', kcal: 389, p: 17, c: 66, f: 7, fib: 10, fe: 4.7, ca: 54, mg: 177, vc: 0, vd: 0, serv: 100, source: 'user' },
  { id: 'b26', name: 'Krumpir (kuhani)', cat: 'Žitarice i kruh', kcal: 87, p: 2, c: 20, f: 0.1, fib: 1.8, fe: 0.3, ca: 5, mg: 22, vc: 13, vd: 0, serv: 100, source: 'user' },
  { id: 'b35', name: 'Brokula', cat: 'Povrće', kcal: 34, p: 2.8, c: 7, f: 0.4, fib: 2.6, fe: 0.7, ca: 47, mg: 21, vc: 89, vd: 0, serv: 100, source: 'user' },
  { id: 'b36', name: 'Špinat', cat: 'Povrće', kcal: 23, p: 2.9, c: 3.6, f: 0.4, fib: 2.2, fe: 2.7, ca: 99, mg: 79, vc: 28, vd: 0, serv: 100, source: 'user' },
  { id: 'b48', name: 'Banana', cat: 'Voće', kcal: 89, p: 1.1, c: 23, f: 0.3, fib: 2.6, fe: 0.3, ca: 5, mg: 27, vc: 8.7, vd: 0, serv: 100, source: 'user' },
  { id: 'b56', name: 'Bademi', cat: 'Orašasti i masti', kcal: 579, p: 21, c: 22, f: 50, fib: 12.5, fe: 3.7, ca: 269, mg: 270, vc: 0, vd: 0, serv: 100, source: 'user' },
  { id: 'b62', name: 'Maslinovo ulje', cat: 'Orašasti i masti', kcal: 884, p: 0, c: 0, f: 100, fib: 0, fe: 0.6, ca: 1, mg: 0, vc: 0, vd: 0, serv: 100, source: 'user' },
  { id: 'b65', name: 'Voda', cat: 'Pića', kcal: 0, p: 0, c: 0, f: 0, fib: 0, fe: 0, ca: 0, mg: 0, vc: 0, vd: 0, serv: 250, source: 'user' },
  { id: 'b68', name: 'Pivo svijetlo (5%)', cat: 'Pića', kcal: 43, p: 0.5, c: 3.6, f: 0, fib: 0, fe: 0.02, ca: 4, mg: 6, vc: 0, vd: 0, serv: 500, source: 'user' },
  { id: 'b76', name: 'Kava (crna, nezaslađena)', cat: 'Pića', kcal: 1, p: 0.1, c: 0, f: 0, fib: 0, fe: 0.01, ca: 2, mg: 3, vc: 0, vd: 0, serv: 200, source: 'user' },
]
