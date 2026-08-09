import { useState } from 'react'
import { NUTRIENTS } from '../domain/constants'
import { CATEGORIES, NUTRIENT_KEYS } from '../domain/types'
import { atwaterDeviation, foodUnit, isAlcoholic } from '../domain/nutrients'
import { isRecipeFoodId } from '../domain/recipes'
import { toast } from '../store/dialogs'
import { useFoods, useUpdate } from '../store/useAppStore'
import type { Category, Food, Nutrients } from '../domain/types'

const round2 = (v: number) => Math.round(v * 100) / 100

interface Props {
  food: Food
  onClose: () => void
}

/**
 * Vrijednosti se u obrascu prikazuju za upisanu porciju, a spremaju natrag na
 * 100 g. Promjena porcije preračunava polja da korisnik ne mora sam množiti.
 */
export function FoodEditor({ food, onClose }: Props) {
  const foods = useFoods()
  const update = useUpdate()

  const [name, setName] = useState(food.name)
  const [cat, setCat] = useState<Category>(food.cat)
  const [serv, setServ] = useState(String(Math.max(1, food.serv)))
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      NUTRIENT_KEYS.map((k) => [k, String(round2(((food[k] || 0) * Math.max(1, food.serv)) / 100))]),
    ),
  )

  const unit = foodUnit(cat, name)
  const isRecipe = isRecipeFoodId(food.id)

  const per100 = Object.fromEntries(
    NUTRIENT_KEYS.map((k) => [k, round2(((Number(values[k]) || 0) * 100) / Math.max(1, Number(serv) || 100))]),
  ) as Nutrients

  const deviation = isAlcoholic(name, cat) ? null : atwaterDeviation(per100)
  const suspicious = deviation !== null && deviation > 0.15

  const rescale = (nextServ: string) => {
    const from = Math.max(1, Number(serv) || 100)
    const to = Math.max(1, Number(nextServ) || 100)
    setServ(nextServ)
    if (from === to) return
    setValues((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([k, v]) => [k, String(round2(((Number(v) || 0) * to) / from))]),
      ),
    )
  }

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) return toast('Naziv ne može biti prazan.')
    const existing = foods.byName(trimmed)
    if (existing && existing.id !== food.id) return toast('Namirnica s tim nazivom već postoji.')

    const servNumber = Math.max(1, Math.round(Number(serv) || 100))

    update((draft) => {
      if (food.base) {
        draft.overrides.names[food.id] = trimmed
        draft.overrides.cats[food.id] = cat
        draft.overrides.vals[food.id] = per100
        draft.overrides.servs[food.id] = servNumber
      } else {
        const target = draft.customFoods.find((f) => f.id === food.id)
        if (!target) return
        target.name = trimmed
        target.cat = cat
        target.serv = servNumber
        target.source = 'user'
        delete target.verifiedAt
        for (const k of NUTRIENT_KEYS) target[k] = per100[k]
      }
    })
    toast(`Spremljeno: ${trimmed}`)
    onClose()
  }

  if (isRecipe) {
    return (
      <div className="modal-ov" role="dialog" aria-modal="true">
        <div className="modal-box">
          <p className="m-msg">
            <b>{food.name}</b> je recept — vrijednosti se računaju iz sastojaka. Uredi sastojke u
            kartici Jelovnik.
          </p>
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>
              U redu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="modal-ov"
      role="dialog"
      aria-modal="true"
      aria-label={`Uredi ${food.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div className="modal-box wide">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
          Uredi: {food.name} {food.base ? '(ugrađena)' : '(vlastita)'}
        </div>
        <p className="muted small" style={{ margin: '0 0 12px' }}>
          Vrijednosti dolje odnose se na {Math.max(1, Number(serv) || 100)} {unit}. Promjenom
          gramaže preračunavaju se automatski.
          {food.source === 'usda' && ' Ručna izmjena poništava oznaku provjere prema USDA.'}
        </p>

        <div className="grid g2">
          <div>
            <label htmlFor="fe-name">Naziv</label>
            <input id="fe-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="fe-cat">Kategorija</label>
            <select id="fe-cat" value={cat} onChange={(e) => setCat(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid g3" style={{ marginTop: 10 }}>
          {NUTRIENTS.map((n) => (
            <div key={n.key}>
              <label htmlFor={`fe-${n.key}`}>
                {n.label} ({n.unit})
              </label>
              <input
                id={`fe-${n.key}`}
                type="number"
                min="0"
                step="0.1"
                value={values[n.key] ?? ''}
                onChange={(e) => setValues({ ...values, [n.key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label htmlFor="fe-serv">Gramaža / porcija ({unit})</label>
            <input
              id="fe-serv"
              type="number"
              min="1"
              value={serv}
              onChange={(e) => rescale(e.target.value)}
            />
          </div>
        </div>

        {suspicious && (
          <div className="banner warn" style={{ marginTop: 12, marginBottom: 0 }}>
            ⚠ Kalorije ne odgovaraju zbroju makronutrijenata (odstupanje{' '}
            {Math.round((deviation ?? 0) * 100)} %). Provjeri unos prije spremanja.
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn secondary" onClick={onClose}>
            Odustani
          </button>
          <button className="btn" onClick={save}>
            Spremi
          </button>
        </div>
      </div>
    </div>
  )
}
