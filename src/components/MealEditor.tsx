import { useId, useState } from 'react'
import { CatIcon } from './CatIcon'
import { FlagBadge } from './FlagBadge'
import { JeloPicker } from './JeloPicker'
import { useConditionCheck } from '../hooks/useConditionCheck'
import { MEALS } from '../domain/constants'
import { catColor } from '../domain/constants'
import {
  itemCategory,
  itemName,
  itemPer100,
  itemUnit,
  scale,
  sumItems,
} from '../domain/nutrients'
import { isFoodRef } from '../domain/types'
import { useClipboard } from '../store/clipboard'
import { confirmDialog, toast } from '../store/dialogs'
import { useAppStore, useFoods } from '../store/useAppStore'
import { fmt } from '../lib/format'
import type { DayMeals, MealItem, Nutrients } from '../domain/types'

interface Props {
  meals: DayMeals
  /** Prima izmjenjivi nacrt obroka; sve izmjene idu kroz store. */
  onChange: (mutate: (meals: DayMeals) => void) => void
}

export function MealEditor({ meals, onChange }: Props) {
  return (
    <div>
      {MEALS.map((name, index) => (
        <Meal key={name} name={name} index={index} items={meals[index] ?? []} onChange={onChange} />
      ))}
    </div>
  )
}

function Meal({
  name,
  index,
  items,
  onChange,
}: {
  name: string
  index: number
  items: MealItem[]
  onChange: Props['onChange']
}) {
  const foods = useFoods()
  const clipboard = useClipboard()
  const undo = useAppStore((s) => s.undo)
  const totals = sumItems(items, foods)
  const [query, setQuery] = useState('')
  const [grams, setGrams] = useState('100')
  const [pickerOpen, setPickerOpen] = useState(false)
  const listId = useId()
  const foodInputId = useId()
  const gramsInputId = useId()

  const addFood = () => {
    const food = foods.byName(query)
    if (!food) {
      toast('Namirnica nije pronađena — odaberi s popisa ili je dodaj u kartici Namirnice.')
      return
    }
    const amount = Number(grams) || food.serv
    onChange((draft) => {
      draft[index]?.push({ foodId: food.id, g: amount })
    })
    setQuery('')
    setGrams('100')
  }

  return (
    <div className="meal">
      <div className="meal-head">
        <span className="row" style={{ gap: 5 }}>
          <b>{name}</b>
          <button
            className="icon"
            title="Kopiraj obrok"
            aria-label={`Kopiraj obrok ${name}`}
            onClick={() => {
              if (!items.length) return toast(`${name} je prazan.`)
              clipboard.copyMeal(items)
              toast(`Kopiran ${name}. Odaberi drugi obrok pa zalijepi.`)
            }}
          >
            ⧉
          </button>
          <button
            className="icon"
            title="Zalijepi obrok"
            aria-label={`Zalijepi u obrok ${name}`}
            onClick={async () => {
              const copied = clipboard.meal
              if (!copied) return toast('Prvo kopiraj neki obrok.')
              if (items.length && !(await confirmDialog(`Zalijepiti preko obroka ${name}?`, 'Zalijepi')))
                return
              onChange((draft) => {
                draft[index] = structuredClone(copied)
              })
            }}
          >
            📋
          </button>
          <button
            className="icon"
            title="Isprazni obrok"
            aria-label={`Isprazni obrok ${name}`}
            onClick={async () => {
              if (!items.length) return toast(`${name} je već prazan.`)
              if (!(await confirmDialog(`Isprazniti ${name}? Briše se ${items.length} stavki.`, 'Isprazni')))
                return
              onChange((draft) => {
                draft[index] = []
              })
              toast(`${name} ispražnjen.`, { label: '↩ Poništi', run: undo })
            }}
          >
            🗑
          </button>
        </span>
        <span className="small muted">
          <span className="kcal-c">{fmt(totals.kcal)} kcal</span> · Bjelančevine {fmt(totals.p)} g ·
          Ugljikohidrati {fmt(totals.c)} g · Masti {fmt(totals.f)} g
        </span>
      </div>

      {items.map((item, itemIndex) => (
        <Item
          key={`${itemIndex}-${isFoodRef(item) ? item.foodId : item.name}`}
          item={item}
          onCopy={() => {
            clipboard.copyItem(item)
            toast(`Kopirano: ${itemName(item, foods)}`)
          }}
          onGrams={(value) =>
            onChange((draft) => {
              const target = draft[index]?.[itemIndex]
              if (target) target.g = value
            })
          }
          onDelete={() => {
            const naziv = itemName(item, foods)
            onChange((draft) => {
              draft[index]?.splice(itemIndex, 1)
            })
            // Bez potvrde, jer je brisanje jedne stavke cesto i namjerno; ali
            // se odmah nudi povratak, pa promasen klik ne kosta nista.
            toast(`Obrisano: ${naziv}`, { label: '↩ Poništi', run: undo })
          }}
        />
      ))}

      {pickerOpen && (
        <JeloPicker mealIndex={index} onChange={onChange} onClose={() => setPickerOpen(false)} />
      )}

      <div className="add-row">
        <div>
          <label htmlFor={foodInputId}>Namirnica (tipkaj za pretragu)</label>
          <input
            id={foodInputId}
            list={listId}
            value={query}
            placeholder="npr. pile..."
            onChange={(e) => {
              setQuery(e.target.value)
              const match = foods.byName(e.target.value)
              if (match) setGrams(String(match.serv))
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addFood()
            }}
          />
          <datalist id={listId}>
            {foods.all().map((f) => (
              <option value={f.name} key={f.id} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor={gramsInputId}>Grama / ml</label>
          <input
            id={gramsInputId}
            type="number"
            min="1"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />
        </div>
        <div className="row">
          <button className="btn small" onClick={addFood}>
            + Dodaj
          </button>
          <button
            className="btn small"
            title="Odaberi gotovo jelo"
            aria-label={`Odaberi gotovo jelo za ${name}`}
            onClick={() => setPickerOpen(true)}
          >
            🍲 Jelo
          </button>
          <button
            className="btn secondary small"
            title="Zalijepi kopiranu namirnicu"
            aria-label={`Zalijepi kopiranu namirnicu u ${name}`}
            onClick={() => {
              const copied = clipboard.item
              if (!copied) return toast('Prvo kopiraj namirnicu (⧉ uz stavku).')
              onChange((draft) => {
                draft[index]?.push(structuredClone(copied))
              })
            }}
          >
            📋
          </button>
        </div>
      </div>
    </div>
  )
}

function Item({
  item,
  onGrams,
  onDelete,
  onCopy,
}: {
  item: MealItem
  onGrams: (value: number) => void
  onDelete: () => void
  onCopy: () => void
}) {
  const foods = useFoods()
  const check = useConditionCheck()
  const per100 = itemPer100(item, foods)
  const name = itemName(item, foods)
  const color = catColor(itemCategory(item, foods))
  const scaled: Nutrients | null = per100 ? scale(per100, item.g) : null
  const flag = check.item(item)

  return (
    <div className="item" style={{ borderLeft: `3px solid ${color}` }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <CatIcon cat={itemCategory(item, foods)} />{' '}
        {name}
        {!isFoodRef(item) && (
          <span className="tag" title="AI stavka — nije spremljena u bazu">
            {' '}
            🤖
          </span>
        )}{' '}
        <FlagBadge flag={flag} />{' '}
        {scaled ? (
          <span className="muted small">
            · <span className="kcal-c">{fmt(scaled.kcal)} kcal</span> · B {fmt(scaled.p, 1)} g · UH{' '}
            {fmt(scaled.c, 1)} g · M {fmt(scaled.f, 1)} g
          </span>
        ) : (
          <span className="muted small">· ⚠ namirnica više ne postoji u bazi</span>
        )}
      </span>
      <span className="row">
        <input
          className="gr"
          type="number"
          min="1"
          value={item.g}
          aria-label={`Količina za ${name}`}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (value > 0) onGrams(value)
          }}
        />
        <span className="muted small">{itemUnit(item, foods)}</span>
        <button className="icon" title="Kopiraj namirnicu" aria-label={`Kopiraj ${name}`} onClick={onCopy}>
          ⧉
        </button>
        <button className="icon" title="Obriši stavku" aria-label={`Obriši ${name}`} onClick={onDelete}>
          ✕
        </button>
      </span>
    </div>
  )
}
