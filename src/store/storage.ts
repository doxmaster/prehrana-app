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
    if (legacy) return { state: mergeStarterRecipes(migrateState(legacy)), from: key, migrated: true }
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

export function exportState(state: AppState): Blob {
  return new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
}

export class ImportError extends Error {}

/** Čita uvezenu datoteku; baca ImportError s porukom na hrvatskom. */
export function parseImport(text: string): AppState {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return raise('Datoteka nije ispravan JSON.')
  }
  const root = parsed as { profiles?: unknown } | null
  if (!root || typeof root !== 'object' || !Array.isArray(root.profiles) || !root.profiles.length) {
    return raise('Datoteka ne sadrži nijednu osobu — je li to sigurnosna kopija Prehrane?')
  }
  return migrateState(parsed)
}

function raise(message: string): never {
  throw new ImportError(message)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
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
