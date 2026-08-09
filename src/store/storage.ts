import { LEGACY_KEYS, STORAGE_KEY } from '../domain/constants'
import { emptyState, migrateState, pruneState } from '../domain/migrate'
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
 * Učitava stanje: prvo v3, pa redom stari ključevi. Stari se ne brišu — ostaju
 * kao sigurnosna kopija dok korisnik sam ne odluči drukčije.
 */
export function loadState(): LoadResult {
  const current = read(STORAGE_KEY)
  if (current) return { state: migrateState(current), from: STORAGE_KEY, migrated: false }

  for (const key of LEGACY_KEYS) {
    const legacy = read(key)
    if (legacy) return { state: migrateState(legacy), from: key, migrated: true }
  }

  return { state: emptyState(), from: null, migrated: false }
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
