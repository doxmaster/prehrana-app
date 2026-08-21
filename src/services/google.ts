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

/*
 * Tri opsega, svaki s razlogom:
 *   openid + email + profile — ime i slika osobe, po cemu se clan obitelji
 *     prepozna na svakom uredaju. Bez njih Google odbija citanje profila, pa je
 *     prijava prolazila a odmah zatim padala na "userinfo".
 *   drive.file — iskljucivo datoteke koje je ova aplikacija stvorila ili koje je
 *     korisnik sam odabrao. Ostatak Drivea aplikacija ne vidi.
 *
 * Sva tri su kod Googlea "non-sensitive", pa aplikacija moze biti objavljena
 * bez provjere koja traje tjednima.
 */
const OPSEG = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.file'].join(' ')
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

/**
 * Jesu li kljucevi stigli iz builda, a ne iz rucnog upisa.
 *
 * Objavljena aplikacija ih ima ugradene, pa korisnik nikad ne vidi ni jedno
 * polje — samo gumb "Prijavi se". Rucni upis ostaje za onoga tko aplikaciju
 * postavlja na svoje.
 */
/**
 * Popis adresa kojima je dopusteno usklađivanje, ugraden u build.
 *
 * Prazan popis znaci "svi". Ovo NIJE sigurnosna brava — kod je javan i moze se
 * zaobici; prava brava je popis testnih korisnika u Google konzoli, koji radi
 * na Googleovoj strani. Ovdje sluzi da onaj tko nije pozvan dobije razumljivu
 * recenicu umjesto sirove greske, i da se slucajno ne spoji krivi racun.
 */
export function dopusteneAdrese(): string[] {
  return (import.meta.env.VITE_GOOGLE_DOZVOLJENI ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function dopustenEmail(email: string, popis: readonly string[]): boolean {
  if (!popis.length) return true
  return popis.includes(email.trim().toLowerCase())
}

export function kljuceviUgradeni(): boolean {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').length > 0
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
        reject(new GoogleGreska(porukaPrijave(odgovor.error)))
      }
    }
    klijent.requestAccessToken(tiho ? { prompt: '' } : {})
  })
}

/**
 * Googleova greska prijave u recenicu koja kaze sto se dogodilo.
 *
 * Bez ovoga korisnik dobije toast na kojem doslovno pise "access_denied".
 */
export function porukaPrijave(kod?: string): string {
  if (kod === 'access_denied') {
    return (
      'Ovaj Google račun nema pristup aplikaciji. Ako te netko pozvao u obitelj, ' +
      'zamoli ga da tvoju adresu doda među dopuštene račune.'
    )
  }
  if (kod === 'popup_closed' || kod === 'popup_closed_by_user') {
    return 'Prozor prijave je zatvoren prije kraja.'
  }
  if (kod === 'popup_failed_to_open') {
    return 'Preglednik je blokirao prozor prijave. Dopusti skočne prozore za ovu stranicu.'
  }
  return kod ? `Prijava nije dovršena (${kod}).` : 'Prijava nije dovršena.'
}

export function odjava(): void {
  const g = googleGlobal()
  if (token && g) g.accounts.oauth2.revoke(token, () => {})
  token = null
}

export const prijavljen = () => token !== null

/* ---------- Drive ---------- */

/**
 * Pretvara Googleov odgovor u recenicu koja kaze STO UCINITI.
 *
 * Sirovi JSON ("The user's Drive storage quota has been exceeded") tehnicki je
 * tocan i posve beskoristan onome tko samo zeli spremiti dnevnik. Izdvojeno je
 * kao cista funkcija da se moze testirati bez Googlea.
 */
export function porukaGreske(status: number, tijelo: string): string {
  const razlog = /"reason":\s*"([^"]+)"/.exec(tijelo)?.[1] ?? ''
  const poruka = /"message":\s*"([^"]+)"/.exec(tijelo)?.[1] ?? ''

  if (/storage quota has been exceeded/i.test(tijelo) || razlog === 'storageQuotaExceeded') {
    return (
      'Google Drive ovog računa je pun, pa se datoteka ne može spremiti. ' +
      'Oslobodi malo mjesta (najčešće pomaže isprazniti smeće u Driveu i Gmailu — ' +
      'obrisane datoteke i dalje zauzimaju prostor) ili upotrijebi drugi Google račun.'
    )
  }
  if (status === 401 || razlog === 'authError') {
    return 'Prijava je istekla. Prijavi se ponovno pa pokušaj još jednom.'
  }
  if (status === 403 && /insufficient|scope/i.test(tijelo)) {
    return 'Google nije dao dovoljna prava. Odjavi se i prijavi ponovno, pa pristani na sve stavke.'
  }
  if (/invalidSharingRequest/i.test(tijelo) || razlog === 'invalidSharingRequest') {
    return 'Google ne prihvaća tu adresu za dijeljenje — provjeri je li točna i pripada li Google računu.'
  }
  if (status === 404) {
    return 'Obiteljska datoteka nije nađena — možda je obrisana ili ti pristup više nije dan.'
  }
  if (status === 429 || razlog === 'rateLimitExceeded') {
    return 'Previše zahtjeva prema Googleu u kratko vrijeme. Pričekaj minutu pa pokušaj ponovno.'
  }
  return poruka
    ? `Google je odbio zahtjev (${status}): ${poruka}`
    : `Google je odbio zahtjev (${status}).`
}

async function drive<T>(put: string, opcije: RequestInit = {}): Promise<T> {
  if (!token) throw new GoogleGreska('Nisi prijavljen.')
  const odgovor = await fetch(`https://www.googleapis.com/${put}`, {
    ...opcije,
    headers: { Authorization: `Bearer ${token}`, ...(opcije.headers ?? {}) },
  })
  if (!odgovor.ok) {
    throw new GoogleGreska(porukaGreske(odgovor.status, await odgovor.text()))
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
  if (!odgovor.ok) throw new GoogleGreska(porukaGreske(odgovor.status, await odgovor.text()))
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
/**
 * Putanja za dijeljenje datoteke.
 *
 * Izdvojeno i testirano jer je ovdje vec bila greska koju se tesko primijeti:
 * `fileId` u Drive API-ju ide U PUTANJU, ne kao parametar. S parametrom se
 * pogada nepostojeca adresa, Google vrati 404, a poruka onda krivo tvrdi da
 * datoteka ne postoji.
 */
export function putanjaDijeljenja(fileId: string, poruka?: string): string {
  const p = new URLSearchParams({ sendNotificationEmail: 'true', fields: 'id' })
  // Bez poruke Google salje suhu obavijest da je netko podijelio datoteku
  // "prehrana-obitelj.json" — primatelj nema pojma sto bi s njom.
  if (poruka) p.set('emailMessage', poruka)
  return `drive/v3/files/${encodeURIComponent(fileId)}/permissions?${p.toString()}`
}

/**
 * Tekst poziva u obitelj.
 *
 * Ovo je jedino sto pozvani vidi prije nego otvori aplikaciju, pa mora
 * odgovoriti na tri pitanja odjednom: tko ga zove, kamo da ode i sto ondje da
 * klikne. Datoteka u prilogu se NE otvara rucno — to se izricito kaze, jer je
 * prvi poriv upravo taj, a u njoj je samo zapis podataka.
 */
export function porukaPoziva(pozivatelj: string, adresa: string): string {
  return (
    `${pozivatelj} te poziva u zajedničku Prehranu — obiteljski jelovnik i dnevnik.

` +
    `1. Otvori ${adresa}
` +
    `2. Gore desno klikni "Prijavi se" i prijavi se OVIM Google računom
` +
    `3. U Postavkama klikni "Pridruži se obitelji" i odaberi datoteku prehrana-obitelj.json

` +
    'Priloženu datoteku ne treba otvarati ni preuzimati — u njoj je samo zapis ' +
    'koji aplikacija čita sama.'
  )
}

/** Gruba provjera adrese — da tipfeler ne zavrsi kao Googleova greska. */
export function izgledaKaoEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

export async function podijeli(fileId: string, email: string, poruka?: string): Promise<void> {
  if (!izgledaKaoEmail(email)) {
    throw new GoogleGreska(`"${email}" ne izgleda kao e-mail adresa.`)
  }
  await drive(putanjaDijeljenja(fileId, poruka), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'writer', type: 'user', emailAddress: email.trim() }),
  })
}

/* ---------- pridruživanje preko birača ---------- */

interface PickerBuilder {
  addView(v: unknown): PickerBuilder
  setOAuthToken(t: string): PickerBuilder
  setDeveloperKey(k: string): PickerBuilder
  /** Broj projekta; bez njega odabir ne dodjeljuje pravo na datoteku. */
  setAppId(id: string): PickerBuilder
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
/**
 * Broj projekta iz client ID-a — dio prije crtice.
 *
 * Birac ga trazi kao `appId`: bez njega odabir datoteke NE dodjeljuje
 * aplikaciji pravo na nju, pa se datoteka odabere a citanje svejedno padne.
 * Cita se iz client ID-a da se ne mora upisivati jos jedna vrijednost.
 */
export function brojProjekta(clientId: string): string {
  return clientId.split('-')[0] ?? ''
}

export async function odaberiDatoteku(): Promise<string | null> {
  const { apiKey, clientId } = procitajPostavke()
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
    DocsView: new () => {
      setIncludeFolders(v: boolean): unknown
      setMode(m: unknown): unknown
      setOwnedByMe(v: boolean): { setLabel?(t: string): unknown }
    }
    ViewId: { DOCS: unknown }
    Action: { PICKED: string }
  }
  if (!picker) throw new GoogleGreska('Googleov birač nije dostupan.')

  return new Promise<string | null>((resolve, reject) => {
    /*
     * Dva prikaza, i to je bitno: onaj tko se PRIDRUZUJE obitelji nije vlasnik
     * datoteke — ona je kod njega pod "Dijeljeno sa mnom". Sa samo zadanim
     * prikazom (moj Drive) je jednostavno ne bi nasao.
     */
    const mojDrive = new picker.DocsView()
    mojDrive.setIncludeFolders(false)
    const dijeljeno = new picker.DocsView()
    dijeljeno.setIncludeFolders(false)
    dijeljeno.setOwnedByMe(false)

    new picker.PickerBuilder()
      .addView(dijeljeno)
      .addView(mojDrive)
      .setOAuthToken(token!)
      .setDeveloperKey(apiKey)
      .setAppId(brojProjekta(clientId))
      .setCallback((d) => {
        if (d.action === picker.Action.PICKED) resolve(d.docs?.[0]?.id ?? null)
        else if (d.action === 'cancel') resolve(null)
        else if (d.action === 'error') {
          reject(
            new GoogleGreska(
              'Googleov birač javlja grešku s API ključem. U Google konzoli provjeri: ' +
                'je li uključen Google Picker API, je li ključ ograničen na TU adresu ' +
                'stranice i obuhvaća li mu popis dopuštenih API-ja Picker.',
            ),
          )
        }
      })
      .build()
      .setVisible(true)
  })
}
