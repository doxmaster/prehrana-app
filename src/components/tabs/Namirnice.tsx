import { useMemo, useState } from 'react'
import { CAT_COLORS, NUTRIENTS, catColor } from '../../domain/constants'
import { CATEGORIES, NUTRIENT_KEYS } from '../../domain/types'
import { foodUnit } from '../../domain/nutrients'
import { foodUsage, removeFoodReferences } from '../../domain/foodIndex'
import { isRecipeFoodId } from '../../domain/recipes'
import { uid } from '../../domain/id'
import { confirmDialog, toast } from '../../store/dialogs'
import { useAppStore, useFoods, useUpdate } from '../../store/useAppStore'
import { FoodEditor } from '../FoodEditor'
import { fmt } from '../../lib/format'
import type { Category, Food, Nutrients } from '../../domain/types'

type SortKey = 'name' | 'cat' | keyof Nutrients | 'serv'

const COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: 'Namirnica' },
  { key: 'cat', label: 'Kat.' },
  ...NUTRIENTS.map((n) => ({ key: n.key as SortKey, label: n.label })),
  { key: 'serv', label: 'Porcija' },
]

const emptyForm = () => ({
  name: '',
  cat: 'Ostalo' as Category,
  serv: '100',
  ...Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, ''])),
}) as Record<string, string> & { cat: Category }

export function Namirnice() {
  const foods = useFoods()
  const update = useUpdate()
  const state = useAppStore((s) => s.data)
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 })
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Food | null>(null)

  const rows = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    const list = foods.all().filter((f) => f.name.toLowerCase().includes(needle))
    const { key, dir } = sort
    return [...list].sort((a, b) => {
      const av = a[key as keyof Food]
      const bv = b[key as keyof Food]
      if (typeof av === 'string' || typeof bv === 'string') {
        return String(av).localeCompare(String(bv), 'hr') * dir
      }
      return ((Number(av) || 0) - (Number(bv) || 0)) * dir
    })
  }, [foods, filter, sort])

  const addFood = () => {
    const name = form.name.trim()
    if (!name) return toast('Unesi naziv namirnice.')
    if (foods.byName(name)) return toast('Namirnica s tim nazivom već postoji.')

    const values = Object.fromEntries(
      NUTRIENT_KEYS.map((k) => [k, Math.max(0, Number(form[k]) || 0)]),
    ) as Nutrients

    update((draft) => {
      draft.customFoods.push({
        id: uid('c'),
        name,
        cat: form.cat,
        serv: Math.max(1, Math.round(Number(form.serv) || 100)),
        source: 'user',
        ...values,
      })
    })
    setForm(emptyForm())
    toast(`Dodano: ${name}`)
  }

  const deleteFood = async (food: Food) => {
    if (isRecipeFoodId(food.id)) {
      return toast('Ovo je recept — obriši ga u kartici Jelovnik.')
    }
    const uses = foodUsage(state, food.id)
    const question = uses
      ? `⚠️ "${food.name}" se koristi u jelovnicima ili dnevniku (${uses}×). Brisanjem se uklanjaju i te stavke. Sigurno?`
      : `Obrisati "${food.name}"?`
    if (!(await confirmDialog(question, 'Obriši'))) return

    update((draft) => {
      const removed = removeFoodReferences(draft, food.id)

      if (food.base) {
        if (!draft.overrides.hidden.includes(food.id)) draft.overrides.hidden.push(food.id)
        delete draft.overrides.names[food.id]
        delete draft.overrides.cats[food.id]
        delete draft.overrides.vals[food.id]
        delete draft.overrides.servs[food.id]
      } else {
        draft.customFoods = draft.customFoods.filter((f) => f.id !== food.id)
      }
      toast(`Obrisano${removed ? ` i uklonjeno iz ${removed} stavki` : ''}.`)
    })
  }

  return (
    <>
      <div className="card">
        <h2>Dodaj vlastitu namirnicu</h2>
        <p className="muted small">
          Vrijednosti na <b>100 g</b> (ili 100 ml za pića).
        </p>
        <div className="grid g4" style={{ marginTop: 8 }}>
          <div>
            <label htmlFor="nf-name">Naziv</label>
            <input
              id="nf-name"
              value={form.name}
              placeholder="npr. Domaći ajvar"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="nf-cat">Kategorija</label>
            <select
              id="nf-cat"
              value={form.cat}
              onChange={(e) => setForm({ ...form, cat: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          {NUTRIENTS.map((n) => (
            <div key={n.key}>
              <label htmlFor={`nf-${n.key}`}>
                {n.label} ({n.unit})
              </label>
              <input
                id={`nf-${n.key}`}
                type="number"
                min="0"
                step="0.1"
                value={form[n.key] ?? ''}
                onChange={(e) => setForm({ ...form, [n.key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label htmlFor="nf-serv">Uobičajena porcija (g/ml)</label>
            <input
              id="nf-serv"
              type="number"
              min="1"
              value={form.serv}
              onChange={(e) => setForm({ ...form, serv: e.target.value })}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={addFood}>
            Dodaj namirnicu
          </button>
        </div>
      </div>

      <div className="card">
        <h2>
          Baza namirnica <span className="muted small">({rows.length})</span>
        </h2>
        <p className="muted small" style={{ margin: '-4px 0 8px' }}>
          Vrijednosti su na <b>100 g</b> (za pića 100 ml). Oznaka izvora pokazuje je li vrijednost
          provjerena prema vanjskoj bazi.
        </p>
        <input
          value={filter}
          placeholder="🔍 Pretraži namirnice..."
          aria-label="Pretraži namirnice"
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <div className="catlegend">
          {Object.keys(CAT_COLORS).map((c) => (
            <span key={c}>
              <span className="cdot" aria-hidden="true" style={{ background: catColor(c) }} />
              {c}
            </span>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} aria-sort={sort.key === col.key ? (sort.dir > 0 ? 'ascending' : 'descending') : undefined}>
                    <button
                      className="sort"
                      onClick={() =>
                        setSort((prev) =>
                          prev.key === col.key
                            ? { key: col.key, dir: prev.dir === 1 ? -1 : 1 }
                            : { key: col.key, dir: col.key === 'name' || col.key === 'cat' ? 1 : -1 },
                        )
                      }
                    >
                      {col.label}
                      {sort.key === col.key ? (sort.dir > 0 ? ' ▲' : ' ▼') : ''}
                    </button>
                  </th>
                ))}
                <th>Izvor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((food) => (
                <tr key={food.id}>
                  <td>
                    <span className="cdot" aria-hidden="true" style={{ background: catColor(food.cat) }} />
                    {food.name}
                  </td>
                  <td className="small" style={{ color: catColor(food.cat), fontWeight: 600 }}>
                    {food.cat}
                  </td>
                  {NUTRIENTS.map((n) => (
                    <td key={n.key}>{fmt(food[n.key], n.dec)}</td>
                  ))}
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                    {food.serv} {foodUnit(food.cat, food.name)}
                  </td>
                  <td>
                    <SourceBadge food={food} />
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="icon"
                      title="Uredi"
                      aria-label={`Uredi ${food.name}`}
                      onClick={() => setEditing(food)}
                    >
                      ✎
                    </button>
                    <button
                      className="icon"
                      title="Obriši"
                      aria-label={`Obriši ${food.name}`}
                      onClick={() => void deleteFood(food)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <FoodEditor food={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function SourceBadge({ food }: { food: Food }) {
  const labels: Record<Food['source'], { text: string; title: string }> = {
    usda: { text: 'USDA', title: `Provjereno prema USDA FoodData Central${food.verifiedAt ? `, ${food.verifiedAt}` : ''}` },
    off: { text: 'OFF', title: 'Medijan iz Open Food Factsa' },
    ai: { text: 'AI', title: 'Procjena, nije provjerena' },
    user: { text: 'ručno', title: 'Ručno unesena vrijednost' },
    recipe: { text: 'recept', title: 'Izračunato iz sastojaka recepta' },
  }
  const badge = labels[food.source]
  return (
    <span className="small muted" title={badge.title}>
      {badge.text}
    </span>
  )
}
