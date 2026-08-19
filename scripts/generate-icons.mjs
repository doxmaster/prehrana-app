/**
 * Crta ikone aplikacije i piše ih u public/ kao PNG.
 *
 * Zašto vlastiti koder umjesto biblioteke: PNG je ovdje samo zaglavlje i
 * zlib-stisnuti redci piksela, a zlib dolazi s Nodeom. Time projekt ne dobiva
 * ovisnost koju bi trebalo održavati zbog četiri slike koje se mijenjaju jednom
 * godišnje. Ikona se ne crta rukom nego RAČUNA iz oblika, pa je jednako oštra
 * na 180 i na 512 piksela.
 *
 * Oblik je list: presjek dvaju krugova (vesica piscis) zakrenut u dijagonalu,
 * s peteljkom i žilom. Isti znak stoji u zaglavlju aplikacije.
 *
 * Pokretanje: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'public')

/* ---------- PNG ---------- */

const CRC = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/** RGBA piksele pretvara u PNG. Filtar 0 po retku — zlib i tako sve odradi. */
function png(size, rgba) {
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // 8 bita po kanalu
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ---------- oblik ---------- */

const ZELENA_GORE = [0x22, 0xc5, 0x7b]
const ZELENA_DOLJE = [0x0f, 0x7a, 0x37]
const LIST = [0xff, 0xff, 0xff]

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))

/** Udaljenost točke od dužine — koristi je peteljka. */
function odDuzine(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t))
}

/**
 * Boja u točki (x, y u rasponu −1…1).
 *
 * `maskable` znači da Android smije odrezati rubove u bilo koji oblik, pa
 * podloga ide preko cijele plohe, a list se smanji u sigurnu sredinu.
 */
function boja(x, y, maskable) {
  const r = maskable ? 0.62 : 0.78 // koliko je list velik
  const rubR = 0.42 // zaobljenje kvadrata

  // Podloga: zaobljeni kvadrat s okomitim prijelazom.
  const qx = Math.max(Math.abs(x) - (1 - rubR), 0)
  const qy = Math.max(Math.abs(y) - (1 - rubR), 0)
  const izvan = Math.hypot(qx, qy) - rubR
  if (!maskable && izvan > 0) return null // prozirno izvan zaobljenog kvadrata

  const podloga = mix(ZELENA_GORE, ZELENA_DOLJE, (y + 1) / 2)

  // List: presjek dvaju krugova, zakrenut u dijagonalu.
  const kut = -Math.PI / 4
  const lx = (x * Math.cos(kut) - y * Math.sin(kut)) / r
  const ly = (x * Math.sin(kut) + y * Math.cos(kut)) / r
  const d = 0.55
  const uListu = Math.hypot(lx + d, ly) <= 1 && Math.hypot(lx - d, ly) <= 1

  // Peteljka nastavlja donji vrh lista.
  const naPeteljci = odDuzine(lx, ly, 0, 0.72, 0, 1.16) < 0.07

  if (uListu || naPeteljci) {
    // Žila po sredini lista: uski trag u boji podloge, da list ne bude ploha.
    const naZili = uListu && odDuzine(lx, ly, 0, -0.6, 0, 0.72) < 0.045
    return naZili ? podloga : LIST
  }
  return podloga
}

/** Crta ikonu s 4×4 nadmjerom, pa su rubovi glatki bez ijednog filtra. */
function nacrtaj(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4)
  const uzoraka = 4
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < uzoraka; sy++) {
        for (let sx = 0; sx < uzoraka; sx++) {
          const x = ((px + (sx + 0.5) / uzoraka) / size) * 2 - 1
          const y = ((py + (sy + 0.5) / uzoraka) / size) * 2 - 1
          const c = boja(x, y, maskable)
          if (c) {
            r += c[0]
            g += c[1]
            b += c[2]
            a += 255
          }
        }
      }
      const n = uzoraka * uzoraka
      const i = (py * size + px) * 4
      // Boja se dijeli brojem NEPROZIRNIH uzoraka, inace rub potamni prema crnoj.
      const neprozirnih = a / 255 || 1
      rgba[i] = Math.round(r / neprozirnih)
      rgba[i + 1] = Math.round(g / neprozirnih)
      rgba[i + 2] = Math.round(b / neprozirnih)
      rgba[i + 3] = Math.round(a / n)
    }
  }
  return png(size, rgba)
}

mkdirSync(OUT, { recursive: true })

const ikone = [
  { naziv: 'ikona-192.png', size: 192, maskable: false },
  { naziv: 'ikona-512.png', size: 512, maskable: false },
  { naziv: 'ikona-maskable-512.png', size: 512, maskable: true },
  // iOS ne cita manifest za ikonu nego apple-touch-icon, i ne voli prozirnost.
  { naziv: 'apple-touch-icon.png', size: 180, maskable: true },
]

for (const { naziv, size, maskable } of ikone) {
  const buf = nacrtaj(size, maskable)
  writeFileSync(resolve(OUT, naziv), buf)
  console.log(`  ${naziv.padEnd(26)} ${size}×${size}  ${(buf.length / 1024).toFixed(1)} kB`)
}
