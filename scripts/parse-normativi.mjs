/**
 * Izvlaci sluzbene normative recepata iz Dodatka Nacionalnim smjernicama za
 * prehranu ucenika u osnovnim skolama (Ministarstvo zdravlja RH, 2013).
 *
 * Format u dokumentu:
 *   KATEGORIJA
 *   2315 NAZIV JELA VELIKIM SLOVIMA
 *   1407 Sir Gouda 40,00 40,00 656 156
 *   ...
 *   Ukupno: 538
 *
 * Kolicine su po JEDNOJ porciji za ucenika, ne po serviranju za vise osoba.
 *
 * Pokretanje: node scripts/parse-normativi.mjs <dodatak.txt> <izlaz.json>
 */
import { readFileSync, writeFileSync } from 'node:fs'

const text = readFileSync(process.argv[2], 'utf8')
const out = process.argv[3]

const CATEGORIES = [
  'NAPITCI',
  'ŽITARICE ZA DORUČAK',
  'NAMAZI',
  'NARESCI I JAJA',
  'JUHE',
  'MESNA JELA - SLOŽENCI',
  'MESNA JELA',
  'VARIVA',
  'PRILOZI',
  'JELA OD RIBA',
  'POVRTNI SLOŽENCI',
  'SALATE',
  'DESERTI',
  'KRUH I PEKARSKI PROIZVODI',
  'VOĆE',
  'GOTOVI INDUSTRIJSKI PROIZVODI',
]

/** Sastojak: sifra, naziv, kolicina, jestivi dio, kJ, kcal. */
const INGREDIENT = /(\d{4})\s+([A-ZŠĐČĆŽa-zšđčćž][^\d]*?)\s+(\d+[,.]\d{2})\s+(\d+[,.]\d{2})\s+(\d+)\s+(\d+)/g

/** Pocetak recepta: sifra pa naziv velikim slovima bez brojeva iza. */
const RECIPE_START = /(\d{4})\s+([A-ZŠĐČĆŽ][A-ZŠĐČĆŽ\s,()»«\-\/%.]{6,}?)(?=\s+\d{4}\s+[A-ZŠĐČĆŽa-zšđčćž])/g

const num = (s) => Number(String(s).replace(',', '.'))

// Cijeli tekst normativa u jednom komadu — recepti se prelamaju preko stranica.
const start = text.indexOf('2. 1. NORMATIVI ZA JELOVNIK')
const body = start >= 0 ? text.slice(start) : text

/** Gdje koja kategorija pocinje. */
const categoryAt = []
for (const cat of CATEGORIES) {
  let from = 0
  while (true) {
    const at = body.indexOf(cat, from)
    if (at < 0) break
    categoryAt.push({ at, cat })
    from = at + cat.length
  }
}
categoryAt.sort((a, b) => a.at - b.at)

const categoryFor = (index) => {
  let current = 'OSTALO'
  for (const c of categoryAt) {
    if (c.at <= index) current = c.cat
    else break
  }
  return current
}

const recipes = []
const starts = [...body.matchAll(RECIPE_START)]

for (let i = 0; i < starts.length; i++) {
  const m = starts[i]
  const from = m.index + m[0].length
  const to = i + 1 < starts.length ? starts[i + 1].index : body.length
  const block = body.slice(from, to)

  const name = m[2].replace(/\s{2,}/g, ' ').trim()
  if (name.length < 6) continue
  // Naslovi kategorija i tablica nisu recepti.
  if (CATEGORIES.some((c) => name.startsWith(c))) continue
  if (/ŠIFRA|NAZIV RECEPTURE|ENERGIJA|UKUPNO/.test(name)) continue

  const items = []
  INGREDIENT.lastIndex = 0
  for (const ing of block.matchAll(INGREDIENT)) {
    const ingredientName = ing[2].replace(/\s{2,}/g, ' ').trim()
    const quantity = num(ing[3])
    if (!ingredientName || !(quantity > 0)) continue
    if (ingredientName.length > 60) continue
    items.push({
      code: ing[1],
      name: ingredientName,
      g: quantity,
      edible: num(ing[4]),
      kcal: Number(ing[6]),
    })
  }
  if (items.length < 2) continue

  const totalMatch = block.match(/Ukupno:\s*(\d+)/)
  recipes.push({
    code: m[1],
    name,
    category: categoryFor(m.index),
    items,
    kcalTotal: totalMatch ? Number(totalMatch[1]) : items.reduce((s, it) => s + it.kcal, 0),
  })
}

writeFileSync(out, JSON.stringify({ recipes }, null, 2), 'utf8')

const byCat = {}
for (const r of recipes) byCat[r.category] = (byCat[r.category] ?? 0) + 1

console.log(`Pronađeno ${recipes.length} recepata:`)
for (const [cat, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${cat}`)
}

const ingredients = new Map()
for (const r of recipes) for (const it of r.items) ingredients.set(it.name, (ingredients.get(it.name) ?? 0) + 1)
console.log(`\nRazličitih sastojaka: ${ingredients.size}`)
