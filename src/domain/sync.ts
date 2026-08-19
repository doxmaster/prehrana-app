import type { AppState, Food, Household, Menu, Person, Recipe, WeekPlan } from './types'

/**
 * Spajanje dvaju stanja pri usklađivanju preko Drivea.
 *
 * Zašto TROSTRUKO spajanje (osnova + ovaj uređaj + drugi uređaj), a ne "novije
 * pobjeđuje": bez osnove se ne može razlikovati BRISANJE od "drugi to još nema".
 * Ako žena obriše jelovnik na mobitelu, a ja se poslije uskladim s računala na
 * kojem taj jelovnik još postoji, pravilo "novije pobjeđuje" vratilo bi ga —
 * zauvijek, jer brisanje nikad ne bi prošlo. S osnovom se vidi: nema ga kod nje,
 * a bio je u osnovi → obrisala ga je namjerno.
 *
 * Alternativa bi bila bilježiti tko je što dirnuo pri svakoj izmjeni, ali to
 * traži dopunu na svakom mjestu koje mijenja podatke; jedno propušteno mjesto
 * znači tiho gubljenje unosa. Osnova se pamti sama, na jednom mjestu.
 *
 * Granularnost je namjerno sitna: NE spaja se osoba kao cjelina nego svaki DAN
 * dnevnika zasebno. Inače bi dvoje koji istoga dana upisuju različite dane iste
 * osobe stalno bili u sukobu, a to je najčešći slučaj u obitelji.
 */

export interface SpojIshod {
  state: AppState
  /** Koliko je komada uzeto s ovog uređaja jer ih drugi nije imao/mijenjao. */
  ovdje: number
  /** Koliko je komada stiglo s drugog uređaja. */
  drugdje: number
  /** Koliko je komada oba uređaja promijenilo različito — zadržan je ovaj. */
  sukobi: string[]
}

type Jsonable = unknown
const jednako = (a: Jsonable, b: Jsonable) => JSON.stringify(a) === JSON.stringify(b)

interface Brojac {
  ovdje: number
  drugdje: number
  sukobi: string[]
}

/**
 * Odlučuje o jednom komadu podataka.
 *
 * `undefined` znači "ne postoji na toj strani". Vraća se vrijednost koja ide u
 * rezultat, ili `undefined` kad komad treba nestati (netko ga je obrisao).
 */
function odluci<T>(
  osnova: T | undefined,
  ovdje: T | undefined,
  drugdje: T | undefined,
  opis: string,
  b: Brojac,
): T | undefined {
  if (jednako(ovdje, drugdje)) return ovdje

  const mijenjanOvdje = !jednako(ovdje, osnova)
  const mijenjanDrugdje = !jednako(drugdje, osnova)

  if (mijenjanOvdje && !mijenjanDrugdje) {
    b.ovdje++
    return ovdje
  }
  if (mijenjanDrugdje && !mijenjanOvdje) {
    b.drugdje++
    return drugdje
  }

  /*
   * Oba su mijenjala isti komad na različit način. Zadržava se ovaj uređaj i to
   * se KAŽE — tiho gutanje tuđeg unosa je gore od dvije verzije o kojima se
   * korisnik može odlučiti. Povratak na prijašnje stanje ostaje moguć preko
   * sigurnosne kopije koja nastaje prije usklađivanja.
   */
  b.sukobi.push(opis)
  /*
   * Kad je jedna strana BRISANJE a druga IZMJENA, pobjeđuje izmjena. Obrisati
   * se može opet u sekundi; izgubljen tuđi unos se ne vraća nikako.
   */
  if (ovdje === undefined) return drugdje
  return ovdje
}

/** Spaja popis stavaka s vlastitim id-om (jelovnici, jela, tjedni…). */
function spojiPopis<T extends { id: string }>(
  osnova: readonly T[] | undefined,
  ovdje: readonly T[],
  drugdje: readonly T[],
  imeVrste: (x: T) => string,
  b: Brojac,
): T[] {
  const mapa = (popis: readonly T[] | undefined) => new Map((popis ?? []).map((x) => [x.id, x]))
  const o = mapa(osnova)
  const d = mapa(drugdje)

  const out: T[] = []
  const obradeni = new Set<string>()

  // Redoslijed prati ovaj uređaj, pa se popis ne premeta pri svakom usklađivanju.
  for (const stavka of ovdje) {
    obradeni.add(stavka.id)
    const rez = odluci(o.get(stavka.id), stavka, d.get(stavka.id), imeVrste(stavka), b)
    if (rez) out.push(rez)
  }
  for (const stavka of drugdje) {
    if (obradeni.has(stavka.id)) continue
    const rez = odluci(o.get(stavka.id), undefined, stavka, imeVrste(stavka), b)
    if (rez) out.push(rez)
  }
  return out
}

/** Spaja mapu ključ→vrijednost (dnevnik po datumu, izmjene ugrađenih namirnica). */
function spojiMapu<T>(
  osnova: Record<string, T> | undefined,
  ovdje: Record<string, T>,
  drugdje: Record<string, T>,
  opis: (kljuc: string) => string,
  b: Brojac,
): Record<string, T> {
  const out: Record<string, T> = {}
  const kljucevi = new Set([...Object.keys(ovdje), ...Object.keys(drugdje)])
  for (const k of [...kljucevi].sort()) {
    const rez = odluci(osnova?.[k], ovdje[k], drugdje[k], opis(k), b)
    if (rez !== undefined) out[k] = rez
  }
  return out
}

/** Mjerenja nemaju id nego datum — pretvaraju se u mapu pa natrag. */
function poDatumu<T extends { date: string }>(popis: readonly T[]): Record<string, T> {
  const out: Record<string, T> = {}
  for (const m of popis) out[m.date] = m
  return out
}

/** Osoba bez onoga sto se spaja dan po dan — ostatak ide kao jedna cjelina. */
function bezDnevnika(p: Person): Omit<Person, 'log' | 'measurements'> {
  const { log: _log, measurements: _mjere, ...ostatak } = p
  void _log
  void _mjere
  return ostatak
}

function spojiOsobu(
  osnova: Person | undefined,
  ovdje: Person,
  drugdje: Person | undefined,
  b: Brojac,
): Person {
  if (!drugdje) return ovdje
  const ime = ovdje.name || drugdje.name

  /*
   * Podaci osobe (ime, profil, bolesti) idu kao jedna cjelina jer se mijenjaju
   * rijetko i zajedno; dnevnik i mjerenja idu dan po dan jer se mijenjaju stalno
   * i neovisno.
   */
  const osnovaPodaci = osnova ? bezDnevnika(osnova) : undefined
  const ovdjePodaci = bezDnevnika(ovdje)
  const drugdjePodaci = bezDnevnika(drugdje)

  const podaci =
    odluci(osnovaPodaci, ovdjePodaci, drugdjePodaci, `podaci osobe ${ime}`, b) ?? ovdjePodaci

  const mjerenja = spojiMapu(
    osnova ? poDatumu(osnova.measurements) : undefined,
    poDatumu(ovdje.measurements),
    poDatumu(drugdje.measurements),
    (d) => `mjerenje ${ime} ${d}`,
    b,
  )

  return {
    ...(podaci as Omit<Person, 'log' | 'measurements'>),
    log: spojiMapu(osnova?.log, ovdje.log, drugdje.log, (d) => `dnevnik ${ime} ${d}`, b),
    measurements: Object.values(mjerenja).sort((x, y) => x.date.localeCompare(y.date)),
  }
}

/**
 * Spaja stanja i vraća rezultat sa sažetkom.
 *
 * `osnova` je stanje kakvo je bilo pri zadnjem uspješnom usklađivanju. Kad je
 * nema (prvo spajanje), sve što postoji na obje strane a razlikuje se broji se
 * kao sukob — namjerno oprezno, jer se bez osnove ne zna tko je što obrisao.
 */
export function spoji(osnova: AppState | null, ovdje: AppState, drugdje: AppState): SpojIshod {
  const b: Brojac = { ovdje: 0, drugdje: 0, sukobi: [] }

  const osobe: Person[] = []
  const vidjene = new Set<string>()
  const drugdjeOsobe = new Map(drugdje.profiles.map((p) => [p.id, p]))
  const osnovaOsobe = new Map((osnova?.profiles ?? []).map((p) => [p.id, p]))

  for (const osoba of ovdje.profiles) {
    vidjene.add(osoba.id)
    const njihova = drugdjeOsobe.get(osoba.id)
    const bila = osnovaOsobe.get(osoba.id)
    // Osoba koje nema kod njih, a bila je u osnovi — obrisali su je.
    if (!njihova && bila && jednako(osoba, bila)) {
      b.drugdje++
      continue
    }
    osobe.push(spojiOsobu(bila, osoba, njihova, b))
  }
  for (const osoba of drugdje.profiles) {
    if (vidjene.has(osoba.id)) continue
    const bila = osnovaOsobe.get(osoba.id)
    // Nema je kod nas, a bila je u osnovi — mi smo je obrisali.
    if (bila && jednako(osoba, bila)) {
      b.ovdje++
      continue
    }
    osobe.push(osoba)
    b.drugdje++
  }

  const state: AppState = {
    ...ovdje,
    profiles: osobe.length ? osobe : ovdje.profiles,
    households: spojiPopis<Household>(
      osnova?.households,
      ovdje.households,
      drugdje.households,
      (h) => `kućanstvo ${h.name ?? h.id}`,
      b,
    ),
    menus: spojiPopis<Menu>(
      osnova?.menus,
      ovdje.menus,
      drugdje.menus,
      (m) => `jelovnik ${m.title ?? m.id}`,
      b,
    ),
    weeks: spojiPopis<WeekPlan>(
      osnova?.weeks,
      ovdje.weeks,
      drugdje.weeks,
      (w) => `tjedan ${w.title ?? w.id}`,
      b,
    ),
    recipes: spojiPopis<Recipe>(
      osnova?.recipes,
      ovdje.recipes,
      drugdje.recipes,
      (r) => `jelo ${r.name}`,
      b,
    ),
    customFoods: spojiPopis<Food>(
      osnova?.customFoods,
      ovdje.customFoods,
      drugdje.customFoods,
      (f) => `namirnica ${f.name}`,
      b,
    ),
    /*
     * Izmjene ugradenih namirnica nisu jedna mapa nego pet, pa se svaka spaja
     * zasebno: preimenovanje i promjena kategorije iste namirnice na dva uredaja
     * time nisu sukob.
     */
    overrides: {
      names: spojiMapu(
        osnova?.overrides.names,
        ovdje.overrides.names,
        drugdje.overrides.names,
        (id) => `naziv namirnice ${id}`,
        b,
      ),
      cats: spojiMapu(
        osnova?.overrides.cats,
        ovdje.overrides.cats,
        drugdje.overrides.cats,
        (id) => `kategorija namirnice ${id}`,
        b,
      ),
      vals: spojiMapu(
        osnova?.overrides.vals,
        ovdje.overrides.vals,
        drugdje.overrides.vals,
        (id) => `vrijednosti namirnice ${id}`,
        b,
      ),
      servs: spojiMapu(
        osnova?.overrides.servs,
        ovdje.overrides.servs,
        drugdje.overrides.servs,
        (id) => `porcija namirnice ${id}`,
        b,
      ),
      // Sakrivene namirnice su popis bez id-a: unija je jedino sigurno.
      hidden: [...new Set([...ovdje.overrides.hidden, ...drugdje.overrides.hidden])],
    },
    /*
     * Odabrana osoba je postavka OVOG uređaja, ne zajednički podatak: na
     * mobitelu gledam sebe dok žena na svom gleda sebe. Ne spaja se.
     */
    activeProfileId: ovdje.activeProfileId,
    updatedAt: Math.max(ovdje.updatedAt ?? 0, drugdje.updatedAt ?? 0),
  }

  return { state, ovdje: b.ovdje, drugdje: b.drugdje, sukobi: b.sukobi }
}
