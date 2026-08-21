import { useState } from 'react'
import * as google from '../services/google'
import type { UskladIshod } from '../services/sinkronizacija'
import { useGoogleObitelj } from '../store/googleObitelj'
import { toast } from '../store/dialogs'

/**
 * Kartica u Postavkama: podesavanje i cijela slika stanja.
 *
 * Svakodnevne radnje (prijava, uskladi) stoje i u zaglavlju, jer se rade cesto
 * i s bilo koje kartice. Ovdje ostaje ono sto se radi jednom — kljucevi, poziv
 * ukucanima, pridruzivanje — i objasnjenje kako to skupa radi.
 */
export function GoogleObitelj() {
  const { postavke, tko, radi, zadnje, poziv, prijava, sinkroniziraj, pozovi, pridruzi, odjava } =
    useGoogleObitelj()
  const zatvoriPoziv = useGoogleObitelj((s) => s.zatvoriPoziv)
  const spremiKljuceve = useGoogleObitelj((s) => s.spremiKljuceve)
  const [otvorenoPodesavanje, setOtvorenoPodesavanje] = useState(false)

  const spreman = postavke.clientId.length > 0
  const ugradeno = google.kljuceviUgradeni()

  return (
    <div className="card">
      <h2>Obitelj na više uređaja</h2>
      <p className="muted small" style={{ margin: '-6px 0 10px' }}>
        Podaci se čuvaju kao <b>jedna datoteka na tvom Google Driveu</b>. Aplikacija vidi samo tu
        datoteku — ne i ostatak Drivea.
      </p>

      <div className="banner" style={{ marginTop: 0, marginBottom: 10 }}>
        <b>
          Da bi više ljudi upisivalo s različitih uređaja, svatko se mora prijaviti svojim Google
          računom.
        </b>{' '}
        <span className="small">
          Prijava nije zbog dozvole nego zbog <i>prepoznavanja</i>: po Google adresi aplikacija zna
          čiji je unos, pa se dnevnici ne miješaju, a ime i slika osobe dolaze s profila. Bez
          prijave uređaj radi sam za sebe i ništa ne dijeli.
        </span>
      </div>

      {!spreman ? (
        <div className="banner warn" style={{ marginTop: 0 }}>
          <b>Zajednička obitelj nije dostupna u ovoj instalaciji.</b>{' '}
          <span className="small">
            Aplikacija radi normalno, samo bez usklađivanja među uređajima. Ako je postavljaš na
            svoje, ključeve upiši niže.
          </span>
        </div>
      ) : (
        <>
          <div className="row" style={{ marginBottom: 10 }}>
            {tko ? (
              <span className="row" style={{ gap: 8 }}>
                {tko.slika && (
                  <img
                    src={tko.slika}
                    alt=""
                    width={28}
                    height={28}
                    style={{ borderRadius: '50%' }}
                  />
                )}
                <b>{tko.ime}</b>
                <span className="muted small">{tko.email}</span>
              </span>
            ) : (
              <button className="btn small" disabled={radi} onClick={() => void prijava()}>
                Prijavi se Google računom
              </button>
            )}
          </div>

          <div className="row">
            <button className="btn small" disabled={radi} onClick={() => void sinkroniziraj()}>
              ⟳ Uskladi s obitelji
            </button>
            <button className="btn secondary small" disabled={radi} onClick={() => void pozovi()}>
              ✉ Pozovi ukućana
            </button>
            <button className="btn secondary small" disabled={radi} onClick={() => void pridruzi()}>
              ⇲ Pridruži se obitelji
            </button>
            {tko && (
              <button className="btn ghost small" onClick={odjava}>
                Odjava
              </button>
            )}
          </div>

          {poziv && <Poziv tekst={poziv} onZatvori={zatvoriPoziv} />}
          {zadnje && <Sazetak ishod={zadnje} />}
        </>
      )}

      <details style={{ marginTop: 12 }} open={otvorenoPodesavanje}>
        <summary style={{ cursor: 'pointer' }} onClick={() => setOtvorenoPodesavanje((v) => !v)}>
          <span className="small muted">
            {ugradeno
              ? 'Vlastita instalacija (ključevi su već ugrađeni)'
              : 'Podešavanje Google prijave'}
          </span>
        </summary>
        <Podesavanje postavke={postavke} onSpremi={spremiKljuceve} ugradeno={ugradeno} />
      </details>
    </div>
  )
}

/**
 * Tekst poziva za rucno slanje.
 *
 * Googleova obavijest ne stigne uvijek — kad osoba vec ima pristup, nove nema.
 * Ovo je zato jedini put koji sigurno radi: kopiras i posaljes kako ti odgovara.
 */
function Poziv({ tekst, onZatvori }: { tekst: string; onZatvori: () => void }) {
  return (
    <div className="banner" style={{ marginTop: 10, marginBottom: 0 }}>
      <b>Pošalji ovo ukućaninu</b>
      <p className="muted small" style={{ margin: '4px 0 8px' }}>
        Pristup je već dan. Google ponekad ne pošalje obavijest — osobito ako je osoba pristup imala
        i prije — pa je najsigurnije poslati porukom.
      </p>
      <textarea
        readOnly
        rows={7}
        value={tekst}
        onFocus={(e) => e.currentTarget.select()}
        style={{ width: '100%', fontSize: 12 }}
      />
      <div className="row" style={{ marginTop: 6 }}>
        <button
          className="btn small"
          onClick={() => {
            navigator.clipboard
              .writeText(tekst)
              .then(() => toast('Poziv kopiran.'))
              .catch(() => toast('Kopiranje nije uspjelo — označi tekst i kopiraj ručno.'))
          }}
        >
          ⧉ Kopiraj poziv
        </button>
        <button className="btn secondary small" onClick={onZatvori}>
          Sakrij
        </button>
      </div>
    </div>
  )
}

function Sazetak({ ishod }: { ishod: UskladIshod }) {
  if (ishod.prvaObjava) {
    return (
      <p className="muted small" style={{ margin: '10px 0 0' }}>
        Ovaj uređaj je prvi — datoteka obitelji je upravo stvorena. Pozovi ukućane gumbom iznad.
      </p>
    )
  }
  return (
    <div style={{ marginTop: 10 }}>
      <p className="muted small" style={{ margin: 0 }}>
        Stiglo s drugih uređaja: <b>{ishod.drugdje}</b> · poslano odavde: <b>{ishod.ovdje}</b>
        {ishod.zadnjiUredio && (
          <>
            {' '}
            · zadnji prije mene: <b>{ishod.zadnjiUredio.ime}</b>,{' '}
            {new Date(ishod.zadnjiUredio.at).toLocaleString('hr-HR')}
          </>
        )}
      </p>
      {ishod.sukobi.length > 0 && (
        <div className="banner warn" style={{ marginTop: 8, marginBottom: 0 }}>
          <b>Isto je mijenjano na dva mjesta ({ishod.sukobi.length}):</b>
          <ul className="small" style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {ishod.sukobi.slice(0, 8).map((s) => (
              <li key={s}>{s}</li>
            ))}
            {ishod.sukobi.length > 8 && <li>… i još {ishod.sukobi.length - 8}</li>}
          </ul>
          <span className="small">
            Zadržana je verzija s ovog uređaja, osim ondje gdje je jedna strana bila brisanje — tada
            ostaje izmjena. Prijašnje stanje vraćaš gumbom <b>Poništi</b> ili sigurnosnom kopijom.
          </span>
        </div>
      )}
    </div>
  )
}

function Podesavanje({
  postavke,
  onSpremi,
  ugradeno,
}: {
  postavke: google.GooglePostavke
  onSpremi: (p: Partial<google.GooglePostavke>) => void
  ugradeno: boolean
}) {
  const [clientId, setClientId] = useState(postavke.clientId)
  const [apiKey, setApiKey] = useState(postavke.apiKey)

  return (
    <div style={{ marginTop: 10 }}>
      {ugradeno && (
        <p className="muted small" style={{ marginTop: 0 }}>
          Ova stranica već ima svoje ključeve — ništa ne moraš upisivati, a upisano se{' '}
          <b>zanemaruje</b>. Polja ispod trebaju samo ako aplikaciju postavljaš na vlastitu adresu.
        </p>
      )}
      {/*
        Otisak sluzi jednoj stvari: kad Google javi "developer key is invalid",
        ovdje se u sekundi vidi koristi li aplikacija bas onaj kljuc koji je u
        konzoli — bez pokazivanja cijele vrijednosti.
      */}
      <p className="muted small" style={{ marginTop: 0 }}>
        Ključ u upotrebi: <code>{google.otisakKljuca(postavke.apiKey)}</code>
        <br />
        Usporedi s <i>Show key</i> u Google konzoli; ako se razlikuje, gradnja ima staru vrijednost.
      </p>
      <p className="muted small" style={{ marginTop: 0 }}>
        U <b>console.cloud.google.com</b> napravi projekt, uključi <i>Google Drive API</i> i{' '}
        <i>Google Picker API</i>, pa pod <i>Credentials</i> stvori <b>OAuth client ID</b> (tip: Web)
        i <b>API key</b>. Kao dopušteni izvor upiši adresu ove stranice. Ključevi su javni po naravi
        — čuvaju pristup, ne podatke.
      </p>
      <label htmlFor="g-client">OAuth client ID</label>
      <input
        id="g-client"
        value={clientId}
        placeholder="…apps.googleusercontent.com"
        onChange={(e) => setClientId(e.target.value)}
      />
      <label htmlFor="g-key">API key (za odabir podijeljene datoteke)</label>
      <input id="g-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
      <button
        className="btn small"
        style={{ marginTop: 8 }}
        onClick={() => onSpremi({ clientId: clientId.trim(), apiKey: apiKey.trim() })}
      >
        Spremi ključeve
      </button>
    </div>
  )
}
