/**
 * Peče pozadine "Tihi pleter" u src/assets/ kao SVG.
 *
 * Istu matematiku istražuje art/pleter-viewer.html (p5.js, klizači, sjemena);
 * ovdje se odabrana postavka zapisuje u datoteku. Zašto SVG, a ne PNG: pleter
 * su isključivo potezi s okruglim krajevima i jedan mekani prijelaz, pa je
 * vektor točan zapis, a ne aproksimacija — nekoliko desetaka kilobajta umjesto
 * megabajta, oštro na svakom zaslonu i bez ijednog mrežnog poziva.
 *
 * Ključna ideja crtanja: vrpca se ne crta u komadu nego u dijelovima između
 * križanja, a svaki dio prvo dobije REZ u boji tla pa tek onda boju. Taj rez je
 * jedini razlog zašto se križanje čita kao proplitanje. Redoslijed je zato
 * cijeli algoritam: prvo ono što ide ispod, pa ono što ide iznad.
 *
 * Pokretanje: node scripts/generate-backgrounds.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(root, 'src/assets')

const W = 1600
const H = 1000
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // 137,507°
const BRAID_TILT = -Math.PI / 7
const COS_T = Math.cos(BRAID_TILT)
const SIN_T = Math.sin(BRAID_TILT)

/** Determinističan šum: isto sjeme uvijek daje istu sliku. */
function hash2(x, y, seed) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2147483647)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const smooth = (t) => t * t * (3 - 2 * t)

/** Vrijednosni šum s glatkom interpolacijom — Perlinov nadomjestak bez p5. */
function noise2(x, y, seed = 0) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = smooth(x - xi)
  const yf = smooth(y - yi)
  const a = hash2(xi, yi, seed)
  const b = hash2(xi + 1, yi, seed)
  const c = hash2(xi, yi + 1, seed)
  const d = hash2(xi + 1, yi + 1, seed)
  return (a * (1 - xf) + b * xf) * (1 - yf) + (c * (1 - xf) + d * xf) * yf
}

/* Piksel je dovoljno fin za plohu od 1600 px; decimale samo debljaju datoteku. */
const round = (n) => Math.round(n)
/** Udjeli 0–1 (centar sjaja) trebaju tri decimale, inace zavrse na 0,5. */
const udio = (n) => Number(n.toFixed(3))

/**
 * Postavke tema.
 *
 * Nisu inverzija jedna druge: na tamnoj vrpce svijetle prema tlu, na svijetloj
 * ga zasjenjuju, pa i neprozirnosti i sjaj moraju biti različiti da bi obje
 * djelovale kao izvorna namjera.
 */
const TEME = {
  tamna: {
    ime: 'pozadina-tamna',
    // Tlo je tocno --bg iz tokens.css: slika ide kao donji sloj pozadine, pa
    // svako odstupanje pomakne ton cijele stranice.
    tlo: '#0e1512',
    sjaj: '#17302a',
    sjajJacina: 0.85,
    rez: '#0e1512',
    rezJacina: 0.86,
    palette: ['#5fb98a', '#e0a558', '#4f93b8'],
    prolazi: [
      [2.2, 0.05],
      [1.35, 0.1],
      [0.8, 0.2],
    ],
    zrno: 0.035,
    pojacanje: 1,
  },
  svijetla: {
    ime: 'pozadina-svijetla',
    tlo: '#eef4f0',
    sjaj: '#e2ece6',
    sjajJacina: 0.5,
    rez: '#eef4f0',
    rezJacina: 0.9,
    palette: ['#3f8f66', '#c2833a', '#3c7a9b'],
    prolazi: [
      [2.2, 0.04],
      [1.35, 0.07],
      [0.8, 0.13],
    ],
    zrno: 0.022,
    // Tamna boja na kremastoj plohi daje slabiji dojam nego svijetla na
    // crnoj, pa isti broj tisine treba vise da bi se vidjelo isto.
    pojacanje: 1.5,
  },
}

const ZADANO = {
  strands: 3,
  repeats: 2,
  bandGap: 330,
  ribbonWidth: 30,
  curl: 0.3,
}

/*
 * Dvije jacine, jer pozadina ispod teksta i pozadina naslovne kartice nisu
 * isti posao: ispod odlomaka mora nestati, na naslovu smije disati. Razlicito
 * sjeme da to ne bude dvaput ista slika.
 */
const JACINE = [
  { nastavak: '', seed: 7, quietness: 0.2 },
  { nastavak: '-naslov', seed: 21, quietness: 0.36 },
]

/** Točka na osi vrpce, prebačena u koordinate platna. */
function ribbonPoint(p, band, phase, swell, u) {
  const wobble = (noise2(u * 0.0009, band * 2.2, p.seed) - 0.5) * p.bandGap * 0.5 * p.curl
  const amp = p.bandGap * 0.42
  const v = band * p.bandGap + amp * swell * Math.sin(freqOf(p) * u + phase) + wobble
  return { x: W / 2 + u * COS_T - v * SIN_T, y: H / 2 + u * SIN_T + v * COS_T }
}

const freqOf = (p) => (Math.PI * 2 * p.repeats) / W

const naPlatnu = (pt) => pt.x > -90 && pt.x < W + 90 && pt.y > -90 && pt.y < H + 90

/**
 * Slaže komade svih vrpci jednog pojasa i vraća ih poredane po dubini.
 *
 * Komad se produžuje malo preko križanja: zaobljeni kraj tako završi ispod
 * vrpce koja ide iznad, umjesto da viri kao batrljak.
 */
function komadiPojasa(p, band) {
  const drift = noise2(band * 7.3, p.seed * 0.11, p.seed) * Math.PI * 2
  const swell = 0.55 + 0.9 * noise2(band * 3.1 + 12.7, p.seed * 0.07, p.seed)
  const reach = Math.hypot(W, H) * 0.62
  const stepLen = 12
  const freq = freqOf(p)
  const komadi = []

  for (let k = 0; k < p.strands; k++) {
    const phase = k * GOLDEN_ANGLE * p.strands + band * 0.6 + drift
    let tekuci = null

    for (let u = -reach; u <= reach; u += stepLen) {
      const depth = Math.cos(freq * u + phase) * (band % 2 === 0 ? 1 : -1)
      const iznad = depth >= 0
      if (!tekuci || tekuci.iznad !== iznad) {
        if (tekuci) {
          tekuci.pts.push(ribbonPoint(p, band, phase, swell, u))
          tekuci.pts.push(ribbonPoint(p, band, phase, swell, u + stepLen * 1.6))
        }
        tekuci = {
          k,
          band,
          iznad,
          pts: [ribbonPoint(p, band, phase, swell, u - stepLen * 1.6)],
          zbroj: 0,
          n: 0,
        }
        komadi.push(tekuci)
      }
      tekuci.pts.push(ribbonPoint(p, band, phase, swell, u))
      tekuci.zbroj += depth
      tekuci.n++
    }
  }

  for (const komad of komadi) komad.depth = komad.zbroj / Math.max(1, komad.n)
  komadi.sort((a, b) => a.depth - b.depth)
  return komadi.filter((komad) => komad.pts.length > 1 && komad.pts.some(naPlatnu))
}

const putanja = (pts) =>
  pts.map((pt, i) => `${i ? 'L' : 'M'}${round(pt.x)} ${round(pt.y)}`).join(' ')

function crtajPleter(p, tema) {
  const reach = Math.hypot(W, H) * 0.62
  const bands = Math.ceil(reach / p.bandGap)
  const out = []

  for (let band = -bands; band <= bands; band++) {
    for (const komad of komadiPojasa(p, band)) {
      const prva = komad.pts[0]
      const width = p.ribbonWidth * (0.8 + 0.4 * noise2(prva.x * 0.0011, komad.band * 4.4, p.seed))
      const lift = 0.6 + 0.4 * (komad.depth * 0.5 + 0.5)
      const breath = 0.4 + 1.1 * noise2(prva.x * 0.0008 + 3.3, prva.y * 0.0008 + 6.6, p.seed)
      const boja = tema.palette[komad.k % tema.palette.length]
      const d = putanja(komad.pts)

      /*
       * I rez mora slusati tisinu: na tihoj postavci puni rez ostavlja tamne
       * pruge ondje gdje vrpce vise nema, pa ploha izgleda izgrebano.
       */
      const rez = tema.rezJacina * (0.3 + 0.7 * p.quietness)
      out.push(
        `<path d="${d}" stroke="${tema.rez}" stroke-width="${round(width * 1.55)}" opacity="${udio(rez)}"/>`,
      )
      for (const [mnozitelj, alpha] of tema.prolazi) {
        const o = Math.min(0.95, alpha * p.quietness * lift * breath)
        if (o < 0.004) continue
        out.push(
          `<path d="${d}" stroke="${boja}" stroke-width="${round(width * mnozitelj)}" opacity="${udio(o)}"/>`,
        )
      }
    }
  }
  return out.join('\n')
}

function svg(p, tema) {
  const gx = W * (0.3 + noise2(p.seed * 0.7, 0, p.seed) * 0.4)
  const gy = H * (0.26 + noise2(p.seed * 1.3 + 9, 0, p.seed) * 0.48)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">
<title>Tihi pleter — ${tema.ime}</title>
<defs>
<radialGradient id="tlo" cx="${udio(gx / W)}" cy="${udio(gy / H)}" r="0.9">
<stop offset="0" stop-color="${tema.sjaj}" stop-opacity="${tema.sjajJacina}"/>
<stop offset="1" stop-color="${tema.tlo}" stop-opacity="0"/>
</radialGradient>
<filter id="zrno" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${p.seed}"/>
<feColorMatrix type="saturate" values="0"/>
</filter>
</defs>
<rect width="${W}" height="${H}" fill="${tema.tlo}"/>
<rect width="${W}" height="${H}" fill="url(#tlo)"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${crtajPleter(p, tema)}
</g>
<rect width="${W}" height="${H}" filter="url(#zrno)" opacity="${tema.zrno}"/>
</svg>
`
}

mkdirSync(OUT_DIR, { recursive: true })

const napravljeno = []
for (const tema of Object.values(TEME)) {
  for (const jacina of JACINE) {
    const p = { ...ZADANO, seed: jacina.seed, quietness: jacina.quietness * tema.pojacanje }
    const sadrzaj = svg(p, tema)
    const naziv = `${tema.ime}${jacina.nastavak}.svg`
    writeFileSync(resolve(OUT_DIR, naziv), sadrzaj, 'utf8')
    napravljeno.push(`${naziv}  ${(sadrzaj.length / 1024).toFixed(1)} kB  tišina ${udio(p.quietness)}`)
  }
}

console.log(`${ZADANO.strands} vrpce, pojas ${ZADANO.bandGap} px`)
for (const red of napravljeno) console.log('  ' + red)
