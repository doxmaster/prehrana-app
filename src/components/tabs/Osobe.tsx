import { useState } from 'react'
import { ACTIVITY_LEVELS, ADULT_AGE, GOALS, PROFILE_LIMITS, computeTargets, isMinor, targetsFor, weightOn } from '../../domain/targets'
import { REFERENCE_KCAL, householdFactor, householdKcal, memberShares } from '../../domain/household'
import { CONDITIONS, capsForCondition, conditionPlan, conflictsIn, personConditions, raisesForCondition } from '../../domain/conditions'
import { NUTRIENTS } from '../../domain/constants'
import { proteinPerKg } from '../../domain/dri'
import { uid } from '../../domain/id'
import { todayISO } from '../../domain/dates'
import { confirmDialog, promptDialog, toast } from '../../store/dialogs'
import { newPerson, useActivePerson, useAppStore, useUpdate } from '../../store/useAppStore'
import { fmt } from '../../lib/format'
import type { ConditionId } from '../../domain/conditions'
import type { NutrientKey, Profile } from '../../domain/types'

/** Vraća broj samo ako je unutar dopuštenog raspona — inače null. */
function inRange(raw: string, limits: { min: number; max: number }): number | null {
  const value = parseFloat(raw.replace(',', '.'))
  return Number.isFinite(value) && value >= limits.min && value <= limits.max ? value : null
}

export function Osobe() {
  const person = useActivePerson()
  const update = useUpdate()
  const people = useAppStore((s) => s.data.profiles)

  const [form, setForm] = useState(() => ({
    sex: person.profile.sex,
    age: String(person.profile.age),
    weight: String(person.profile.weight),
    height: String(person.profile.height),
    act: String(person.profile.act),
    goal: String(person.profile.goal),
    personId: person.id,
  }))

  // Prebacivanje osobe mora povući njezine podatke u obrazac.
  if (form.personId !== person.id) {
    setForm({
      sex: person.profile.sex,
      age: String(person.profile.age),
      weight: String(person.profile.weight),
      height: String(person.profile.height),
      act: String(person.profile.act),
      goal: String(person.profile.goal),
      personId: person.id,
    })
  }

  const age = inRange(form.age, PROFILE_LIMITS.age)
  const weight = inRange(form.weight, PROFILE_LIMITS.weight)
  const height = inRange(form.height, PROFILE_LIMITS.height)

  const maloljetnik = isMinor(person.profile)
  const targets = targetsFor(person, todayISO())
  const measuredWeight = weightOn(person, todayISO())
  const usesMeasurement = measuredWeight !== person.profile.weight

  const plan = conditionPlan(targets, person, measuredWeight)
  const capNote = (key: NutrientKey) => {
    const cap = plan.caps.find((c) => c.key === key)
    return cap ? `najviše ${fmt(cap.max)} — ${cap.conditionName}` : null
  }

  const save = () => {
    if (age === null || weight === null || height === null) {
      // Poruka se izvodi iz samih granica da ne zastari kad se one promijene.
      const { age: a, weight: w, height: h } = PROFILE_LIMITS
      toast(
        `Provjeri unos: dob ${a.min}–${a.max} g., težina ${w.min}–${w.max} kg, visina ${h.min}–${h.max} cm.`,
      )
      return
    }
    const profile: Profile = {
      sex: form.sex,
      age,
      weight,
      height,
      act: Number(form.act) || PROFILE_LIMITS.act.def,
      goal: Number(form.goal) || 0,
    }
    update((draft) => {
      const target = draft.profiles.find((p) => p.id === person.id)
      if (target) target.profile = profile
    })
    toast('Spremljeno.')
  }

  return (
    <>
      <div className="card">
        <h2>Osobe</h2>
        <p className="muted small" style={{ margin: '-6px 0 10px' }}>
          Osoba se bira u zaglavlju, gore desno — odabir vrijedi na svim karticama.
        </p>
        <div className="row" style={{ marginBottom: 12 }}>
          <button
            className="btn small"
            onClick={async () => {
              const name = await promptDialog('Ime nove osobe:', '')
              if (!name?.trim()) return
              const created = newPerson(name.trim())
              update((draft) => {
                draft.profiles.push(created)
                draft.activeProfileId = created.id
              })
              toast(`Dodana osoba: ${created.name}`)
            }}
          >
            + Nova osoba
          </button>
          <button
            className="btn secondary small"
            onClick={async () => {
              const name = await promptDialog('Novo ime:', person.name)
              if (!name?.trim()) return
              update((draft) => {
                const target = draft.profiles.find((p) => p.id === person.id)
                if (target) target.name = name.trim()
              })
            }}
          >
            Preimenuj
          </button>
          <button
            className="btn danger small"
            onClick={async () => {
              if (people.length <= 1) return toast('Mora postojati barem jedna osoba.')
              if (!(await confirmDialog(`Obrisati osobu "${person.name}" i sve njene podatke?`, 'Obriši')))
                return
              update((draft) => {
                draft.profiles = draft.profiles.filter((p) => p.id !== person.id)
                draft.activeProfileId = draft.profiles[0]!.id
                // Bez ovoga id obrisane osobe ostaje u kucanstvu do sljedeceg
                // ucitavanja, pa se u podacima nose clanovi kojih nema.
                for (const household of draft.households) {
                  household.memberIds = household.memberIds.filter((id) => id !== person.id)
                }
              })
            }}
          >
            Obriši
          </button>
        </div>
        <p className="muted small">
          Svaka osoba ima vlastite ciljeve, dnevnik i mjerenja. Jelovnici, recepti i baza namirnica
          zajednički su za sve osobe.
        </p>
      </div>

      <Obitelji />

      <div className="card">
        <h2>Podaci — {person.name}</h2>
        {maloljetnik && (
          <div className="banner" style={{ marginTop: 4 }}>
            Ciljevi se za dob ispod {ADULT_AGE} godina računaju po Schofieldovoj jednadžbi
            (FAO/WHO), a mikronutrijenti prate preporuke za tu dob — kalcij je viši nego kod
            odraslih, željezo i magnezij niži. <b>Cilj mršavljenja se ne nudi</b>: u dobi rasta to
            nije stvar računanja kalorija. Za bilo kakvu prehrambenu intervenciju kod djeteta
            posavjetuj se s pedijatrom.
          </div>
        )}
        <div className="grid g3" style={{ marginTop: 10 }}>
          <div>
            <label htmlFor="p-sex">Spol</label>
            <select
              id="p-sex"
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value as 'm' | 'z' })}
            >
              <option value="m">Muško</option>
              <option value="z">Žensko</option>
            </select>
          </div>
          <div>
            <label htmlFor="p-age">Dob (godina)</label>
            <input
              id="p-age"
              type="number"
              min={PROFILE_LIMITS.age.min}
              max={PROFILE_LIMITS.age.max}
              aria-invalid={age === null}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="p-act">Razina aktivnosti</label>
            <select id="p-act" value={form.act} onChange={(e) => setForm({ ...form, act: e.target.value })}>
              {ACTIVITY_LEVELS.map((a) => (
                <option value={a.value} key={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="p-weight">Težina (kg)</label>
            <input
              id="p-weight"
              type="number"
              min={PROFILE_LIMITS.weight.min}
              max={PROFILE_LIMITS.weight.max}
              step="0.1"
              inputMode="decimal"
              aria-invalid={weight === null}
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="p-height">Visina (cm)</label>
            <input
              id="p-height"
              type="number"
              min={PROFILE_LIMITS.height.min}
              max={PROFILE_LIMITS.height.max}
              aria-invalid={height === null}
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="p-goal">Cilj</label>
            <select
              id="p-goal"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            >
              {GOALS.filter((g) => !maloljetnik || g.value >= 0).map((g) => (
                <option value={g.value} key={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }} className="row">
          <button className="btn" onClick={save}>
            Spremi i izračunaj
          </button>
        </div>
        {usesMeasurement && (
          <p className="hint">
            Ciljevi se računaju iz zadnje izmjerene težine ({fmt(measuredWeight, 1)} kg), ne iz ove
            upisane.
          </p>
        )}
      </div>

      <Zdravlje />

      <div className="card">
        <h2>Dnevni ciljevi — {person.name}</h2>
        {plan.caps.length > 0 && (
          <p className="muted small" style={{ margin: '-6px 0 10px' }}>
            Vrijednosti označene s <b>najviše</b> nisu cilj nego gornja granica — kod njih više nije
            bolje.
          </p>
        )}
        <div className="grid g4">
          <TargetCard
            label="Kalorije"
            value={`${fmt(plan.targets.kcal)} kcal`}
            note={`BMR ${fmt(targets.bmr)} · TDEE ${fmt(targets.tdee)} · ${maloljetnik ? 'Schofield' : 'Mifflin-St Jeor'}`}
          />
          <TargetCard
            label="Bjelančevine"
            value={`${fmt(plan.targets.p)} g`}
            note={capNote('p') ?? `≈${fmt(proteinPerKg(person.profile.age), 2)} g/kg`}
            capped={!!capNote('p')}
          />
          <TargetCard
            label="Ugljikohidrati"
            value={`${fmt(plan.targets.c)} g`}
            note={capNote('c') ?? 'ostatak energije'}
            capped={!!capNote('c')}
          />
          <TargetCard label="Masti" value={`${fmt(plan.targets.f)} g`} note="≈25 % energije" />
          <TargetCard label="Vlakna" value={`${fmt(plan.targets.fib)} g`} note="14 g/1000 kcal" />
          <TargetCard
            label="Željezo"
            value={`${fmt(plan.targets.fe)} mg`}
            note={capNote('fe') ?? 'DRI za dob'}
            capped={!!capNote('fe')}
          />
          <TargetCard label="Kalcij" value={`${fmt(plan.targets.ca)} mg`} note="DRI za dob" />
          <TargetCard label="Magnezij" value={`${fmt(plan.targets.mg)} mg`} note="DRI za dob" />
          <TargetCard label="Vitamin C" value={`${fmt(plan.targets.vc)} mg`} note="DRI za dob" />
          <TargetCard label="Vitamin D" value={`${fmt(plan.targets.vd)} µg`} note="DRI za dob" />
          <TargetCard
            label="Voda"
            value={`${fmt(targets.water, 1)} L`}
            note={maloljetnik ? 'Holliday-Segar' : '≈35 ml/kg'}
          />
        </div>
        <p className="hint">Ciljevi su okvirni i ne zamjenjuju savjet liječnika ili nutricionista.</p>
      </div>
    </>
  )
}

/**
 * Kucanstva odreduju kolicine u tjednoj nabavi: svaki clan nosi udio izracunat
 * iz svoje energetske potrebe, pa obitelj s malom djecom ne kupuje kao da su
 * svi odrasli.
 */
function Obitelji() {
  const update = useUpdate()
  const people = useAppStore((s) => s.data.profiles)
  const households = useAppStore((s) => s.data.households)

  return (
    <div className="card">
      <div className="flexsplit">
        <h2 style={{ margin: 0 }}>Obitelj / kućanstvo</h2>
        <button
          className="btn small"
          onClick={async () => {
            const name = await promptDialog('Naziv kućanstva:', 'Obitelj')
            if (!name?.trim()) return
            update((draft) => {
              draft.households.push({ id: uid('h'), name: name.trim(), memberIds: [] })
            })
          }}
        >
          + Novo kućanstvo
        </button>
      </div>
      <p className="muted small" style={{ margin: '4px 0 12px' }}>
        Udio članova množi količine u tjednoj nabavi. Računa se iz dnevnog cilja kalorija naspram
        referentnih {REFERENCE_KCAL} kcal, a možeš ga i sam zadati u podacima osobe.
      </p>

      {households.map((household) => {
        const shares = memberShares(household, people)
        const total = householdFactor(household, people)
        return (
          <div className="meal" key={household.id}>
            <div className="meal-head">
              <b>{household.name}</b>
              <span className="row" style={{ gap: 6 }}>
                <span className="small muted">
                  ukupni udio <b>{fmt(total, 2)}</b> · {fmt(householdKcal(household, people))} kcal/dan
                </span>
                <button
                  className="icon"
                  title="Preimenuj kućanstvo"
                  aria-label={`Preimenuj ${household.name}`}
                  onClick={async () => {
                    const name = await promptDialog('Novi naziv:', household.name)
                    if (!name?.trim()) return
                    update((draft) => {
                      const target = draft.households.find((h) => h.id === household.id)
                      if (target) target.name = name.trim()
                    })
                  }}
                >
                  ✎
                </button>
                <button
                  className="icon"
                  title="Obriši kućanstvo"
                  aria-label={`Obriši ${household.name}`}
                  onClick={async () => {
                    if (households.length <= 1) return toast('Mora postojati barem jedno kućanstvo.')
                    if (!(await confirmDialog(`Obrisati kućanstvo "${household.name}"?`, 'Obriši')))
                      return
                    update((draft) => {
                      draft.households = draft.households.filter((h) => h.id !== household.id)
                      for (const week of draft.weeks) {
                        if (week.householdId === household.id) delete week.householdId
                      }
                    })
                  }}
                >
                  ✕
                </button>
              </span>
            </div>

            {people.map((person) => {
              const member = household.memberIds.includes(person.id)
              const share = shares.find((s) => s.person.id === person.id)
              return (
                <div className="item" key={person.id}>
                  <label className="row" style={{ gap: 8, margin: 0, flex: 1 }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto' }}
                      checked={member}
                      onChange={(e) =>
                        update((draft) => {
                          const target = draft.households.find((h) => h.id === household.id)
                          if (!target) return
                          if (e.target.checked) {
                            if (!target.memberIds.includes(person.id)) target.memberIds.push(person.id)
                          } else {
                            target.memberIds = target.memberIds.filter((id) => id !== person.id)
                          }
                        })
                      }
                    />
                    <span style={{ fontWeight: 600 }}>{person.name}</span>
                    <span className="muted small">
                      {fmt(computeTargets(person.profile).kcal)} kcal/dan
                    </span>
                  </label>
                  {member && share && (
                    <span className="row">
                      <span className="muted small">udio</span>
                      <input
                        className="gr"
                        type="number"
                        min="0.2"
                        max="2.5"
                        step="0.05"
                        aria-label={`Udio za ${person.name}`}
                        value={share.factor}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          update((draft) => {
                            const target = draft.profiles.find((p) => p.id === person.id)
                            if (!target) return
                            // Prazno ili nula znaci "vrati na izracunati udio".
                            if (value > 0) target.portionFactor = value
                            else delete target.portionFactor
                          })
                        }}
                      />
                      {share.manual && (
                        <button
                          className="icon"
                          title="Vrati na izračunati udio"
                          aria-label={`Vrati izračunati udio za ${person.name}`}
                          onClick={() =>
                            update((draft) => {
                              const target = draft.profiles.find((p) => p.id === person.id)
                              if (target) delete target.portionFactor
                            })
                          }
                        >
                          ↺
                        </button>
                      )}
                    </span>
                  )}
                </div>
              )
            })}

            {!household.memberIds.length && (
              <p className="muted small" style={{ margin: '8px 0 0' }}>
                Nema članova — označi ih iznad da bi nabava imala smisla.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TargetCard({
  label,
  value,
  note,
  capped,
}: {
  label: string
  value: string
  note?: string
  /** Vrijednost je gornja granica, ne cilj — mora se razlikovati na prvi pogled. */
  capped?: boolean
}) {
  return (
    <div
      className="card"
      style={{
        margin: 0,
        background: 'var(--panel2)',
        ...(capped ? { borderLeft: '3px solid var(--warn, #d97706)' } : {}),
      }}
    >
      <div className="muted small">
        {label} {capped && <span title="Gornja granica">⛔</span>}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, margin: '2px 0' }}>{value}</div>
      {note && <div className="muted small">{note}</div>}
    </div>
  )
}

/**
 * Zdravstvena stanja osobe. Namjerno je odvojeno od profila: ovo nije mjera
 * nego odluka koja mijenja i ciljeve i ocjenu namirnica, pa mora biti vidljivo
 * sto je ukljuceno i sto to konkretno mijenja.
 */
function Zdravlje() {
  const person = useActivePerson()
  const update = useUpdate()
  const chosen = personConditions(person)
  const conflicts = conflictsIn(chosen)

  const today = todayISO()
  const targets = targetsFor(person, today)
  const weight = weightOn(person, today)
  const plan = conditionPlan(targets, person, weight)

  const nutrientLabel = (key: NutrientKey) => NUTRIENTS.find((n) => n.key === key)
  const capLine = (cap: (typeof plan.caps)[number]) => {
    const meta = nutrientLabel(cap.key)
    return `${meta?.label}: najviše ${fmt(cap.max)} ${meta?.unit}/dan`
  }

  const toggle = (id: ConditionId) =>
    update((draft) => {
      const target = draft.profiles.find((p) => p.id === person.id)
      if (!target) return
      const list = new Set(target.conditions ?? [])
      if (list.has(id)) list.delete(id)
      else list.add(id)
      if (list.size) target.conditions = [...list]
      else delete target.conditions
    })

  return (
    <div className="card">
      <h2>Zdravstvena stanja — {person.name}</h2>
      <p className="muted small" style={{ margin: '-6px 0 12px' }}>
        Odabrano stanje mijenja dnevne ciljeve i označava namirnice i jela koja se uz njega
        ograničavaju. Ovo je pomoć pri planiranju, <b>ne liječnički savjet</b> — osobne granice
        zadaje liječnik.
      </p>

      {conflicts.map((c) => (
        <div className="banner warn" key={`${c.a}-${c.b}`} style={{ marginBottom: 10 }}>
          {c.why}
        </div>
      ))}

      {plan.caps.length > 0 && (
        <div className="banner warn" style={{ marginBottom: 12 }}>
          <b>⛔ Dnevne granice za {person.name}</b>
          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
            {plan.caps.map((cap) => (
              <li key={cap.key}>
                {capLine(cap)} <span className="muted small">({cap.conditionName})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {CONDITIONS.map((c) => {
        const on = chosen.includes(c.id)
        const caps = capsForCondition(c.id, targets, weight)
        const raises = Object.entries(raisesForCondition(c.id, targets)) as [NutrientKey, number][]
        return (
          <label
            key={c.id}
            className="item"
            style={{ alignItems: 'flex-start', cursor: 'pointer', paddingLeft: 0 }}
          >
            <input
              type="checkbox"
              style={{ width: 'auto', marginTop: 3 }}
              checked={on}
              onChange={() => toggle(c.id)}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <b>{c.name}</b>{' '}
              {caps.map((cap) => (
                <span
                  key={cap.key}
                  className="tag"
                  style={{ color: 'var(--bad)', whiteSpace: 'nowrap' }}
                  title="Gornja granica koju ovo stanje postavlja"
                >
                  ⛔ {capLine(cap)}
                </span>
              ))}
              {raises.map(([key, value]) => (
                <span key={key} className="tag" style={{ color: 'var(--good)', whiteSpace: 'nowrap' }}>
                  ↑ {nutrientLabel(key)?.label} {fmt(value)} {nutrientLabel(key)?.unit}
                </span>
              ))}
              <br />
              <span className="muted small">{c.short}</span>
              {on && (
                <span className="small" style={{ display: 'block', marginTop: 6 }}>
                  <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
                    {CONDITIONS.find((x) => x.id === c.id)!.advice.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  {c.blind && (
                    <span className="muted" style={{ display: 'block', marginTop: 4 }}>
                      ⓘ {c.blind}
                    </span>
                  )}
                </span>
              )}
            </span>
          </label>
        )
      })}
    </div>
  )
}
