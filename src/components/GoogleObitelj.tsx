import { useState } from 'react'
import { confirmDialog, toast } from '../store/dialogs'
import { useAppStore } from '../store/useAppStore'
import * as google from '../services/google'
import { povezisOsobom, uskladi, zaboraviOsnovu } from '../services/sinkronizacija'
import type { UskladIshod } from '../services/sinkronizacija'

/**
 * Spajanje obitelji preko Google računa.
 *
 * Namjerno NIJE automatsko u pozadini: usklađivanje mijenja podatke svih
 * ukućana, pa se pokreće klikom i uvijek javi što je učinilo. Automatika dolazi
 * tek kad se pokaže da spajanje radi kako treba na stvarnim podacima.
 */
export function GoogleObitelj() {
  const undo = useAppStore((s) => s.undo)
  const [postavke, setPostavke] = useState(google.procitajPostavke)
  const [tko, setTko] = useState<google.GoogleProfil | null>(null)
  const [radi, setRadi] = useState(false)
  const [zadnje, setZadnje] = useState<UskladIshod | null>(null)
  const [otvorenoPodesavanje, setOtvorenoPodesavanje] = useState(false)

  const spreman = postavke.clientId.length > 0

  const greska = (err: unknown) =>
    toast(err instanceof google.GoogleGreska ? err.message : 'Nešto nije prošlo. Pokušaj ponovno.')

  const prijavaIPovezivanje = async () => {
    setRadi(true)
    try {
      await google.pristup()
      const profil = await google.profil()
      setTko(profil)
      const ishod = povezisOsobom(profil)
      toast(
        ishod === 'nova'
          ? `Dodana osoba ${profil.ime}.`
          : ishod === 'preuzeta'
            ? `Osoba preimenovana u ${profil.ime}.`
            : `Prijavljen kao ${profil.ime}.`,
        { label: '↩ Poništi', run: undo },
      )
    } catch (err) {
      greska(err)
    } finally {
      setRadi(false)
    }
  }

  const sinkroniziraj = async () => {
    setRadi(true)
    try {
      const ishod = await uskladi()
      setZadnje(ishod)
      setPostavke(google.procitajPostavke())
      if (ishod.prvaObjava) {
        toast('Obiteljska datoteka stvorena na tvom Driveu.')
      } else {
        const dijelovi = [
          ishod.drugdje && `${ishod.drugdje} stiglo s drugog uređaja`,
          ishod.ovdje && `${ishod.ovdje} poslano odavde`,
          ishod.sukobi.length && `${ishod.sukobi.length} sukoba`,
        ].filter(Boolean)
        toast(dijelovi.length ? `Usklađeno: ${dijelovi.join(', ')}.` : 'Već je sve usklađeno.', {
          label: '↩ Poništi',
          run: undo,
        })
      }
    } catch (err) {
      greska(err)
    } finally {
      setRadi(false)
    }
  }

  const pozovi = async () => {
    const email = window.prompt('E-pošta ukućana kojeg pozivaš (Google račun):')?.trim()
    if (!email) return
    const { fileId } = google.procitajPostavke()
    if (!fileId) return toast('Prvo se uskladi — datoteka obitelji još ne postoji.')
    setRadi(true)
    try {
      await google.podijeli(fileId, email)
      toast(`${email} je pozvan i može se pridružiti obitelji.`)
    } catch (err) {
      greska(err)
    } finally {
      setRadi(false)
    }
  }

  const pridruzi = async () => {
    setRadi(true)
    try {
      const fileId = await google.odaberiDatoteku()
      if (!fileId) return
      const ok = await confirmDialog(
        'Pridruživanje obitelji spaja tvoje podatke s obiteljskima.\n\n' +
          'Ništa se ne briše: sve što postoji samo kod tebe ostaje, a razlike se prijavljuju.',
        'Pridruži se',
      )
      if (!ok) return
      zaboraviOsnovu()
      google.zapisiPostavke({ fileId })
      setPostavke(google.procitajPostavke())
      await sinkroniziraj()
    } catch (err) {
      greska(err)
    } finally {
      setRadi(false)
    }
  }

  return (
    <div className="card">
      <h2>Obitelj na više uređaja</h2>
      <p className="muted small" style={{ margin: '-6px 0 10px' }}>
        Podaci se čuvaju kao <b>jedna datoteka na tvom Google Driveu</b>. Aplikacija vidi samo tu
        datoteku — ne i ostatak Drivea. Svaki ukućanin se prijavljuje <b>svojim</b> računom i
        automatski dobiva ime i sliku sa svog profila.
      </p>

      {!spreman ? (
        <div className="banner warn" style={{ marginTop: 0 }}>
          <b>Još nije podešeno.</b>{' '}
          <span className="small">
            Treba jednokratno napraviti besplatnu Google prijavu za aplikaciju i upisati dva ključa.
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
              <button
                className="btn small"
                disabled={radi}
                onClick={() => void prijavaIPovezivanje()}
              >
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
              <button
                className="btn ghost small"
                onClick={() => {
                  google.odjava()
                  setTko(null)
                  toast('Odjavljen. Podaci na ovom uređaju ostaju.')
                }}
              >
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
        <Podesavanje
          postavke={postavke}
          onSpremi={(p) => {
            setPostavke(google.zapisiPostavke(p))
            toast('Spremljeno. Sad se možeš prijaviti.')
          }}
        />
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
