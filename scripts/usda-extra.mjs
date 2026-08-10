/**
 * Dohvaca NOVE namirnice iz USDA FoodData Centrala i pise src/data/extraFoods.ts.
 *
 * Odvojeno od usda-verify.mjs, koji usporeduje POSTOJECU bazu iz legacy datoteke.
 * Ovdje se namirnice tek dodaju, pa nema s cim usporedivati — provjerava se samo
 * da su vrijednosti energetski konzistentne.
 *
 * Identifikatori su 'u:<slug>' pa ugradena baza zadrzava invarijantu b0..b92.
 *
 * Pokretanje: node --env-file=.env scripts/usda-extra.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ATWATER_TOLERANCE,
  NUTRIENT_KEYS,
  atwaterDeviation,
  extractNutrients,
  isAlcoholic,
  pickBest,
  sleep,
  usda,
} from './lib/usda.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MAP_PATH = resolve(root, 'scripts/usda-extra.json')
const OUT = resolve(root, 'src/data/extraFoods.ts')
const REPORT = resolve(root, 'reports/usda-dopuna.md')
const VERIFIED_AT = process.env.VERIFIED_AT ?? new Date().toISOString().slice(0, 10)

const API_KEY = process.env.USDA_API_KEY
if (!API_KEY) {
  console.error('Nedostaje USDA_API_KEY. Pokreni s: node --env-file=.env scripts/usda-extra.mjs')
  process.exit(1)
}

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-zà-ž0-9]+/gi, '-')
    .replace(/^-|-$/g, '')

const map = JSON.parse(readFileSync(MAP_PATH, 'utf8'))
const only = process.argv.slice(2)
const entries = map.foods.filter((e) => (only.length ? only.includes(e.name) : true))

const kept = []
const problems = []
const warnings = []
let done = 0

for (const entry of entries) {
  try {
    let chosen = null

    if (entry.fdcId) {
      const detail = await usda(`food/${entry.fdcId}`, { format: 'abridged' }, API_KEY)
      chosen = { fdcId: entry.fdcId, description: entry.description, values: extractNutrients(detail) }
    } else {
      const search = await usda(
        'foods/search',
        { query: entry.query, dataType: 'Foundation,SR Legacy', pageSize: '25' },
        API_KEY,
      )
      const candidates = search.foods ?? []

      /**
       * Prvi pogodak zna biti zapis bez energije — Foundation unosi za porluk,
       * suhe sljive i sol nemaju je uopce. Umjesto odustajanja isprobava se
       * sljedeci kandidat koji zadovoljava ista pravila.
       */
      const ranked = []
      let pool = candidates
      for (let i = 0; i < 4; i++) {
        const best = pickBest(pool, entry, map._avoidGlobal ?? [])
        if (!best) break
        ranked.push(best)
        pool = pool.filter((f) => f.fdcId !== best.fdcId)
      }

      if (!ranked.length) {
        problems.push(`${entry.name}: nijedan rezultat ne zadovoljava must/avoid (${entry.query})`)
        continue
      }

      for (const candidate of ranked) {
        try {
          const detail = await usda(`food/${candidate.fdcId}`, { format: 'abridged' }, API_KEY)
          const values = extractNutrients(detail)
          if (values.kcal === undefined) continue
          chosen = { fdcId: candidate.fdcId, description: candidate.description, values }
          break
        } catch {
          // sljedeci kandidat
        }
        await sleep(80)
      }

      if (!chosen) {
        problems.push(
          `${entry.name}: nijedan od ${ranked.length} kandidata nema podatak o energiji`,
        )
        continue
      }
      entry.fdcId = chosen.fdcId
      entry.description = chosen.description
    }

    const { fdcId, description, values } = chosen
    const full = {}
    for (const key of NUTRIENT_KEYS) full[key] = Math.round((values[key] ?? 0) * 100) / 100

    /**
     * Atwaterova provjera NE odbacuje USDA podatke.
     *
     * Ona postoji da uhvati izmisljene vrijednosti i tipfelere u korisnickim
     * izvorima. USDA za neke namirnice koristi posebne energetske faktore, pa
     * opca formula promasi: ocat odstupa 82 % (energija iz octene kiseline),
     * kakao 37 %. Odbaciti laboratorijski podatak zbog vlastite heuristike bilo
     * bi naopako — odstupanje se biljezi u izvjestaj i to je sve.
     */
    if (!isAlcoholic(entry.name, entry.cat)) {
      const dev = atwaterDeviation(full)
      if (dev > ATWATER_TOLERANCE) {
        warnings.push(
          `${entry.name}: odstupanje ${Math.round(dev * 100)} % od Atwaterove procjene (${description})`,
        )
      }
    }

    kept.push({ id: `u:${slug(entry.name)}`, name: entry.name, cat: entry.cat, serv: entry.serv, fdcId, description, ...full })
    done++
    process.stdout.write(`\r Dohvaceno ${done}/${entries.length}   `)
    await sleep(120)
  } catch (err) {
    problems.push(`${entry.name}: ${err.message}`)
  }
}

writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + '\n', 'utf8')

kept.sort((a, b) => a.name.localeCompare(b.name, 'hr'))

const ORDER = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'mg', 'vc', 'vd']
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const line = (f) =>
  `  { id: ${q(f.id)}, name: ${q(f.name)}, cat: ${q(f.cat)}, ` +
  ORDER.map((k) => `${k}: ${f[k]}`).join(', ') +
  `, serv: ${f.serv}, source: 'usda', sourceId: ${q(String(f.fdcId))}, verifiedAt: ${q(VERIFIED_AT)}, base: true },`

const out = `/**
 * GENERIRANO — ne uređivati ručno.
 * Izvor: USDA FoodData Central, generator: scripts/usda-extra.mjs
 *
 * Dopuna ugrađene baze. Vrijednosti su na 100 g (100 ml za pića) i dolaze iz
 * laboratorijske analize; \`sourceId\` je USDA fdcId.
 */
import type { Food } from '../domain/types'

export const EXTRA_FOODS: Food[] = [
${kept.map(line).join('\n')}
]
`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, out, 'utf8')

let md = `# Dopuna baze namirnica iz USDA\n\n`
md += `Dodano: ${kept.length} · s odstupanjem: ${warnings.length} · problema: ${problems.length}\n\n`
md += `| Namirnica | Kategorija | kcal/100 g | USDA opis |\n|---|---|---:|---|\n`
for (const f of kept) md += `| ${f.name} | ${f.cat} | ${f.kcal} | ${f.description} |\n`

if (warnings.length) {
  md += `\n## Odstupanja od Atwaterove procjene\n\n`
  md += `Zadrzano jer je USDA laboratorijski izvor — opca formula ne vrijedi za sve namirnice `
  md += `(ocat crpi energiju iz octene kiseline, kakao ima posebne faktore).\n\n`
  for (const w of warnings) md += `- ${w}\n`
}
if (problems.length) {
  md += `\n## Zahtijeva rucni pregled\n\n`
  for (const p of problems) md += `- ${p}\n`
}
mkdirSync(dirname(REPORT), { recursive: true })
writeFileSync(REPORT, md, 'utf8')

console.log(`\n\nDodano ${kept.length}, s odstupanjem ${warnings.length}, problema ${problems.length}`)
console.log(`Izvjestaj: reports/usda-dopuna.md`)
