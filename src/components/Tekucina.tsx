import { MEAL_INDEX } from '../domain/constants'
import { mealsFluid } from '../domain/nutrients'
import { toast } from '../store/dialogs'
import { useActivePerson, useFoods } from '../store/useAppStore'
import { targetsFor } from '../domain/targets'
import { fmt } from '../lib/format'
import type { DayMeals } from '../domain/types'

/** Voda iz ugradene baze; ostala pica se dodaju kao i svaka druga namirnica. */
const VODA = 'b65'
const CAJ = 'b77'
const KAVA = 'b76'

const BRZI: { foodId: string; label: string; ml: number }[] = [
  { foodId: VODA, label: '💧 Čaša vode', ml: 250 },
  { foodId: VODA, label: '💧 Velika čaša', ml: 500 },
  { foodId: VODA, label: '💧 Boca', ml: 1000 },
  { foodId: CAJ, label: '🍵 Čaj', ml: 250 },
  { foodId: KAVA, label: '☕ Kava', ml: 200 },
]

interface Props {
  date: string
  meals: DayMeals
  onChange: (mutate: (meals: DayMeals) => void) => void
}

/**
 * Brzi unos tekucine.
 *
 * Tekucina se racuna iz popijenih pica u obrocima, pa je voda dosad trazila
 * isti put kao i jelo — pretrazi namirnicu, upisi gramazu, dodaj. Za nesto sto
 * se ponavlja osam puta dnevno to je previse, pa ovdje ide na jedan klik.
 *
 * Upisuje se u meduobrok jer voda ne pripada nijednom obroku posebno, a mora
 * negdje stajati da bi ulazila u dnevni zbroj.
 */
export function Tekucina({ date, meals, onChange }: Props) {
  const foods = useFoods()
  const person = useActivePerson()
  const fluid = mealsFluid(meals, foods)
  const target = targetsFor(person, date).water
  const pct = target > 0 ? Math.min(100, (fluid / target) * 100) : 0

  const add = (foodId: string, ml: number) => {
    const food = foods.byId(foodId)
    if (!food) return toast('Namirnica nije u bazi.')
    onChange((draft) => {
      const meal = draft[MEAL_INDEX['Međuobrok']]
      if (!meal) return
      // Ista tekucina se zbraja u jednu stavku umjesto da se popis puni
      // s osam redaka "Voda 250 ml".
      const existing = meal.find((item) => 'foodId' in item && item.foodId === foodId)
      if (existing) existing.g += ml
      else meal.push({ foodId, g: ml })
    })
    toast(`+${ml} ml ${food.name.toLowerCase()}`)
  }

  return (
    <div className="card">
      <div className="flexsplit">
        <h2 style={{ margin: 0 }}>💧 Tekućina</h2>
        <span className={fluid >= target ? 'tag' : 'small muted'} style={fluid >= target ? { color: 'var(--good)' } : {}}>
          {fmt(fluid, 2)} / {fmt(target, 1)} L
        </span>
      </div>

      <div className="prog" role="progressbar" aria-label="Tekućina" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} style={{ margin: '8px 0 10px' }}>
        <div style={{ width: `${pct}%`, background: fluid >= target ? 'var(--good)' : 'var(--warn)' }} />
      </div>

      <div className="row">
        {BRZI.map((b) => (
          <button key={b.label} className="btn secondary small" onClick={() => add(b.foodId, b.ml)}>
            {b.label} {b.ml} ml
          </button>
        ))}
        {fluid > 0 && (
          <button
            className="btn danger small"
            title="Miče sva pića iz međuobroka za ovaj dan"
            onClick={() => {
              onChange((draft) => {
                const meal = draft[MEAL_INDEX['Međuobrok']]
                if (!meal) return
                // Brise se samo ono sto je ovaj brzi unos i mogao dodati — hrana
                // u meduobroku ostaje netaknuta.
                const before = meal.length
                const ids = new Set(BRZI.map((b) => b.foodId))
                for (let i = meal.length - 1; i >= 0; i--) {
                  const item = meal[i]!
                  if ('foodId' in item && ids.has(item.foodId)) meal.splice(i, 1)
                }
                if (before === meal.length) toast('Nema brzog unosa tekućine za ovaj dan.')
                else toast('Brzi unos tekućine poništen.')
              })
            }}
          >
            ↺ Poništi
          </button>
        )}
      </div>
      <p className="hint" style={{ marginBottom: 0 }}>
        Upisuje se u međuobrok i zbraja s pićima iz ostalih obroka. Cilj se računa iz tjelesne mase.
      </p>
    </div>
  )
}
