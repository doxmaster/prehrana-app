/**
 * Prijava Google računom i jedna datoteka u Driveu kao obiteljski spremnik.
 *
 * Zašto Drive, a ne vlastiti poslužitelj: podaci o prehrani obitelji ostaju u
 * vlasništvu obitelji. Nema računa kod mene, nema baze koju netko treba čuvati
 * ni gasiti, a aplikacija ostaje statična stranica.
 *
 * Zašto opseg `drive.file`, a ne `drive`: `drive.file` daje pristup ISKLJUČIVO
 * datotekama koje je ova aplikacija sama stvorila ili koje je korisnik izričito
 * odabrao. Aplikacija ne može ni vidjeti ostatak Drivea. Uz to je to jedini
 * način da se izbjegne Googleova provjera aplikacije koja se traži za široke
 * opsege — a ta provjera traje tjednima.
 *
 * Cijena tog izbora: član obitelji kojem je datoteka podijeljena mora je jednom
 * odabrati kroz Googleov birač (Picker), jer je za aplikaciju "tuđa" dok je ne
 * dodirne. To je jedan klik pri pridruživanju i nikad više.
 */

const OPSEG = 'https://www.googleapis.com/auth/drive.file'
const NAZIV_DATOTEKE = 'prehrana-obitelj.json'
const KLJUC_POSTAVKI = 'prehrana_google'

export interface GoogleProfil {
  /** Googleov trajni identifikator korisnika. */
  sub: string
  ime: string
  email: string
  slika?: string
}

export interface GooglePostavke {
  clientId: string
  apiKey: string
  /** Datoteka obitelji; kod vlasnika se popuni sama, kod ostalih preko birača. */
  fileId?: string
}

export class GoogleGreska extends Error {}

/* ---------- postavke ---------- */

export function procitajPostavke(): GooglePostavke {
  let spremljeno: Partial<GooglePostavke> = {}
  try {
    spremljeno = JSON.parse(localStorage.getItem(KLJUC_POSTAVKI) ?? '{}') as GooglePostavke
  } catch {
    // Pokvaren zapis ne smije srusiti karticu Postavke.
  }
  return {
    // Vrijednost iz builda je zadana, a rucni upis je nadjacava — tako se moze
    // isprobati bez ponovne gradnje.
    clientId: spremljeno.clientId || (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''),
    apiKey: spremljeno.apiKey || (import.meta.env.VITE_GOOGLE_API_KEY ?? ''),
    ...(spremljeno.fileId ? { fileId: spremljeno.fileId } : {}),
  }
}

export function zapisiPostavke(izmjena: Partial<GooglePostavke>): GooglePostavke {
  const sljedece = { ...procitajPostavke(), ...izmjena }
  try {
    localStorage.setItem(KLJUC_POSTAVKI, JSON.stringify(sljedece))
  } catch {
    // Bez pamcenja postavki prijava i dalje radi, samo se ponavlja.
  }
  return sljedece
}

/* ---------- učitavanje Googleovih skripti ---------- */

const ucitane = new Map<string, Promise<void>>()

/**
 * Googleove knjižnice dolaze s njihove domene i ne mogu se ugraditi u build.
 * Zato se učitavaju tek kad korisnik prvi put klikne prijavu — tko sinkronizaciju
 * ne koristi, ne povlači ništa. U Claude artefaktu ovo neće proći (stroga
 * pravila izvora), pa se ondje sinkronizacija uredno onemogući.
 */
function ucitajSkriptu(src: string): Promise<void> {
  const postojeca = ucitane.get(src)
  if (postojeca) return postojeca
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.async = true
    el.onload = () => resolve()
    el.onerror = () =>
      reject(new GoogleGreska('Googleove skripte se ne mogu učitati s ove stranice.'))
    document.head.appendChild(el)
  })
  ucitane.set(src, p)
  return p
}

interface TokenOdgovor {
  access_token?: string
  error?: string
}
interface TokenKlijent {
  requestAccessToken(opcije?: { prompt?: string }): void
  callback: (odgovor: TokenOdgovor) => void
}
interface GoogleGlobal {
  accounts: {
    oauth2: {
      initTokenClient(o: {
        client_id: string
        scope: string
        callback: (o: TokenOdgovor) => void
      }): TokenKlijent
      revoke(token: string, gotovo: () => void): void
    }
  }
  picker: unknown
}

const googleGlobal = () => (window as unknown as { google?: GoogleGlobal }).google

/* ---------- prijava ---------- */

let token: string | null = null
let klijent: TokenKlijent | null = null

/**
 * Traži pristup. `tiho` pokušava bez pitanja (kad je korisnik već pristao);
 * pri prvom spajanju mora se otvoriti Googleov prozor, pa `tiho` izostaje.
 */
export async function pristup(tiho = false): Promise<string> {
  const { clientId } = procitajPostavke()
  if (!clientId) throw new GoogleGreska('Nije upisan Google client ID.')

  await ucitajSkriptu('https://accounts.google.com/gsi/client')
  const g = googleGlobal()
  if (!g) throw new GoogleGreska('Googleova prijava nije dostupna.')

  return new Promise<string>((resolve, reject) => {
    klijent ??= g.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: OPSEG,
      callback: () => {
        /* zamijenjeno prije svakog poziva */
      },
    })
    klijent.callback = (odgovor) => {
      if (odgovor.access_token) {
        token = odgovor.access_token
        resolve(odgovor.access_token)
      } else {
        reject(new GoogleGreska(odgovor.error ?? 'Prijava nije dovršena.'))
      }
    }
    klijent.requestAccessToken(tiho ? { prompt: '' } : {})
  })
}

export function odjava(): void {
  const g = googleGlobal()
  if (token && g) g.accounts.oauth2.revoke(token, () => {})
  token = null
}

export const prijavljen = () => token !== null

/* ---------- Drive ---------- */

async function drive<T>(put: string, opcije: RequestInit = {}): Promise<T> {
  if (!token) throw new GoogleGreska('Nisi prijavljen.')
  const odgovor = await fetch(`https://www.googleapis.com/${put}`, {
    ...opcije,
    headers: { Authorization: `Bearer ${token}`, ...(opcije.headers ?? {}) },
  })
  if (!odgovor.ok) {
    const tekst = await odgovor.text()
    throw new GoogleGreska(`Google je odbio zahtjev (${odgovor.status}). ${tekst.slice(0, 200)}`)
  }
  return (odgovor.status === 204 ? null : await odgovor.json()) as T
}

export async function profil(): Promise<GoogleProfil> {
  const p = await drive<{ sub: string; name?: string; email?: string; picture?: string }>(
    'oauth2/v3/userinfo',
  )
  return {
    sub: p.sub,
    ime: p.name ?? p.email ?? 'Bez imena',
    email: p.email ?? '',
    ...(p.picture ? { slika: p.picture } : {}),
  }
}

/** Traži datoteku koju je ova aplikacija ranije stvorila na ovom računu. */
export async function nadiDatoteku(): Promise<string | null> {
  const rez = await drive<{ files: { id: string; name: string }[] }>(
    `drive/v3/files?q=${encodeURIComponent(`name='${NAZIV_DATOTEKE}' and trashed=false`)}&fields=files(id,name)`,
  )
  return rez.files[0]?.id ?? null
}

export async function stvoriDatoteku(sadrzaj: string): Promise<string> {
  const granica = 'prehrana-granica'
  const tijelo =
    `--${granica}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify({ name: NAZIV_DATOTEKE, mimeType: 'application/json' })}\r\n` +
    `--${granica}\r\nContent-Type: application/json\r\n\r\n${sadrzaj}\r\n--${granica}--`

  const rez = await drive<{ id: string }>('upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${granica}` },
    body: tijelo,
  })
  return rez.id
}

export async function procitajDatoteku(fileId: string): Promise<string> {
  if (!token) throw new GoogleGreska('Nisi prijavljen.')
  const odgovor = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!odgovor.ok) throw new GoogleGreska(`Datoteka se ne može pročitati (${odgovor.status}).`)
  return odgovor.text()
}

export async function zapisiDatoteku(fileId: string, sadrzaj: string): Promise<void> {
  await drive(`upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: sadrzaj,
  })
}

/** Daje članu obitelji pravo pisanja po datoteci. */
export async function podijeli(fileId: string, email: string): Promise<void> {
  await drive(`drive/v3/permissions?fileId=${fileId}&sendNotificationEmail=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'writer', type: 'user', emailAddress: email }),
  })
}

/* ---------- pridruživanje preko birača ---------- */

interface PickerBuilder {
  addView(v: unknown): PickerBuilder
  setOAuthToken(t: string): PickerBuilder
  setDeveloperKey(k: string): PickerBuilder
  setCallback(cb: (d: { action: string; docs?: { id: string }[] }) => void): PickerBuilder
  build(): { setVisible(v: boolean): void }
}
interface GapiGlobal {
  load(sto: string, cb: () => void): void
}

/**
 * Otvara Googleov birač da član obitelji odabere datoteku koju mu je vlasnik
 * podijelio. Bez toga aplikacija tu datoteku ne smije ni vidjeti — to je cijena
 * uskog opsega i, po meni, dobra cijena.
 */
export async function odaberiDatoteku(): Promise<string | null> {
  const { apiKey } = procitajPostavke()
  if (!apiKey) throw new GoogleGreska('Nije upisan Google API ključ (potreban za odabir datoteke).')
  if (!token) await pristup()

  await ucitajSkriptu('https://apis.google.com/js/api.js')
  const gapi = (window as unknown as { gapi?: GapiGlobal }).gapi
  if (!gapi) throw new GoogleGreska('Googleov birač nije dostupan.')

  await new Promise<void>((r) => gapi.load('picker', () => r()))
  const picker = (
    window as unknown as {
      google?: { picker?: Record<string, new () => PickerBuilder & Record<string, unknown>> }
    }
  ).google?.picker as unknown as {
    PickerBuilder: new () => PickerBuilder
    DocsView: new () => { setIncludeFolders(v: boolean): unknown; setMode(m: unknown): unknown }
    ViewId: { DOCS: unknown }
    Action: { PICKED: string }
  }
  if (!picker) throw new GoogleGreska('Googleov birač nije dostupan.')

  return new Promise<string | null>((resolve) => {
    const view = new picker.DocsView()
    new picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token!)
      .setDeveloperKey(apiKey)
      .setCallback((d) => {
        if (d.action === picker.Action.PICKED) resolve(d.docs?.[0]?.id ?? null)
        else if (d.action === 'cancel') resolve(null)
      })
      .build()
      .setVisible(true)
  })
}
