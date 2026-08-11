import type { Category, Food, NutrientKey, Nutrients, Person, Targets } from './types'

/**
 * Zdravstvena stanja koja mijenjaju prehranu.
 *
 * Sto aplikacija SMIJE tvrditi ogranicava tablica hranjivih tvari: prati se
 * deset vrijednosti, a natrija, slobodnih secera, zasicenih masti, kalija,
 * fosfora, purina i glutena u njoj nema. Gdje podatka nema, ocjena ide po vrsti
 * i nazivu namirnice i to je u sucelju izricito receno (`blind`) — laznu
 * preciznost je gore imati nego nikakvu.
 *
 * Ovo je pomoc pri planiranju, a ne lijecnicki savjet. Granice su opce
 * preporuke; osobne zadaje lijecnik.
 */
export const CONDITION_IDS = [
  'hemokromatoza',
  'dijabetes2',
  'celijakija',
  'laktoza',
  'hipertenzija',
  'kolesterol',
  'giht',
  'bubrezi',
  'osteoporoza',
  'anemija',
] as const

export type ConditionId = (typeof CONDITION_IDS)[number]

/** Koliko je namirnica sporna za neko stanje. */
export type FlagLevel = 'izbjegavaj' | 'oprez'

export interface FoodFlag {
  level: FlagLevel
  /** Zasto — pise se korisniku, pa mora biti razumljivo bez konteksta. */
  why: string
  condition: ConditionId
  conditionName: string
}

/** Gornja dnevna granica koju stanje postavlja umjesto cilja. */
export interface NutrientCap {
  key: NutrientKey
  max: number
  why: string
  condition: ConditionId
  conditionName: string
}

interface ConditionDef {
  id: ConditionId
  name: string
  /** Jednoredni opis za popis stanja. */
  short: string
  /** Gornje granice koje se racunaju iz ciljeva i tjelesne mase. */
  caps?: (t: Targets, ctx: { weight: number }) => Omit<NutrientCap, 'condition' | 'conditionName'>[]
  /** Podizanje cilja (npr. vise kalcija kod osteoporoze). */
  raise?: (t: Targets) => Partial<Nutrients>
  /** Ocjena namirnice; null kad stanje nema primjedbe. */
  rate?: (food: Food) => { level: FlagLevel; why: string } | null
  /** Savjeti koji se ne mogu izvesti iz brojki. */
  advice: string[]
  /** Sto aplikacija ne moze provjeriti. */
  blind?: string
}

/** Naziv bez dijakritika i u malim slovima — usporedbe ne smiju ovisiti o kvacicama. */
function plain(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'd')
}

/** Sadrzi li naziv ijedan od zadanih pojmova (dovoljan je i dio rijeci: "mlijek" hvata "mlijeko"). */
function named(food: Food, ...terms: string[]): boolean {
  const name = plain(food.name)
  return terms.some((t) => name.includes(plain(t)))
}

const isCat = (food: Food, ...cats: Category[]) => cats.includes(food.cat)

const CRVENO_MESO = ['junet', 'govedin', 'svinjet', 'janjet', 'mljeveno meso', 'divlja', 'teletin']
const SUHOMESNATO = ['prsut', 'slanin', 'kulen', 'kobasic', 'salam', 'cvarc', 'suho meso', 'panceta', 'pasteta']
const IZNUTRICE = ['jetr', 'dziger', 'bubrez', 'srce', 'iznutric']
const SKOLJKE = ['dagnj', 'kamenic', 'skolj', 'skamp', 'jastog', 'rak ', 'lignj', 'sipa', 'hobotnic']
const GLUTEN = [
  'kruh', 'tjestenin', 'psenic', 'brasno', 'griz', 'jecam', 'jecmen', 'raz', 'pirov',
  'palacink', 'knedl', 'strukl', 'burek', 'buhtl', 'krafn', 'keks', 'kolac', 'torta',
  'pohan', 'krusn', 'zganc', 'makaron', 'njok', 'pita ', 'pivo', 'krupic', 'kus-kus', 'griz',
]
const SLATKO = ['secer', 'med', 'sirup', 'cokolad', 'sladoled', 'dzem', 'marmelad', 'bombon', 'kolac', 'keks', 'torta', 'krem']
const SLANO = ['prsut', 'slanin', 'kulen', 'kobasic', 'salam', 'cvarc', 'suho meso', 'konzerv', 'cips', 'masline', 'feta', 'ajvar', 'senf', 'kecap', 'juha iz vre']

const DEFS: ConditionDef[] = [
  {
    id: 'hemokromatoza',
    name: 'Hemokromatoza (povišen feritin)',
    short: 'Tijelo zadržava previše željeza — unos željeza se ograničava.',
    caps: (t) => [
      {
        key: 'fe',
        // Kod nakupljanja zeljeza cilj nije pokriti RDA nego ostati nisko;
        // 8 mg je RDA odraslog muskarca i sluzi kao gornja granica.
        max: Math.min(8, t.fe),
        why: 'Kod hemokromatoze se željezo nakuplja, pa se dnevni unos drži nisko.',
      },
    ],
    rate: (food) => {
      if (named(food, 'zeljez') && isCat(food, 'Suplementi')) {
        return { level: 'izbjegavaj', why: 'Dodatak željeza — kod hemokromatoze se ne uzima.' }
      }
      if (named(food, ...IZNUTRICE)) {
        return { level: 'izbjegavaj', why: 'Iznutrice imaju najviše hem-željeza, koje se najlakše apsorbira.' }
      }
      if (food.fe >= 5) {
        return { level: 'izbjegavaj', why: `Vrlo bogato željezom (${food.fe.toFixed(1)} mg/100 g).` }
      }
      if (named(food, ...CRVENO_MESO, ...SKOLJKE)) {
        return { level: 'oprez', why: 'Crveno meso i školjke daju hem-željezo, koje se apsorbira puno bolje od biljnog.' }
      }
      if (food.fe >= 2.5) {
        return { level: 'oprez', why: `Bogato željezom (${food.fe.toFixed(1)} mg/100 g).` }
      }
      return null
    },
    advice: [
      'Čaj ili kava uz obrok smanjuju apsorpciju željeza; vitamin C uz isti obrok je povećava.',
      'Ne uzimati dodatke željeza ni multivitamine sa željezom.',
      'Alkohol dodatno opterećuje jetru i povećava apsorpciju željeza.',
      'Sirove školjke se izbjegavaju zbog rizika od infekcije pri povišenom željezu.',
    ],
    blind: 'Tablica ne razlikuje hem (životinjsko) od nehem željeza, a razlika u apsorpciji je velika.',
  },
  {
    id: 'dijabetes2',
    name: 'Dijabetes tip 2',
    short: 'Pazi se na količinu i vrstu ugljikohidrata te na vlakna.',
    caps: (t) => [
      {
        key: 'c',
        // Oko 45 % energije iz ugljikohidrata — donja granica uobicajenog raspona.
        max: Math.round((0.45 * t.kcal) / 4),
        why: 'Ugljikohidrati se drže pri donjoj granici uobičajenog raspona (oko 45 % energije).',
      },
    ],
    raise: (t) => ({ fib: Math.max(30, t.fib) }),
    rate: (food) => {
      if (isCat(food, 'Pića') && food.c >= 5 && !named(food, 'vino', 'pivo')) {
        return { level: 'izbjegavaj', why: 'Slatko piće diže šećer najbrže od svega.' }
      }
      if (named(food, ...SLATKO) && food.c >= 30) {
        return { level: 'izbjegavaj', why: 'Koncentrirani šećer.' }
      }
      if (food.c >= 60 && food.fib < 5) {
        return { level: 'izbjegavaj', why: `Vrlo puno ugljikohidrata uz malo vlakana (${Math.round(food.c)} g UH, ${food.fib.toFixed(1)} g vlakana).` }
      }
      if (food.c >= 25 && food.fib < 3) {
        return { level: 'oprez', why: `Puno ugljikohidrata uz malo vlakana (${Math.round(food.c)} g UH, ${food.fib.toFixed(1)} g vlakana).` }
      }
      return null
    },
    advice: [
      'Ugljikohidrate rasporediti po obrocima umjesto da se pojedu odjednom.',
      'Uz svaki obrok bjelančevine i vlakna — sporije diže šećer.',
      'Cjelovite žitarice umjesto bijelog brašna; voće cijelo umjesto soka.',
    ],
    blind: 'Slobodni šećeri se ne vode odvojeno od ukupnih ugljikohidrata, a glikemijski indeks se uopće ne prati.',
  },
  {
    id: 'celijakija',
    name: 'Celijakija / bezglutenska prehrana',
    short: 'Bez pšenice, raži i ječma.',
    rate: (food) => {
      if (named(food, 'bezglut', 'bez gluten')) return null
      if (named(food, ...GLUTEN)) {
        return { level: 'izbjegavaj', why: 'Sadrži ili se u pravilu radi od žitarica s glutenom.' }
      }
      if (named(food, 'zob', 'zoben')) {
        return { level: 'oprez', why: 'Zob sama nema gluten, ali je često kontaminirana pšenicom.' }
      }
      return null
    },
    advice: [
      'Kod gotovih proizvoda gleda se deklaracija — gluten se krije u umacima, dodacima i mesnim prerađevinama.',
      'Riža, krumpir, kukuruz, palenta, heljda i kvinoja su sigurne zamjene.',
    ],
    blind: 'Gluten se ne vodi kao podatak; ocjena ide po vrsti i nazivu namirnice.',
  },
  {
    id: 'laktoza',
    name: 'Nepodnošljivost laktoze',
    short: 'Mlijeko slabo, fermentirano obično prolazi.',
    rate: (food) => {
      if (named(food, 'bez laktoz')) return null
      if (named(food, 'mlijek', 'vrhnj', 'sladoled', 'pudingu', 'puding')) {
        return { level: 'izbjegavaj', why: 'Slatko mlijeko i vrhnje imaju najviše laktoze.' }
      }
      if (isCat(food, 'Mliječno i jaja') && !named(food, 'jaj', 'bjelanjak', 'zumanjak')) {
        return { level: 'oprez', why: 'Fermentirano i tvrdo se često podnosi, ali ovisi o osobi.' }
      }
      return null
    },
    advice: [
      'Tvrdi sirovi i jogurt imaju malo laktoze i većina ih podnosi.',
      'Ako se mliječno izbacuje, kalcij treba nadoknaditi drugdje — bademi, sezam, zeleno lisnato, sardine.',
    ],
  },
  {
    id: 'hipertenzija',
    name: 'Povišen krvni tlak',
    short: 'Manje soli, više povrća i kalija.',
    rate: (food) => {
      if (named(food, ...SLANO)) {
        return { level: 'oprez', why: 'Slana namirnica — kod povišenog tlaka se ograničava.' }
      }
      return null
    },
    advice: [
      'Sol do 5 g dnevno; najviše je dolazi iz kruha i mesnih prerađevina, a ne iz slanika.',
      'DASH pristup: puno povrća, voća, cjelovitih žitarica i nemasnog mliječnog.',
    ],
    blind: 'Natrij nije u tablici hranjivih tvari — ocjena ide po vrsti namirnice, ne po izmjerenoj količini soli.',
  },
  {
    id: 'kolesterol',
    name: 'Povišen kolesterol',
    short: 'Manje zasićenih masti, više vlakana.',
    rate: (food) => {
      if (named(food, 'maslac', 'mast ', 'svinjska mast', 'cvarc', 'slanin', 'vrhnj') || food.f >= 40) {
        return { level: 'izbjegavaj', why: 'Vrlo masno, pretežno zasićenim mastima.' }
      }
      if (food.f >= 20 && isCat(food, 'Meso i riba', 'Mliječno i jaja')) {
        return { level: 'oprez', why: `Masna životinjska namirnica (${food.f.toFixed(0)} g masti/100 g).` }
      }
      return null
    },
    advice: [
      'Zobene pahuljice, mahunarke i voće s pektinom snižavaju LDL.',
      'Maslinovo ulje i riba umjesto maslaca i masti.',
    ],
    blind: 'Zasićene masti se ne vode odvojeno od ukupnih, a kolesterola u tablici nema.',
  },
  {
    id: 'giht',
    name: 'Giht (povišena mokraćna kiselina)',
    short: 'Manje purina — iznutrice, plava riba, školjke, alkohol.',
    rate: (food) => {
      if (named(food, ...IZNUTRICE)) {
        return { level: 'izbjegavaj', why: 'Iznutrice su najbogatije purinima.' }
      }
      if (named(food, 'sardin', 'incun', 'srdel', 'harin', 'skus', ...SKOLJKE)) {
        return { level: 'izbjegavaj', why: 'Plava riba i školjke imaju puno purina.' }
      }
      if (named(food, 'pivo')) {
        return { level: 'izbjegavaj', why: 'Pivo diže mokraćnu kiselinu i preko purina i preko alkohola.' }
      }
      if (named(food, ...CRVENO_MESO, ...SUHOMESNATO)) {
        return { level: 'oprez', why: 'Crveno meso i prerađevine povećavaju mokraćnu kiselinu.' }
      }
      return null
    },
    advice: [
      'Puno tekućine — najmanje 2 litre vode dnevno.',
      'Alkohol, a posebno pivo, izaziva napadaje.',
      'Slatka pića s fruktozom dižu mokraćnu kiselinu jednako kao meso.',
    ],
    blind: 'Purini nisu u tablici — ocjena ide po vrsti namirnice.',
  },
  {
    id: 'bubrezi',
    name: 'Kronična bubrežna bolest',
    short: 'Bjelančevine se ograničavaju, a količinu zadaje nefrolog.',
    caps: (_t, { weight }) => [
      {
        key: 'p',
        // Uobicajena preporuka kod ocuvane funkcije je oko 0,8 g/kg.
        max: Math.round(0.8 * weight),
        why: 'Kod bubrežne bolesti bjelančevine se u pravilu drže oko 0,8 g po kilogramu.',
      },
    ],
    rate: (food) => {
      if (food.p >= 25 && isCat(food, 'Meso i riba', 'Mliječno i jaja')) {
        return { level: 'oprez', why: `Vrlo bogato bjelančevinama (${food.p.toFixed(0)} g/100 g).` }
      }
      return null
    },
    advice: [
      'Točnu količinu bjelančevina, kalija i fosfora zadaje nefrolog — ovo je samo gruba granica.',
      'Pazi na sol; kod bubrega ona povlači i tlak.',
    ],
    blind: 'Kalij i fosfor, koji su kod bubrega ključni, nisu u tablici hranjivih tvari.',
  },
  {
    id: 'osteoporoza',
    name: 'Osteoporoza',
    short: 'Više kalcija i vitamina D.',
    raise: (t) => ({ ca: Math.max(1200, t.ca), vd: Math.max(20, t.vd) }),
    advice: [
      'Kalcij se bez vitamina D slabo iskorištava — zimi se D često mora nadoknaditi.',
      'Opterećenje kostiju hodanjem i vježbama snage djeluje jednako koliko i prehrana.',
    ],
  },
  {
    id: 'anemija',
    name: 'Anemija zbog manjka željeza',
    short: 'Više željeza, i to uz vitamin C.',
    raise: (t) => ({ fe: Math.round(t.fe * 1.8) }),
    advice: [
      'Uz obrok sa željezom uzeti vitamin C (paprika, agrumi, rajčica) — apsorpcija raste višestruko.',
      'Čaj, kava i mliječno uz isti obrok smanjuju apsorpciju; ostaviti razmak od sat vremena.',
    ],
    blind: 'Tablica ne razlikuje hem od nehem željeza.',
  },
]

const BY_ID = new Map(DEFS.map((d) => [d.id, d]))

export const CONDITIONS = DEFS.map(({ id, name, short, advice, blind }) => ({ id, name, short, advice, blind }))

export function conditionName(id: ConditionId): string {
  return BY_ID.get(id)?.name ?? id
}

/** Stanja koja se medusobno iskljucuju — korisniku se to mora reci, ne presutjeti. */
export const CONDITION_CONFLICTS: { a: ConditionId; b: ConditionId; why: string }[] = [
  {
    a: 'hemokromatoza',
    b: 'anemija',
    why: 'Hemokromatoza traži manje željeza, anemija više. Zajedno se poništavaju — koje vrijedi, zna samo liječnik.',
  },
]

export function conflictsIn(ids: readonly ConditionId[]): typeof CONDITION_CONFLICTS {
  const set = new Set(ids)
  return CONDITION_CONFLICTS.filter((c) => set.has(c.a) && set.has(c.b))
}

/** Stanja osobe, ociscena od nepoznatih oznaka. */
export function personConditions(person: Person | undefined): ConditionId[] {
  return (person?.conditions ?? []).filter((id): id is ConditionId => BY_ID.has(id as ConditionId))
}

export interface ConditionPlan {
  /** Ciljevi s podignutim vrijednostima (npr. vise kalcija). */
  targets: Targets
  /** Gornje granice; kod njih vise NIJE bolje. */
  caps: NutrientCap[]
  advice: { condition: ConditionId; conditionName: string; lines: string[]; blind?: string }[]
}

/**
 * Prilagodava dnevne ciljeve stanjima osobe.
 *
 * Podizanja se primjenjuju na cilj (vise kalcija kod osteoporoze), a granice se
 * vode odvojeno jer im je smisao suprotan: cilj se zeli dosegnuti, granica ne
 * prijeci. Kad dva stanja diraju istu vrijednost, uzima se stroza granica.
 */
export function conditionPlan(targets: Targets, person: Person | undefined, weight: number): ConditionPlan {
  const ids = personConditions(person)
  const next: Targets = { ...targets }
  const caps: NutrientCap[] = []
  const advice: ConditionPlan['advice'] = []

  for (const id of ids) {
    const def = BY_ID.get(id)
    if (!def) continue

    if (def.raise) Object.assign(next, def.raise(next))

    for (const cap of def.caps?.(next, { weight }) ?? []) {
      const existing = caps.find((c) => c.key === cap.key)
      if (existing) {
        if (cap.max < existing.max) Object.assign(existing, cap, { condition: id, conditionName: def.name })
        continue
      }
      caps.push({ ...cap, condition: id, conditionName: def.name })
    }

    const entry: ConditionPlan['advice'][number] = { condition: id, conditionName: def.name, lines: def.advice }
    if (def.blind) entry.blind = def.blind
    advice.push(entry)
  }

  // Granica nadjacava cilj: kod hemokromatoze cilj za zeljezo nema smisla drzati
  // iznad granice jer bi napredak prema njemu izgledao kao nesto dobro.
  for (const cap of caps) next[cap.key] = Math.min(next[cap.key], cap.max)

  return { targets: next, caps, advice }
}

/** Sve primjedbe na namirnicu, od najtezih prema lakima. */
export function rateFood(food: Food, ids: readonly ConditionId[]): FoodFlag[] {
  const flags: FoodFlag[] = []
  for (const id of ids) {
    const def = BY_ID.get(id)
    const hit = def?.rate?.(food)
    if (def && hit) flags.push({ ...hit, condition: id, conditionName: def.name })
  }
  return flags.sort((a, b) => (a.level === b.level ? 0 : a.level === 'izbjegavaj' ? -1 : 1))
}

/** Najteza primjedba na namirnicu — dovoljna za oznaku u popisu. */
export function worstFlag(food: Food, ids: readonly ConditionId[]): FoodFlag | undefined {
  return rateFood(food, ids)[0]
}

/**
 * Ocjena jela: gleda i gotovo jelo i svaki sastojak.
 *
 * Vrijednosti na 100 g gotovog jela ne otkrivaju sve — sarma ima malo
 * ugljikohidrata po 100 g, ali u sebi ima rizu, a jelo s dvije zlice brasna
 * ostaje glutensko koliko i kruh. Zato se sastojci ocjenjuju odvojeno, a u
 * obrazlozenju stoji koji je sastojak sporan.
 */
export function rateDish(
  dish: Food,
  ingredients: readonly Food[],
  ids: readonly ConditionId[],
): FoodFlag[] {
  const flags = rateFood(dish, ids)
  for (const part of ingredients) {
    for (const flag of rateFood(part, ids)) {
      flags.push({ ...flag, why: `${part.name} — ${flag.why}` })
    }
  }

  // Po stanju ostaje samo najteza primjedba; deset redaka o istoj stvari nikome
  // ne pomaze pri biranju jela.
  const best = new Map<ConditionId, FoodFlag>()
  for (const flag of flags) {
    const existing = best.get(flag.condition)
    if (!existing || (existing.level === 'oprez' && flag.level === 'izbjegavaj')) {
      best.set(flag.condition, flag)
    }
  }
  return [...best.values()].sort((a, b) => (a.level === b.level ? 0 : a.level === 'izbjegavaj' ? -1 : 1))
}

export interface CapBreach {
  cap: NutrientCap
  value: number
}

/** Prekoracene granice za zadani dan. */
export function capBreaches(totals: Nutrients, caps: readonly NutrientCap[]): CapBreach[] {
  return caps
    .filter((cap) => totals[cap.key] > cap.max)
    .map((cap) => ({ cap, value: totals[cap.key] }))
}
