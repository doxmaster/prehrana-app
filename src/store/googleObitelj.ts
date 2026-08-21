import { create } from 'zustand'
import * as google from '../services/google'
import {
  povezisOsobom,
  uskladi,
  zaboraviOsnovu,
  type UskladIshod,
} from '../services/sinkronizacija'
import { confirmDialog, promptDialog, toast } from './dialogs'
import { useAppStore } from './useAppStore'

/**
 * Stanje spajanja obitelji preko Googlea.
 *
 * Zašto store, a ne stanje u komponenti: isto se nudi na dva mjesta — gumb u
 * zaglavlju i kartica u Postavkama. Da svaka drži svoje, jedna bi pokazivala
 * "prijavljen" a druga "prijavi se", ovisno o tome gdje si kliknuo. Ovako obje
 * gledaju u isti izvor.
 */
interface GoogleObiteljStanje {
  postavke: google.GooglePostavke
  /** Prijavljeni Google račun; null dok se netko ne prijavi. */
  tko: google.GoogleProfil | null
  /** Neki poziv prema Googleu je u tijeku — gumbi se gase. */
  radi: boolean
  zadnje: UskladIshod | null

  podesen: () => boolean
  spremiKljuceve: (izmjena: Partial<google.GooglePostavke>) => void
  prijava: () => Promise<void>
  sinkroniziraj: () => Promise<void>
  pozovi: () => Promise<void>
  pridruzi: () => Promise<void>
  odjava: () => void
}

function greska(err: unknown): void {
  toast(err instanceof google.GoogleGreska ? err.message : 'Nešto nije prošlo. Pokušaj ponovno.')
}

export const useGoogleObitelj = create<GoogleObiteljStanje>((set, get) => ({
  postavke: google.procitajPostavke(),
  tko: null,
  radi: false,
  zadnje: null,

  podesen: () => get().postavke.clientId.length > 0,

  spremiKljuceve: (izmjena) => {
    set({ postavke: google.zapisiPostavke(izmjena) })
    toast('Spremljeno. Sad se možeš prijaviti.')
  },

  prijava: async () => {
    set({ radi: true })
    try {
      await google.pristup()
      const profil = await google.profil()

      /*
       * Drugi sloj brave: i kad Google pusti racun, aplikacija ga prihvaca samo
       * ako je na popisu. Sprjecava i obicnu zabunu — prijavu krivim racunom na
       * zajednickom uredaju.
       */
      const popis = google.dopusteneAdrese()
      if (!google.dopustenEmail(profil.email, popis)) {
        google.odjava()
        toast(
          `${profil.email} nije među dopuštenim računima. Zamoli vlasnika obitelji da tvoju adresu doda.`,
        )
        return
      }

      set({ tko: profil })
      /*
       * Prijava odmah veze Google racun uz osobu u aplikaciji: ime i slika
       * dolaze s profila, pa nitko ne mora rucno upisivati tko je tko, a na
       * svakom uredaju se ista osoba prepozna po istoj adresi.
       */
      const ishod = povezisOsobom(profil)
      toast(
        ishod === 'nova'
          ? `Dodana osoba ${profil.ime}.`
          : ishod === 'preuzeta'
            ? `Osoba preimenovana u ${profil.ime}.`
            : `Prijavljen kao ${profil.ime}.`,
        { label: '↩ Poništi', run: useAppStore.getState().undo },
      )
    } catch (err) {
      greska(err)
    } finally {
      set({ radi: false })
    }
  },

  sinkroniziraj: async () => {
    set({ radi: true })
    try {
      const ishod = await uskladi()
      set({ zadnje: ishod, postavke: google.procitajPostavke() })
      if (ishod.prvaObjava) {
        toast('Obiteljska datoteka stvorena na tvom Driveu.')
        return
      }
      const dijelovi = [
        ishod.drugdje && `${ishod.drugdje} stiglo s drugog uređaja`,
        ishod.ovdje && `${ishod.ovdje} poslano odavde`,
        ishod.sukobi.length && `${ishod.sukobi.length} sukoba`,
      ].filter(Boolean)
      toast(dijelovi.length ? `Usklađeno: ${dijelovi.join(', ')}.` : 'Već je sve usklađeno.', {
        label: '↩ Poništi',
        run: useAppStore.getState().undo,
      })
    } catch (err) {
      greska(err)
    } finally {
      set({ radi: false })
    }
  },

  pozovi: async () => {
    const email = (await promptDialog('E-pošta ukućana kojeg pozivaš (Google račun):'))?.trim()
    if (!email) return
    const { fileId } = google.procitajPostavke()
    if (!fileId) return toast('Prvo se uskladi — datoteka obitelji još ne postoji.')
    set({ radi: true })
    try {
      const pozivatelj = get().tko?.ime ?? 'Netko iz tvoje obitelji'
      await google.podijeli(fileId, email, google.porukaPoziva(pozivatelj, location.origin))
      toast(
        `Poziv poslan na ${email}. U e-pošti piše što treba kliknuti — ` +
          'aplikaciju otvara na istoj adresi i prijavljuje se tim računom.',
      )
    } catch (err) {
      greska(err)
    } finally {
      set({ radi: false })
    }
  },

  pridruzi: async () => {
    set({ radi: true })
    try {
      const fileId = await google.odaberiDatoteku()
      if (!fileId) return
      const ok = await confirmDialog(
        'Pridruživanje obitelji spaja tvoje podatke s obiteljskima.\n\n' +
          'Ništa se ne briše: sve što postoji samo kod tebe ostaje, a razlike se prijavljuju.',
        'Pridruži se',
      )
      if (!ok) return
      // Bez zaboravljanja osnove spoj bi mislio da su tude stavke tvoja brisanja.
      zaboraviOsnovu()
      google.zapisiPostavke({ fileId })
      set({ postavke: google.procitajPostavke() })
      await get().sinkroniziraj()
    } catch (err) {
      greska(err)
    } finally {
      set({ radi: false })
    }
  },

  odjava: () => {
    google.odjava()
    set({ tko: null })
    toast('Odjavljen. Podaci na ovom uređaju ostaju.')
  },
}))
