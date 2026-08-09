import { useRef, useState } from 'react'
import { BASE_FOODS } from '../../data/foods'
import { confirmDialog, toast } from '../../store/dialogs'
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

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card" style={{ margin: 0, background: 'var(--panel2)' }}>
      <div className="muted small">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, margin: '2px 0' }}>{value}</div>
      {note && <div className="muted small">{note}</div>}
    </div>
  )
}
