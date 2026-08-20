import { useState } from 'react'
import * as google from '../services/google'
import type { UskladIshod } from '../services/sinkronizacija'
import { useGoogleObitelj } from '../store/googleObitelj'

/**
 * Kartica u Postavkama: podesavanje i cijela slika stanja.
 *
 * Svakodnevne radnje (prijava, uskladi) stoje i u zaglavlju, jer se rade cesto
 * i s bilo koje kartice. Ovdje ostaje ono sto se radi jednom — kljucevi, poziv
 * ukucanima, pridruzivanje — i objasnjenje kako to skupa radi.
 */
export function GoogleObitelj() {
  const { postavke, tko, radi, zadnje, prijava, sinkroniziraj, pozovi, pridruzi, odjava } =
    useGoogleObitelj()
  const spremiKljuceve = useGoogleObitelj((s) => s.spremiKljuceve)
  const [otvorenoPodesavanje, setOtvorenoPodesavanje] = useState(false)

  const spreman = postavke.clientId.length > 0

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
          <b>Još nije podešeno.</b>{' '}
          <span className="small">
            Treba jednokratno napraviti besplatnu Google prijavu za aplikaciju i upisati dva ključa
            (niže).
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

          {zadnje && <Sazetak ishod={zadnje} />}
        </>
      )}

      <details style={{ marginTop: 12 }} open={otvorenoPodesavanje}>
        <summary style={{ cursor: 'pointer' }} onClick={() => setOtvorenoPodesavanje((v) => !v)}>
          <span className="small">Podešavanje Google prijave</span>
        </summary>
        <Podesavanje postavke={postavke} onSpremi={spremiKljuceve} />
      </details>
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
}: {
  postavke: google.GooglePostavke
  onSpremi: (p: Partial<google.GooglePostavke>) => void
}) {
  const [clientId, setClientId] = useState(postavke.clientId)
  const [apiKey, setApiKey] = useState(postavke.apiKey)

  return (
    <div style={{ marginTop: 10 }}>
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
