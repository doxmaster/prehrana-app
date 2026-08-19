import { useRef, useState } from 'react'
import { BASE_FOODS } from '../../data/foods'
import { confirmDialog, toast } from '../../store/dialogs'
import {
  RESET_PARTS,
  describeReset,
  resetParts,
  restoreStarterContent,
  type ResetKey,
} from '../../domain/reset'
import { STARTER_MENUS, STARTER_WEEKS } from '../../data/menus'
import { STARTER_RECIPES } from '../../data/recipes'
import {
  buildExport,
  downloadBlob,
  exportFilename,
  exportState,
  ImportError,
  parseImport,
  readExportMark,
  readSafetyBackup,
  writeExportMark,
} from '../../store/storage'
import type { ExportMark } from '../../store/storage'
import { useAppStore } from '../../store/useAppStore'
import { Columns } from '../Columns'
import { fmt } from '../../lib/format'

export function Postavke() {
  const state = useAppStore((s) => s.data)
  const replaceAll = useAppStore((s) => s.replaceAll)
  const undo = useAppStore((s) => s.undo)
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [izvoz, setIzvoz] = useState(readExportMark)

  const verified = BASE_FOODS.filter((f) => f.source === 'usda').length
  const days = state.profiles.reduce((sum, p) => sum + Object.keys(p.log).length, 0)

  const handleImport = async (file: File) => {
    setBusy(true)
    try {
      const { state: imported, exportedAt } = parseImport(await file.text())
      if (!(await confirmDialog('Zamijeniti sve trenutne podatke uvezenima?', 'Zamijeni'))) return
      replaceAll(imported, 'uvoz sigurnosne kopije')
      /*
       * Uvezena datoteka JEST kopija koja postoji izvan preglednika, pa se
       * biljezi kao takva — inace bi odmah nakon uvoza pisalo da kopije nema.
       * Datum je onaj iz datoteke, ne trenutni; stanje podataka je ono koje je
       * uvozom postalo tekuce.
       */
      if (exportedAt) {
        const mark = { at: exportedAt, dataAt: useAppStore.getState().data.updatedAt ?? 0 }
        writeExportMark(mark)
        setIzvoz(mark)
      }
      toast('Uvezeno.', { label: '↩ Poništi', run: undo })
    } catch (err) {
      toast(err instanceof ImportError ? err.message : 'Uvoz nije uspio.')
    } finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const sigurnosnaKopija = (
    <div className="card">
      <h2>Sigurnosna kopija</h2>
      <p className="muted small" style={{ margin: '-6px 0 10px' }}>
        Izvozi se <b>sve</b>: osobe s dnevnicima i mjerenjima, kućanstva, jelovnici, tjedni,
        recepti, vlastite namirnice i izmjene ugrađenih. Jedna datoteka, bez ičega izostavljenog.
      </p>
      <div className="row">
        <button
          className="btn small"
          onClick={() => {
            const now = new Date()
            downloadBlob(exportState(state, now), exportFilename(now))
            const mark = { at: now.toISOString(), dataAt: state.updatedAt ?? 0 }
            writeExportMark(mark)
            setIzvoz(mark)
            toast('Sigurnosna kopija preuzeta.')
          }}
        >
          ⬇ Izvezi sve (JSON)
        </button>
        <button
          className="btn secondary small"
          title="Za slanje u poruku ili bilježnicu"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(JSON.stringify(buildExport(state), null, 2))
              toast('Podaci kopirani — zalijepi ih gdje želiš.')
            } catch {
              toast('Kopiranje nije uspjelo; koristi izvoz u datoteku.')
            }
          }}
        >
          ⧉ Kopiraj
        </button>
        <button
          className="btn secondary small"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          ⬆ Uvezi
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImport(file)
          }}
        />
      </div>
      <p className="hint">
        Podaci žive <b>samo u ovom pregledniku</b>. Očistiš li podatke preglednika ili se pokvari
        uređaj, nestaju — zato kopiju povremeno spremi izvan računala (OneDrive, Google Drive,
        e-pošta). Uvoz podržava i stari format iz HTML verzije.
      </p>

      <IzvozPodsjetnik mark={izvoz} updatedAt={state.updatedAt} />
      <PovratakNaKopiju />
    </div>
  )

  const stanjePodataka = (
    <div className="card">
      <h2>Stanje podataka</h2>
      <div className="grid g4">
        <Stat label="Osoba" value={fmt(state.profiles.length)} />
        <Stat label="Dana s unosom" value={fmt(days)} />
        <Stat label="Jelovnika" value={fmt(state.menus.length)} />
        <Stat label="Recepata" value={fmt(state.recipes.length)} />
        <Stat label="Vlastitih namirnica" value={fmt(state.customFoods.length)} />
        <Stat
          label="Provjereno prema USDA"
          value={`${fmt(verified)} / ${fmt(BASE_FOODS.length)}`}
          note="ugrađena baza"
        />
      </div>
    </div>
  )

  const ugradeniSadrzaj = (
    <div className="card">
      <h2>Ugrađeni sadržaj</h2>
      <p className="muted small" style={{ margin: '-6px 0 10px' }}>
        Recepti, dnevni jelovnici i sezonski tjedni dolaze samo pri prvom pokretanju. Ako su ti
        obrisani ili je aplikacija u međuvremenu dobila novi sadržaj, ovime se vraća ono što
        nedostaje — postojeće se ne dira.
      </p>
      <button
        className="btn secondary small"
        onClick={() => {
          const {
            state: next,
            added,
            tagged,
          } = restoreStarterContent(state, {
            recipes: STARTER_RECIPES,
            menus: STARTER_MENUS,
            weeks: STARTER_WEEKS,
          })
          const parts = [
            added.recipes && `${added.recipes} recepata`,
            added.menus && `${added.menus} jelovnika`,
            added.weeks && `${added.weeks} tjedana`,
            tagged && `oznaka kuhinje na ${tagged} jelovnika`,
          ].filter(Boolean)
          if (!parts.length) return toast('Sve je već na mjestu.')
          replaceAll(next, 'obnova ugrađenog sadržaja')
          toast(`Vraćeno: ${parts.join(', ')}.`, { label: '↩ Poništi', run: undo })
        }}
      >
        ↺ Vrati ugrađene jelovnike i recepte
      </button>
    </div>
  )

  const oPodacima = (
    <div className="card">
      <h2>O podacima</h2>
      <p className="muted small">
        Hranjive vrijednosti ugrađene baze provjerene su prema USDA FoodData Central. Namirnice
        označene kao <i>ručno</i> su procjene — uglavnom suplementi, gdje je vrijednost deklarirana
        doza, i domaći proizvodi za koje USDA nema odgovarajući zapis.
      </p>
      <p className="muted small">
        Aplikacija je za osobno praćenje i ne zamjenjuje savjet liječnika ili nutricionista.
      </p>
    </div>
  )

  /*
   * Lijevo kratke kartice, desno duga: brisanje podataka ima devet redaka i
   * samo bi ono odredilo visinu retka, pa bi lijevo ostala rupa visoka koliko
   * i sama kartica.
   */
  return (
    <>
      {stanjePodataka}
      <Columns
        left={
          <>
            {sigurnosnaKopija}
            {ugradeniSadrzaj}
            {oPodacima}
          </>
        }
        right={<ResetPanel />}
      />
    </>
  )
}

const DANA_DO_PODSJETNIKA = 14

/**
 * Podsjetnik na izvoz.
 *
 * Bez ovoga se ne vidi razlika izmedu "kopija je od jucer" i "kopije nema
 * nikad", a to je jedina razlika koja je vazna kad se podaci izgube. Racuna se
 * i je li od kopije bilo promjena — stara kopija sama po sebi nije problem ako
 * se od tada nista nije mijenjalo.
 */
function IzvozPodsjetnik({ mark, updatedAt }: { mark: ExportMark | null; updatedAt?: number }) {
  const [sada] = useState(() => Date.now())

  if (!mark) {
    return (
      <div className="banner warn" style={{ marginTop: 12, marginBottom: 0 }}>
        <b>Još nema nijedne kopije izvan preglednika.</b>{' '}
        <span className="small">
          Izvezi podatke i spremi datoteku negdje drugdje — na disk, u OneDrive ili na e-poštu.
        </span>
      </div>
    )
  }

  const kada = new Date(mark.at)
  /*
   * Trenutak se uzme jednom pri montiranju: racunanje iz Date.now() u renderu
   * dalo bi razlicit rezultat pri svakom osvjezavanju iste kartice. Zato se
   * kopija napravljena NAKON montiranja mora spustiti na nulu — inace pise
   * "prije -1 dana".
   */
  const dana = Math.max(0, Math.floor((sada - kada.getTime()) / 86400000))
  // Usporeduje se stanje podataka, ne vrijeme: stara kopija nije problem ako se
  // od nje nista nije promijenilo.
  const promjena = updatedAt !== undefined && updatedAt > mark.dataAt
  const opis = `${kada.toLocaleDateString('hr-HR')} (${dana === 0 ? 'danas' : dana === 1 ? 'jučer' : `prije ${dana} dana`})`

  if (promjena && dana >= DANA_DO_PODSJETNIKA) {
    return (
      <div className="banner warn" style={{ marginTop: 12, marginBottom: 0 }}>
        <b>Zadnja izvezena kopija: {opis}</b>{' '}
        <span className="small">— podaci su se od tada mijenjali. Vrijeme je za novu.</span>
      </div>
    )
  }

  return (
    <p className="muted small" style={{ margin: '10px 0 0' }}>
      Zadnja izvezena kopija: {opis}
      {promjena ? ' · podaci su se od tada mijenjali' : ' · od tada nema promjena'}
    </p>
  )
}

/**
 * Povratak na stanje prije zadnjeg velikog zahvata.
 *
 * Poništavanje u obavijesti drzi samo zadnju promjenu i nestaje sa zatvaranjem
 * kartice. Ova kopija nastaje prije uvoza, brisanja dijelova i obnove, i
 * prezivljava zatvaranje preglednika — zadnja obrana kad se pogreska primijeti
 * tek sutra.
 */
function PovratakNaKopiju() {
  const replaceAll = useAppStore((s) => s.replaceAll)
  const backup = readSafetyBackup()
  if (!backup) return null

  const kada = new Date(backup.at)
  const opis = backup.at ? kada.toLocaleString('hr-HR') : 'nepoznato vrijeme'

  return (
    <div className="banner" style={{ marginTop: 12, marginBottom: 0 }}>
      <b>Automatski spremljeno stanje prije zadnjeg zahvata</b>
      <br />
      <span className="small">
        Spremljeno {opis} — prije zahvata: {backup.reason}. Ovo živi u pregledniku i nije zamjena za
        izvezenu datoteku.
      </span>
      <div style={{ marginTop: 8 }}>
        <button
          className="btn secondary small"
          onClick={async () => {
            const ok = await confirmDialog(
              `Vratiti podatke na stanje od ${opis}?

Sve promjene napravljene nakon toga nestaju.`,
              'Vrati',
            )
            if (!ok) return
            replaceAll(backup.state, 'povratak na sigurnosnu kopiju')
            toast('Podaci vraćeni na stanje prije zahvata.')
          }}
        >
          ↩ Vrati na to stanje
        </button>
      </div>
    </div>
  )
}

/**
 * Selektivno brisanje. Namjerno nije jedno "obrisi sve" dugme: najcesce smeta
 * samo jedan dio (testni dnevnik, probni jelovnici), a ostatak se zeli zadrzati.
 */
function ResetPanel() {
  const state = useAppStore((s) => s.data)
  const replaceAll = useAppStore((s) => s.replaceAll)
  const [selected, setSelected] = useState<ResetKey[]>([])

  const toggle = (key: ResetKey) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const summary = describeReset(state, selected)

  const run = async () => {
    if (!selected.length) return toast('Odaberi barem jedan dio za brisanje.')
    const question =
      `Obrisati:\n\n${summary.map((l) => `• ${l}`).join('\n')}\n\n` +
      'Ovo se ne može poništiti. Ako nisi izvezao sigurnosnu kopiju, odustani i prvo je napravi.'
    if (!(await confirmDialog(question, 'Obriši'))) return
    replaceAll(resetParts(state, selected), `brisanje: ${summary.join(', ')}`)
    setSelected([])
    toast('Obrisano.', { label: '↩ Poništi', run: useAppStore.getState().undo })
  }

  return (
    <div className="card">
      <h2>Brisanje podataka</h2>
      <p className="muted small" style={{ margin: '-6px 0 12px' }}>
        Odaberi samo ono što želiš maknuti — ostalo ostaje netaknuto. Prije brisanja izvezi
        sigurnosnu kopiju gore.
      </p>

      {RESET_PARTS.map((part) => (
        <label
          key={part.key}
          className="item"
          style={{ alignItems: 'flex-start', cursor: 'pointer', paddingLeft: 0 }}
        >
          <input
            type="checkbox"
            style={{ width: 'auto', marginTop: 3 }}
            checked={selected.includes(part.key)}
            onChange={() => toggle(part.key)}
          />
          <span style={{ flex: 1, minWidth: 0 }}>
            <b>{part.label}</b>
            <br />
            <span className="muted small">{part.description}</span>
          </span>
        </label>
      ))}

      {summary.length > 0 && (
        <div className="banner warn" style={{ marginTop: 12, marginBottom: 0 }}>
          Bit će obrisano: {summary.join(', ')}.
        </div>
      )}

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn danger small" disabled={!selected.length} onClick={() => void run()}>
          Obriši odabrano
        </button>
        {selected.length > 0 && (
          <button className="btn secondary small" onClick={() => setSelected([])}>
            Poništi odabir
          </button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card" style={{ margin: 0, background: 'var(--panel2)' }}>
      <div className="muted small">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, margin: '2px 0' }}>{value}</div>
      {note && <div className="muted small">{note}</div>}
    </div>
  )
}
