/**
 * Piše dist/sw.js — service worker koji aplikaciju drži dostupnom bez mreže.
 *
 * Popis datoteka se ČITA iz gotovog builda, ne prepisuje ručno: Vite imenima
 * dodaje hash, pa bi ručni popis zastario prvim sljedećim izdanjem i offline bi
 * tiho prestao raditi. Isti hash služi i kao ime spremišta, pa novo izdanje
 * automatski dobiva svoje, a staro se briše.
 *
 * Zašto uopće offline: dnevnik se upisuje za stolom, u dućanu i na putu — ondje
 * gdje signala zna nestati. Podaci su ionako u pregledniku; bilo bi besmisleno
 * da ih mreža sprječava upisati.
 *
 * Pokretanje: npm run build && node scripts/generate-sw.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(root, 'dist')

/*
 * Datoteke koje nisu dio aplikacije nego upute posluzitelju. Nemaju sto raditi
 * u spremistu za offline, a `_headers` bi se ondje jos i zaledio pa bi pravila
 * predmemorije prestala vrijediti.
 */
const NIJE_APLIKACIJA = new Set(['sw.js', '_headers', '_redirects'])

/** Sve što treba za pokretanje bez mreže; sw.js sam sebe ne kešira. */
function datoteke(poddir = '') {
  const puni = resolve(DIST, poddir)
  const out = []
  for (const stavka of readdirSync(puni, { withFileTypes: true })) {
    const rel = poddir ? `${poddir}/${stavka.name}` : stavka.name
    if (stavka.isDirectory()) out.push(...datoteke(rel))
    else if (!NIJE_APLIKACIJA.has(stavka.name) && !stavka.name.endsWith('-artefakt.html'))
      out.push(rel)
  }
  return out
}

const popis = datoteke().sort()
const otisak = createHash('sha256')
for (const rel of popis) otisak.update(readFileSync(resolve(DIST, rel)))
const verzija = otisak.digest('hex').slice(0, 12)

// base iz index.html: na GitHub Pagesu stranica ne stoji u korijenu domene.
const index = readFileSync(resolve(DIST, 'index.html'), 'utf8')
const base = /(?:src|href)="([^"]*)\/assets\//.exec(index)?.[1] || ''

const sw = `/* Generirano: scripts/generate-sw.mjs — ne uređivati ručno. */
const VERZIJA = 'prehrana-${verzija}'
const BASE = '${base}/'
const DATOTEKE = ${JSON.stringify(popis.map((f) => `${base}/${f}`), null, 2)}

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERZIJA).then((c) => c.addAll(DATOTEKE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  // Staro izdanje se brise cim novo proradi, da spremiste ne raste bez kraja.
  e.waitUntil(
    caches
      .keys()
      .then((imena) => Promise.all(imena.filter((i) => i !== VERZIJA).map((i) => caches.delete(i))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const zahtjev = e.request
  if (zahtjev.method !== 'GET' || new URL(zahtjev.url).origin !== self.location.origin) return

  /*
   * Otvaranje aplikacije ide PRVO NA MREZU, pa tek onda u spremiste.
   *
   * Obrnuto (spremiste prvo) znaci da korisnik nakon svakog novog izdanja jos
   * danima vidi staru aplikaciju i misli da nesto ne radi — tako je nova kartica
   * u Postavkama bila nevidljiva iako je odavno objavljena. Stranica je mala,
   * pa je jedan mrezni zahtjev jeftiniji od te zbrke; bez mreze se i dalje
   * posluzuje spremljena kopija, sto je i bila cijela svrha.
   */
  if (zahtjev.mode === 'navigate') {
    e.respondWith(
      fetch(zahtjev)
        .then((odgovor) => {
          const kopija = odgovor.clone()
          caches.open(VERZIJA).then((c) => c.put(BASE + 'index.html', kopija))
          return odgovor
        })
        .catch(() => caches.match(BASE + 'index.html').then((o) => o || Response.error())),
    )
    return
  }

  // Sve ostalo je nepromjenjivo (ime nosi hash), pa spremiste ima prednost.
  e.respondWith(
    caches.match(zahtjev).then(
      (o) =>
        o ||
        fetch(zahtjev).then((odgovor) => {
          if (odgovor.ok) {
            const kopija = odgovor.clone()
            caches.open(VERZIJA).then((c) => c.put(zahtjev, kopija))
          }
          return odgovor
        }),
    ),
  )
})
`

writeFileSync(resolve(DIST, 'sw.js'), sw, 'utf8')
console.log(`sw.js — verzija ${verzija}, ${popis.length} datoteka, base "${base}/"`)
