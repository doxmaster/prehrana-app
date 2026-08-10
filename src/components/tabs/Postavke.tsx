import { useRef, useState } from 'react'
import { BASE_FOODS } from '../../data/foods'
import { confirmDialog, toast } from '../../store/dialogs'
import { RESET_PARTS, describeReset, resetParts, restoreStarterContent, type ResetKey } from '../../domain/reset'
import { STARTER_MENUS, STARTER_WEEKS } from '../../data/menus'
import { STARTER_RECIPES } from '../../data/recipes'
import { downloadBlob, exportState, ImportError, parseImport } from '../../store/storage'
import { useAppStore } from '../../store/useAppStore'
import { fmt } from '../../lib/format'

export function Postavke() {
  const state = useAppStore((s) => s.data)
  const replaceAll = useAppStore((s) => s.replaceAll)
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const verified = BASE_FOODS.filter((f) => f.source === 'usda').length
  const days = state.profiles.reduce((sum, p) => sum + Object.keys(p.log).length, 0)

  const handleImport = async (file: File) => {
    setBusy(true)
    try {
      const imported = parseImport(await file.text())
      if (!(await confirmDialog('Zamijeniti sve trenutne podatke uvezenima?', 'Zamijeni'))) return
      replaceAll(imported)
      toast('Uvezeno.')
    } catch (err) {
      toast(err instanceof ImportError ? err.message : 'Uvoz nije uspio.')
    } finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <>
      <div className="card">
        <h2>Sigurnosna kopija</h2>
        <div className="row">
          <button
            className="btn secondary small"
            onClick={() => {
              downloadBlob(exportState(state), 'prehrana-backup.json')
              toast('Sigurnosna kopija preuzeta.')
            }}
          >
            ⬇ Izvezi (JSON)
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
          Podaci se čuvaju u pregledniku na ovom uređaju. Uvoz podržava i stari format iz HTML
          verzije aplikacije.
        </p>
      </div>

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
            const { state: next, added } = restoreStarterContent(state, {
              recipes: STARTER_RECIPES,
              menus: STARTER_MENUS,
              weeks: STARTER_WEEKS,
            })
            const parts = [
              added.recipes && `${added.recipes} recepata`,
              added.menus && `${added.menus} jelovnika`,
              added.weeks && `${added.weeks} tjedana`,
            ].filter(Boolean)
            if (!parts.length) return toast('Sve je već na mjestu.')
            replaceAll(next)
            toast(`Vraćeno: ${parts.join(', ')}.`)
          }}
        >
          ↺ Vrati ugrađene jelovnike i recepte
        </button>
      </div>

      <ResetPanel />

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
    </>
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
    replaceAll(resetParts(state, selected))
    setSelected([])
    toast('Obrisano.')
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
