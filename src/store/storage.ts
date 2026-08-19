import { LEGACY_KEYS, STORAGE_KEY } from '../domain/constants'
import { emptyState, migrateState, pruneState } from '../domain/migrate'
import { STARTER_RECIPES } from '../data/recipes'
import { STARTER_MENUS, STARTER_WEEKS } from '../data/menus'
import type { AppState } from '../domain/types'

export interface LoadResult {
  state: AppState
  /** Iz kojeg je ključa stanje pročitano — null kad je počelo prazno. */
  from: string | null
  /** Podaci su zatečeni u starom formatu i migrirani. */
  migrated: boolean
}

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn(`Neuspjelo čitanje ${key}`, err)
    return null
  }
}

/**
 * Dopunjava katalog jela receptima koje aplikacija u međuvremenu dobila.
 *
 * Katalog je sadržaj aplikacije, ne korisnički unos — nema načina da se recept
 * obriše pojedinačno. Zato se, za razliku od jelovnika, smije dopuniti sam:
 * inače bi stanje složeno prije nekog izdanja zauvijek ostalo na starom broju
 * jela. Postojeći recept s istim id-om se ne dira.
 */
function mergeStarterRecipes(state: AppState): AppState {
  const have = new Set(state.recipes.map((r) => r.id))
  const missing = STARTER_RECIPES.filter((r) => !have.has(r.id))
  if (missing.length) state.recipes.push(...structuredClone(missing))
  return state
}

/**
 * Učitava stanje: prvo v3, pa redom stari ključevi. Stari se ne brišu — ostaju
 * kao sigurnosna kopija dok korisnik sam ne odluči drukčije.
 */
export function loadState(): LoadResult {
  const current = read(STORAGE_KEY)
  if (current) {
    return { state: mergeStarterRecipes(migrateState(current)), from: STORAGE_KEY, migrated: false }
  }

  for (const key of LEGACY_KEYS) {
    const legacy = read(key)
    if (legacy)
      return { state: mergeStarterRecipes(migrateState(legacy)), from: key, migrated: true }
  }

  // Prvi start: ponudi domaca jela, dnevne jelovnike i sezonske tjedne. Postojeci
  // korisnici ih ne dobivaju naknadno da im se ne bi vracalo ono sto su obrisali.
  const fresh = emptyState()
  fresh.recipes = structuredClone(STARTER_RECIPES)
  fresh.menus = structuredClone(STARTER_MENUS)
  fresh.weeks = structuredClone(STARTER_WEEKS)
  return { state: fresh, from: null, migrated: false }
}

export type SaveOutcome = { ok: true } | { ok: false; reason: 'quota' | 'unknown'; error: unknown }

export function saveState(state: AppState): SaveOutcome {
  pruneState(state)
  state.updatedAt = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return { ok: true }
  } catch (error) {
    const quota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    return { ok: false, reason: quota ? 'quota' : 'unknown', error }
  }
}

/**
 * Omotnica izvoza.
 *
 * Sami podaci nisu dovoljni: bez datuma i sazetka ne zna se koja je od pet
 * datoteka u preuzimanjima novija ni sto je u njoj, a to je upravo trenutak kad
 * sigurnosna kopija treba biti ocita. `format` postoji da se sutra moze
 * promijeniti oblik bez razbijanja starih kopija.
 */
export interface ExportEnvelope {
  app: 'prehrana'
  format: 1
  exportedAt: string
  summary: {
    osoba: number
    danaSUnosom: number
    jelovnika: number
    tjedana: number
    recepata: number
    vlastitihNamirnica: number
  }
  state: AppState
}

export function buildExport(state: AppState, now = new Date()): ExportEnvelope {
  return {
    app: 'prehrana',
    format: 1,
    exportedAt: now.toISOString(),
    summary: {
      osoba: state.profiles.length,
      danaSUnosom: state.profiles.reduce((sum, p) => sum + Object.keys(p.log).length, 0),
      jelovnika: state.menus.length,
      tjedana: state.weeks.length,
      recepata: state.recipes.length,
      vlastitihNamirnica: state.customFoods.length,
    },
    state,
  }
}

export function exportState(state: AppState, now = new Date()): Blob {
  return new Blob([JSON.stringify(buildExport(state, now), null, 2)], { type: 'application/json' })
}

/** Naziv datoteke s datumom — inace se kopije u preuzimanjima ne razlikuju. */
export function exportFilename(now = new Date()): string {
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return `prehrana-${d}.json`
}

/**
 * Trag o zadnjoj kopiji koja postoji izvan preglednika.
 *
 * Stoji pokraj podataka, ne u njima: inace bi svaki izvoz mijenjao ono sto
 * izvozi, pa dvije uzastopne kopije istog stanja ne bi bile jednake.
 *
 * Uz datum se pamti i `dataAt` — koliko su podaci bili stari u trenutku kopije.
 * Bez toga se ne moze razlikovati "kopija je stara, ali se od tada nista nije
 * mijenjalo" od "kopija je stara i podaci su otisli dalje", a samo je drugo
 * razlog za uzbunu.
 */
const EXPORT_KEY = `${STORAGE_KEY}_zadnji_izvoz`

export interface ExportMark {
  /** Kad je kopija nastala (ISO). Kod uvoza: datum iz same datoteke. */
  at: string
  /** `updatedAt` podataka koje ta kopija sadrzi. */
  dataAt: number
}

export function readExportMark(): ExportMark | null {
  try {
    const raw = localStorage.getItem(EXPORT_KEY)
    if (!raw) return null
    // Prvo izdanje je pisalo goli ISO datum; tada se stanje podataka ne zna.
    if (!raw.startsWith('{')) return { at: raw, dataAt: 0 }
    const parsed = JSON.parse(raw) as Partial<ExportMark>
    if (typeof parsed.at !== 'string') return null
    return { at: parsed.at, dataAt: typeof parsed.dataAt === 'number' ? parsed.dataAt : 0 }
  } catch {
    return null
  }
}

export function writeExportMark(mark: ExportMark): void {
  try {
    localStorage.setItem(EXPORT_KEY, JSON.stringify(mark))
  } catch {
    // Pamcenje datuma nije vrijedno pada; sama kopija je vec napravljena.
  }
}

export class ImportError extends Error {}

export interface ImportResult {
  state: AppState
  /** Kad je datoteka izvezena; null za stare kopije bez omotnice. */
  exportedAt: string | null
}

/** Čita uvezenu datoteku; baca ImportError s porukom na hrvatskom. */
export function parseImport(text: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return raise('Datoteka nije ispravan JSON.')
  }
  /*
   * Prima i novu omotnicu i goli zapis stanja: starije kopije (i one iz HTML
   * verzije) nemaju omotnicu, a moraju se i dalje moci uvesti.
   */
  const envelope = parsed as { state?: unknown; exportedAt?: unknown } | null
  const omotnica =
    !!envelope &&
    typeof envelope === 'object' &&
    !!envelope.state &&
    typeof envelope.state === 'object'
  const payload = omotnica ? envelope.state : parsed

  const root = payload as { profiles?: unknown } | null
  if (!root || typeof root !== 'object' || !Array.isArray(root.profiles) || !root.profiles.length) {
    return raise('Datoteka ne sadrži nijednu osobu — je li to sigurnosna kopija Prehrane?')
  }
  const exportedAt =
    omotnica &&
    typeof envelope.exportedAt === 'string' &&
    !Number.isNaN(Date.parse(envelope.exportedAt))
      ? envelope.exportedAt
      : null
  return { state: migrateState(payload), exportedAt }
}

function raise(message: string): never {
  throw new ImportError(message)
}

/*
 * Spremanje datoteke iz dva svijeta.
 *
 * U pregledniku je to obicna veza s `download`. Kad aplikacija stoji kao Claude
 * artefakt, ta veza je MRTVA — okvir ne smije sam pokrenuti preuzimanje — pa se
 * ide preko `claude.use('downloads')`, gdje korisnik potvrdi spremanje. Bez
 * ovoga bi izvoz u artefaktu tiho ne radio, a to je jedina obrana od gubitka
 * podataka.
 */
interface ClaudeDownloads {
  save(request: { filename: string; data: Blob }): Promise<{ status: 'saved' }>
}
interface ClaudeHost {
  use(name: 'downloads'): Promise<ClaudeDownloads | null>
}

function claudeHost(): ClaudeHost | null {
  const host = (window as unknown as { claude?: ClaudeHost }).claude
  return host && typeof host.use === 'function' ? host : null
}

export type SpremanjeIshod =
  | { ok: true; nacin: 'preglednik' | 'claude'; filename: string }
  | { ok: false; razlog: 'odbijeno' | 'nije-uspjelo' | 'nema-kanala' }

function vezom(blob: Blob, filename: string): SpremanjeIshod {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return { ok: true, nacin: 'preglednik', filename }
}

const zamjenskiNastavak: Record<string, string> = { csv: 'txt' }

export async function spremiDatoteku(blob: Blob, filename: string): Promise<SpremanjeIshod> {
  const host = claudeHost()
  if (!host) return vezom(blob, filename)

  const downloads = await host.use('downloads').catch(() => null)
  /*
   * Ovdje se NE smije pasti natrag na obicnu vezu.
   *
   * Unutar Claudeova okvira veza s `download` ne radi — klik jednostavno nista
   * ne napravi. Kad bi se ovdje javilo "spremljeno", korisnik bi mislio da ima
   * sigurnosnu kopiju koje nema, a to je gore nego da gumb otvoreno zakaze.
   * Zato se javlja da kanala nema, pa sucelje ponudi rucno kopiranje.
   */
  if (!downloads) return { ok: false, razlog: 'nema-kanala' }

  const pokusaj = async (naziv: string): Promise<SpremanjeIshod> => {
    try {
      await downloads.save({ filename: naziv, data: blob })
      return { ok: true, nacin: 'claude', filename: naziv }
    } catch (err) {
      const code = (err as { code?: string } | null)?.code
      if (code === 'declined') return { ok: false, razlog: 'odbijeno' }
      /*
       * Dio nastavaka (csv) nije svugdje dopusten. Podaci su vazniji od
       * nastavka, pa se isti sadrzaj ponudi kao .txt umjesto da izostane.
       */
      if (code === 'extension_not_enabled') {
        const nastavak = naziv.split('.').pop() ?? ''
        const zamjena = zamjenskiNastavak[nastavak]
        if (zamjena) return pokusaj(naziv.slice(0, -nastavak.length) + zamjena)
      }
      return { ok: false, razlog: 'nije-uspjelo' }
    }
  }
  return pokusaj(filename)
}

/**
 * Sigurnosna kopija prije velikih zahvata (uvoz, brisanje dijelova, obnova).
 *
 * Poništavanje u sucelju drzi samo zadnju promjenu i nestaje sa zatvaranjem
 * kartice. Ovo prezivljava i zatvaranje preglednika, pa je zadnja obrana kad
 * netko uveze krivu datoteku ili obrise vise nego sto je mislio.
 */
const BACKUP_KEY = `${STORAGE_KEY}_prije_zahvata`

export interface SafetyBackup {
  state: AppState
  /** Sto se radilo kad je kopija nastala — pise se korisniku. */
  reason: string
  at: number
}

export function writeSafetyBackup(state: AppState, reason: string): void {
  try {
    const backup: SafetyBackup = { state, reason, at: Date.now() }
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
  } catch {
    // Sigurnosna kopija ne smije srusiti sam zahvat; kad memorije nema,
    // korisnik i dalje ima izvoz u datoteku.
  }
}

export function readSafetyBackup(): SafetyBackup | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: unknown; reason?: unknown; at?: unknown }
    if (!parsed.state) return null
    return {
      state: migrateState(parsed.state),
      reason: typeof parsed.reason === 'string' ? parsed.reason : 'nepoznat zahvat',
      at: typeof parsed.at === 'number' ? parsed.at : 0,
    }
  } catch {
    return null
  }
}
