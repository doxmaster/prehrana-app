import { spoji, type SpojIshod } from '../domain/sync'
import { migrateState } from '../domain/migrate'
import { buildExport } from '../store/storage'
import { useAppStore } from '../store/useAppStore'
import * as google from './google'
import type { AppState } from '../domain/types'

/**
 * Usklađivanje s obiteljskom datotekom na Driveu.
 *
 * Redoslijed je bitan i namjeran:
 *   1. povuci tuđe stanje
 *   2. SPOJI ga s ovim (trostruko, vidi domain/sync.ts)
 *   3. primijeni spojeno kroz replaceAll — time nastaje sigurnosna kopija i
 *      korak za poništavanje, isto kao kod uvoza
 *   4. tek onda vrati spojeno na Drive
 *   5. zapamti spojeno kao osnovu za sljedeći put
 *
 * Osnova je jedino što omogućuje da se brisanje razlikuje od "drugi to još
 * nema". Zato se piše TEK kad je sve ostalo prošlo: prekid na pola ostavlja
 * staru osnovu, pa se sljedeće usklađivanje ponovi umjesto da nešto izgubi.
 */

const KLJUC_OSNOVE = 'prehrana_v3_osnova_sync'

export interface ZadnjiUredio {
  ime: string
  email: string
  at: number
}

export interface UskladIshod extends SpojIshod {
  zadnjiUredio?: ZadnjiUredio
  /** Datoteka je upravo stvorena — prvi uređaj u obitelji. */
  prvaObjava: boolean
}

function procitajOsnovu(): AppState | null {
  try {
    const raw = localStorage.getItem(KLJUC_OSNOVE)
    return raw ? migrateState(JSON.parse(raw)) : null
  } catch {
    // Bez osnove se spaja opreznije (sve razlike su sukobi), ali se ne gubi nista.
    return null
  }
}

function zapisiOsnovu(state: AppState): void {
  try {
    localStorage.setItem(KLJUC_OSNOVE, JSON.stringify(state))
  } catch {
    /*
     * Memorija je puna. Usklađivanje je svejedno prošlo; sljedeći put će se
     * spajati bez osnove, dakle opreznije. Bolje nego prekinuti zahvat.
     */
  }
}

/** Briše osnovu — koristi se pri odjavi i promjeni obitelji. */
export function zaboraviOsnovu(): void {
  try {
    localStorage.removeItem(KLJUC_OSNOVE)
  } catch {
    /* nema se sto napraviti */
  }
}

interface Omotnica {
  state?: unknown
  zadnjiUredio?: ZadnjiUredio
}

function omotaj(state: AppState, tko: google.GoogleProfil, now: Date): string {
  return JSON.stringify(
    {
      ...buildExport(state, now),
      zadnjiUredio: { ime: tko.ime, email: tko.email, at: now.getTime() },
    },
    null,
    2,
  )
}

/**
 * Prolazi cijeli krug i vraća sažetak koji se pokazuje korisniku.
 *
 * Baca s razumljivom porukom; pozivatelj je prikaže i NIŠTA ne mijenja, jer se
 * stanje primjenjuje tek nakon uspješnog spajanja.
 */
export async function uskladi(): Promise<UskladIshod> {
  const now = new Date()
  await google.pristup(google.prijavljen())
  const tko = await google.profil()

  let { fileId } = google.procitajPostavke()
  const lokalno = useAppStore.getState().data

  // Prvi uređaj u obitelji: datoteke još nema, pa je ovo objava, ne spajanje.
  if (!fileId) {
    fileId = (await google.nadiDatoteku()) ?? undefined
    if (!fileId) {
      fileId = await google.stvoriDatoteku(omotaj(lokalno, tko, now))
      google.zapisiPostavke({ fileId })
      zapisiOsnovu(lokalno)
      return {
        state: lokalno,
        ovdje: 0,
        drugdje: 0,
        sukobi: [],
        prvaObjava: true,
        zadnjiUredio: { ime: tko.ime, email: tko.email, at: now.getTime() },
      }
    }
    google.zapisiPostavke({ fileId })
  }

  const tekst = await google.procitajDatoteku(fileId)
  let omotnica: Omotnica
  try {
    omotnica = JSON.parse(tekst) as Omotnica
  } catch {
    throw new google.GoogleGreska(
      'Obiteljska datoteka nije čitljiva — netko ju je izmijenio ručno.',
    )
  }
  if (!omotnica.state) {
    throw new google.GoogleGreska('Obiteljska datoteka ne sadrži podatke Prehrane.')
  }

  const daljinsko = migrateState(omotnica.state)
  const ishod = spoji(procitajOsnovu(), lokalno, daljinsko)

  // Primjena ide kroz replaceAll: sigurnosna kopija i "Poništi" kao kod uvoza.
  useAppStore.getState().replaceAll(ishod.state, `usklađivanje s obitelji (${tko.ime})`)

  await google.zapisiDatoteku(fileId, omotaj(ishod.state, tko, now))
  zapisiOsnovu(ishod.state)

  return {
    ...ishod,
    prvaObjava: false,
    ...(omotnica.zadnjiUredio ? { zadnjiUredio: omotnica.zadnjiUredio } : {}),
  }
}

/**
 * Povezuje prijavljeni Google račun s osobom u aplikaciji.
 *
 * Ako osoba s tim računom već postoji, samo joj se osvježi ime i slika. Inače se
 * uzima trenutno odabrana osoba ako još nosi zadano ime ("Osoba 1"), jer je to
 * gotovo uvijek onaj tko se upravo prijavio. U protivnom se dodaje nova osoba —
 * radije jedna suvišna nego preimenovana tuđa.
 */
export function povezisOsobom(tko: google.GoogleProfil): 'osvjezena' | 'preuzeta' | 'nova' {
  let ishod: 'osvjezena' | 'preuzeta' | 'nova' = 'nova'

  useAppStore.getState().update((draft) => {
    const postojeca = draft.profiles.find((p) => p.googleSub === tko.sub)
    if (postojeca) {
      postojeca.name = tko.ime
      if (tko.slika) postojeca.slika = tko.slika
      ishod = 'osvjezena'
      return
    }

    const odabrana = draft.profiles.find((p) => p.id === draft.activeProfileId)
    const zadanoIme = /^Osoba \d+$/.test(odabrana?.name ?? '')
    if (odabrana && zadanoIme && !odabrana.googleSub) {
      odabrana.name = tko.ime
      odabrana.googleSub = tko.sub
      if (tko.slika) odabrana.slika = tko.slika
      ishod = 'preuzeta'
      return
    }

    const nova = structuredClone(draft.profiles[0]!)
    nova.id = `p${Date.now().toString(36)}`
    nova.name = tko.ime
    nova.googleSub = tko.sub
    if (tko.slika) nova.slika = tko.slika
    nova.log = {}
    nova.measurements = []
    draft.profiles.push(nova)
    draft.activeProfileId = nova.id
    ishod = 'nova'
  }, 'povezivanje Google računa')

  return ishod
}
