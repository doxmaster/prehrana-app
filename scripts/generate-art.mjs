/**
 * Crta ilustracije za aplikaciju i pise ih u src/data/art.ts.
 *
 * Fotografije 250 namirnica i 186 jela nemamo odakle uzeti — tude se ne smiju
 * uzeti, a vlastite ne postoje. Zato se crta: svaka ilustracija je nekoliko
 * stotina bajta SVG-a, ostra na svakom zaslonu, boji se bojom kategorije i ne
 * trazi nijedan mrezni poziv.
 *
 * Oblici nisu rucno nacrtani nego IZRACUNATI iz sjemena: mekani "listovi" i
 * mrlje slazu se po zlatnom kutu, pa je svaka kategorija prepoznatljivo
 * drukcija, a sve zajedno djeluje kao jedan potez. Isto sjeme uvijek daje istu
 * sliku, pa se izgled ne mijenja od pokretanja do pokretanja.
 *
 * Pokretanje: node scripts/generate-art.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'src/data/art.ts')

/** Determinististan izvor slucajnosti (mulberry32) — isto sjeme, ista slika. */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round = (n) => Math.round(n * 10) / 10

/**
 * Mekani zatvoreni oblik — "list" ili "mrlja".
 *
 * Radijus se mijenja po kutu preko dva sinusa razlicite frekvencije, pa rub
 * nikad ne izgleda kao krug, a ipak ostaje gladak. Tocke se spajaju glatkom
 * krivuljom kroz sredine bridova (Catmull-Rom bez racuna tangenti).
 */
function blob(random, cx, cy, r, wobble = 0.28, points = 9) {
  const phase1 = random() * Math.PI * 2
  const phase2 = random() * Math.PI * 2
  const f1 = 2 + Math.floor(random() * 3)
  const f2 = 4 + Math.floor(random() * 3)

  const pts = []
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const rr = r * (1 + wobble * (0.6 * Math.sin(f1 * a + phase1) + 0.4 * Math.sin(f2 * a + phase2)))
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
  }

  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = ''
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i]
    const next = pts[(i + 1) % pts.length]
    const m = mid(cur, next)
    if (i === 0) {
      const prev = pts[pts.length - 1]
      const start = mid(prev, cur)
      d += `M${round(start[0])} ${round(start[1])}`
    }
    d += `Q${round(cur[0])} ${round(cur[1])} ${round(m[0])} ${round(m[1])}`
  }
  return d + 'Z'
}

/** Zlatni kut — razmjestaj koji nikad ne pravi vidljive redove. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/**
 * Baner: nekoliko slojeva mrlja koje se prelijevaju, od tamnije prema svjetlijoj.
 * Prozirnost pada s dubinom, pa se dobiva dojam magle bez ijednog filtra.
 */
function hero(seed, colors) {
  const random = rng(seed)
  const W = 1200
  const H = 320
  const layers = []

  for (let i = 0; i < 26; i++) {
    const t = i / 26
    const a = i * GOLDEN + random() * 0.4
    const rad = 120 + random() * 260
    const cx = W * (0.5 + 0.52 * Math.cos(a) * (0.35 + t))
    const cy = H * (0.5 + 0.75 * Math.sin(a) * (0.3 + t * 0.8))
    const color = colors[i % colors.length]
    const opacity = round(0.06 + 0.1 * (1 - t))
    layers.push(
      `<path d="${blob(random, cx, cy, rad, 0.22, 10)}" fill="${color}" opacity="${opacity}"/>`,
    )
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[2]}"/>`,
    `</linearGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#g)"/>`,
    layers.join(''),
    `</svg>`,
  ].join('')
}

/**
 * Plocica kategorije: mekana pozadina u boji kategorije i tri-cetiri mrlje
 * razlicite velicine — dovoljno da se dvije kategorije nikad ne pobrkaju, a
 * premalo da odvlaci pozornost s naziva.
 */
function tile(seed, color) {
  const random = rng(seed)
  const S = 120
  const shapes = []
  const count = 3 + Math.floor(random() * 2)

  for (let i = 0; i < count; i++) {
    const a = i * GOLDEN + random()
    const r = 26 + random() * 30
    const cx = S / 2 + Math.cos(a) * (10 + random() * 26)
    const cy = S / 2 + Math.sin(a) * (10 + random() * 26)
    shapes.push(
      `<path d="${blob(random, cx, cy, r, 0.34, 8)}" fill="${color}" opacity="${round(0.16 + 0.2 * random())}"/>`,
    )
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">`,
    `<rect width="${S}" height="${S}" fill="${color}" opacity="0.08"/>`,
    shapes.join(''),
    `</svg>`,
  ].join('')
}

/** Boje kategorija — iste kao u sucelju (domain/constants.ts). */
const CATEGORY_COLORS = {
  'Meso i riba': '#c0563f',
  'Mliječno i jaja': '#3a86c4',
  'Žitarice i kruh': '#c98a2e',
  Mahunarke: '#7b5ea7',
  'Povrće': '#2f9e5e',
  'Voće': '#d1495b',
  'Orašasti i masti': '#8a6d3b',
  'Pića': '#1f9d9d',
  Suplementi: '#6b7280',
  Ostalo: '#5b7a6a',
}

const BRAND = ['#0f7a37', '#16a34a', '#14b8a6', '#3a86c4']

const heroSvg = hero(20260811, BRAND)
const tiles = Object.entries(CATEGORY_COLORS).map(
  ([cat, color], i) => [cat, tile(1000 + i * 977, color)],
)

/** SVG u obliku spremnom za CSS url() — bez base64, da ostane citljiv i malen. */
const dataUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`

const body = tiles
  .map(([cat, svg]) => `  ${JSON.stringify(cat)}: '${dataUri(svg)}',`)
  .join('\n')

writeFileSync(
  OUT,
  `/**
 * GENERIRANO — ne uređivati ručno.
 * Generator: scripts/generate-art.mjs
 *
 * Ilustracije su izračunate iz sjemena, ne preuzete: svaka je nekoliko stotina
 * bajta i ne traži nijedan mrežni poziv. Isto sjeme uvijek daje istu sliku.
 */
import type { Category } from '../domain/types'

/** Baner za vrh Dnevnika. */
export const HERO_ART = '${dataUri(heroSvg)}'

/** Pozadinska pločica po kategoriji namirnice. */
export const CATEGORY_ART: Record<Category, string> = {
${body}
}
`,
  'utf8',
)

const kb = (s) => Math.round((s.length / 1024) * 10) / 10
console.log(`Zapisano u src/data/art.ts`)
console.log(` baner: ${kb(heroSvg)} kB, pločica: ${tiles.length} × ~${kb(tiles[0][1])} kB`)
