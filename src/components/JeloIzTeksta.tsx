import { useMemo, useState } from 'react'
import { CATEGORIES } from '../domain/types'
import { parseRecipe } from '../domain/parseRecipe'
import { recipeTotals } from '../domain/recipes'
import { uid } from '../domain/id'
import { toast } from '../store/dialogs'
import { useAppStore, useFoods, useUpdate } from '../store/useAppStore'
import { fmt } from '../lib/format'
import type { Category, Recipe } from '../domain/types'

/**
 * Dodavanje jela lijepljenjem popisa sastojaka.
 *
 * Ugradeni katalog je ono sto aplikacija sama nosi; ovime korisnik dodaje jelo
 * iz BILO KOJEG izvora — s videa, s kuharskog portala, iz biljeznice — u svoje
 * podatke. Prepisuje se samo popis sastojaka i kolicina, sto je i jedino sto
 * treba za izracun.
 *
 * Sto se ne prepozna, pokazuje se prije spremanja umjesto da se tiho preskoci:
 * jelo kojem fali sastojak izgleda ispravno, a daje krive vrijednosti.
 */
export function JeloIzTeksta({ onClose }: { onClose: () => void }) {
  const foods = useFoods()
  const update = useUpdate()
  const recipes = useAppStore((s) => s.data.recipes)

  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [cat, setCat] = useState<Category>('Meso i riba')
  /*
   * Prazno, ne "4": predpopunjena vrijednost pregazila bi broj procitan iz
   * teksta ("Za 6 osoba"), a korisnik bi u polju vidio 4 i mislio da je tako
   * pisalo. Prazno polje pokazuje procitani broj kao rezervu.
   */
  const [servings, setServings] = useState('')
  const [dropped, setDropped] = useState<number[]>([])

  // Samo namirnice: jelo ne smije postati sastojak drugog jela.
  const parsed = useMemo(() => parseRecipe(text, foods.ingredients()), [text, foods])
  const kept = parsed.items.filter((_, i) => !dropped.includes(i))

  const finalName = (name.trim() || parsed.name).trim()
  const finalServings = Math.max(1, Number(servings) || parsed.servings)

  /** Vrijednosti se racunaju istim putem kao za ugradena jela. */
  const preview = useMemo(() => {
    if (!kept.length) return null
    const draft: Recipe = {
      id: 'preview',
      name: finalName || 'Jelo',
      cat,
      servings: finalServings,
      items: kept.map((i) => ({ foodId: i.foodId, g: i.g })),
    }
    const { per100, grams } = recipeTotals(draft, foods)
    const serv = Math.round(grams / finalServings)
    return { kcal: Math.round((per100.kcal / 100) * serv), serv, grams: Math.round(grams) }
  }, [kept, cat, finalName, finalServings, foods])

  const save = () => {
    if (!finalName) return toast('Upiši naziv jela.')
    if (!kept.length) return toast('Nijedan sastojak nije prepoznat.')
    if (recipes.some((r) => r.name.toLowerCase() === finalName.toLowerCase())) {
      return toast(`Jelo "${finalName}" već postoji u katalogu.`)
    }

    update((draft) => {
      draft.recipes.push({
        id: uid('rc'),
        name: finalName,
        cat,
        servings: finalServings,
        items: kept.map((i) => ({ foodId: i.foodId, g: i.g })),
        note: 'Dodano lijepljenjem sastojaka.',
      })
    })
    toast(`Dodano jelo: ${finalName}`)
    onClose()
  }

  return (
    <div className="modal-ov" role="dialog" aria-modal="true" aria-label="Novo jelo iz teksta">
      <div className="modal-box wide" style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flexsplit">
          <div style={{ fontSize: 15, fontWeight: 700 }}>Novo jelo iz teksta</div>
          {preview && (
            <span className="small muted">
              porcija {fmt(preview.serv)} g · <b>{fmt(preview.kcal)} kcal</b>
            </span>
          )}
        </div>

        <p className="muted small" style={{ margin: '6px 0 8px' }}>
          Zalijepi popis sastojaka — iz opisa videa, s kuharske stranice, iz bilježnice. Prepisuju se
          samo sastojci i količine; vrijednosti se računaju iz tvoje baze namirnica.
        </p>

        <textarea
          autoFocus
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setDropped([])
          }}
          placeholder={'Sarma\nZa 6 osoba\n800 g kupusa\n400 g mljevenog mesa\n200 g riže\n1 luk\n2 žlice ulja'}
          style={{ minHeight: 130, fontFamily: 'inherit' }}
        />

        <div className="grid g3" style={{ marginTop: 10 }}>
          <div>
            <label htmlFor="jit-name">Naziv jela</label>
            <input
              id="jit-name"
              value={name}
              placeholder={parsed.name || 'npr. Bakina sarma'}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="jit-cat">Kategorija</label>
            <select id="jit-cat" value={cat} onChange={(e) => setCat(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="jit-serv">Broj porcija</label>
            <input
              id="jit-serv"
              type="number"
              min="1"
              max="20"
              value={servings}
              placeholder={String(parsed.servings)}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, marginTop: 10 }}>
          {parsed.items.map((item, i) => {
            const off = dropped.includes(i)
            return (
              <div className="item" key={`${item.foodId}-${i}`} style={{ opacity: off ? 0.45 : 1 }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{item.foodName}</b> <span className="muted small">{fmt(item.g)} g</span>
                  {item.assumedAmount && (
                    <span className="tag" style={{ color: 'var(--warn)' }}>
                      ⚠ količina nije navedena
                    </span>
                  )}
                  <br />
                  <span className="muted small">iz retka: {item.source}</span>
                </span>
                <button
                  className="btn secondary small"
                  onClick={() => setDropped((d) => (off ? d.filter((x) => x !== i) : [...d, i]))}
                >
                  {off ? 'vrati' : 'izbaci'}
                </button>
              </div>
            )
          })}

          {parsed.unknown.length > 0 && (
            <div className="banner warn" style={{ marginTop: 10 }}>
              <b>Nije prepoznato ({parsed.unknown.length}):</b>
              <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                {parsed.unknown.map((u) => (
                  <li key={u} className="small">
                    {u}
                  </li>
                ))}
              </ul>
              <span className="small muted">
                Namirnicu koje nema u bazi dodaj u kartici Namirnice, pa zalijepi ponovno.
              </span>
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={onClose}>
            Odustani
          </button>
          <button className="btn" onClick={save} disabled={!kept.length}>
            Dodaj u katalog ({kept.length})
          </button>
        </div>
      </div>
    </div>
  )
}
