import { useMemo, useState } from 'react'
import { FlagBadge } from './FlagBadge'
import { useConditionCheck } from '../hooks/useConditionCheck'
import { CUISINES } from '../domain/types'
import { catColor } from '../domain/constants'
import { recipeAsFood } from '../domain/recipes'
import { toast } from '../store/dialogs'
import { useAppStore, useFoods } from '../store/useAppStore'
import { fmt } from '../lib/format'
import type { Cuisine, DayMeals, Recipe } from '../domain/types'

interface Props {
  /** Obrok u koji se jelo dodaje. */
  mealIndex: number
  onChange: (mutate: (meals: DayMeals) => void) => void
  onClose: () => void
}

/**
 * Katalog gotovih jela. Klik doda jelo u obrok s porcijom iz recepta, pa se
 * uobicajen unos svede na dva klika umjesto trazenja svakog sastojka.
 */
export function JeloPicker({ mealIndex, onChange, onClose }: Props) {
  const foods = useFoods()
  const check = useConditionCheck()
  const recipes = useAppStore((s) => s.data.recipes)
  const [query, setQuery] = useState('')
  const [cuisine, setCuisine] = useState<Cuisine | 'sve'>('sve')
  const [withDrink, setWithDrink] = useState(true)
  const [onlySuitable, setOnlySuitable] = useState(false)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const rank = (flag: ReturnType<typeof check.food>) =>
      flag?.level === 'izbjegavaj' ? 2 : flag?.level === 'oprez' ? 1 : 0

    return recipes
      .filter((r) => cuisine === 'sve' || (r.cuisine ?? 'ostalo') === cuisine)
      .filter((r) => !needle || r.name.toLowerCase().includes(needle) || (r.note ?? '').toLowerCase().includes(needle))
      .map((recipe) => {
        const food = recipeAsFood(recipe, foods)
        return { recipe, food, flag: check.food(food) }
      })
      .filter((m) => !onlySuitable || rank(m.flag) === 0)
      // Prikladna jela idu prva: kod odabira je bitno sto SE MOZE jesti, a
      // sporna se ne skrivaju jer odluka ostaje na korisniku.
      .sort((a, b) => rank(a.flag) - rank(b.flag) || a.recipe.name.localeCompare(b.recipe.name, 'hr'))
  }, [recipes, foods, query, cuisine, check, onlySuitable])

  const add = (recipe: Recipe) => {
    const food = recipeAsFood(recipe, foods)
    onChange((meals) => {
      meals[mealIndex]?.push({ foodId: food.id, g: food.serv })
      if (withDrink && recipe.drink) meals[mealIndex]?.push({ ...recipe.drink })
    })
    const drinkName = recipe.drink ? foods.byId(recipe.drink.foodId)?.name : null
    toast(
      `Dodano: ${recipe.name} (${fmt(food.serv)} g)` +
        (withDrink && drinkName ? ` uz ${drinkName}` : ''),
    )
  }

  return (
    <div className="modal-ov" role="dialog" aria-modal="true" aria-label="Odaberi jelo">
      <div className="modal-box wide" style={{ maxHeight: '86vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flexsplit">
          <div style={{ fontSize: 15, fontWeight: 700 }}>Odaberi jelo</div>
          <span className="small muted">{matches.length} jela</span>
        </div>

        <div className="row" style={{ margin: '10px 0' }}>
          <input
            autoFocus
            placeholder="🔍 Traži jelo…"
            aria-label="Traži jelo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, minWidth: 160 }}
          />
          <select
            style={{ width: 'auto' }}
            aria-label="Kuhinja"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value as Cuisine | 'sve')}
          >
            <option value="sve">Sve kuhinje</option>
            {CUISINES.map((c) => (
              <option value={c} key={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="row" style={{ gap: 6, margin: 0, whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              style={{ width: 'auto' }}
              checked={withDrink}
              onChange={(e) => setWithDrink(e.target.checked)}
            />
            <span className="small">uz piće</span>
          </label>
          {check.active && (
            <label className="row" style={{ gap: 6, margin: 0, whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                style={{ width: 'auto' }}
                checked={onlySuitable}
                onChange={(e) => setOnlySuitable(e.target.checked)}
              />
              <span className="small">samo prikladno</span>
            </label>
          )}
        </div>

        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {matches.length === 0 && <p className="muted small">Nema jela za taj pojam.</p>}
          {matches.map(({ recipe, food, flag }) => {
            const drink = recipe.drink ? foods.byId(recipe.drink.foodId) : null
            return (
              <div className="item" key={recipe.id} style={{ borderLeft: `3px solid ${catColor(recipe.cat)}` }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{recipe.name}</b>{' '}
                  <span className="muted small">
                    · {fmt(food.serv)} g porcija · {fmt(food.kcal * (food.serv / 100))} kcal
                    {recipe.cuisine ? ` · ${recipe.cuisine}` : ''}
                  </span>{' '}
                  <FlagBadge flag={flag} />
                  {recipe.note && (
                    <>
                      <br />
                      <span className="muted small">{recipe.note}</span>
                    </>
                  )}
                  {drink && withDrink && (
                    <>
                      <br />
                      <span className="tag">🍷 uz {drink.name}</span>
                    </>
                  )}
                </span>
                <button className="btn small" onClick={() => add(recipe)}>
                  + Dodaj
                </button>
              </div>
            )
          })}
        </div>

        <div className="modal-actions" style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={onClose}>
            Zatvori
          </button>
        </div>
      </div>
    </div>
  )
}
