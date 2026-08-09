import { useState } from 'react'
import { ACTIVITY_LEVELS, GOALS, PROFILE_LIMITS, targetsFor, weightOn } from '../../domain/targets'
import { todayISO } from '../../domain/dates'
import { confirmDialog, promptDialog, toast } from '../../store/dialogs'
import { newPerson, useActivePerson, useAppStore, useUpdate } from '../../store/useAppStore'
import { PersonPicker } from '../PersonPicker'
import { fmt } from '../../lib/format'
import type { Profile } from '../../domain/types'

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

  const targets = targetsFor(person, todayISO())
  const measuredWeight = weightOn(person, todayISO())
  const usesMeasurement = measuredWeight !== person.profile.weight

  const save = () => {
    if (age === null || weight === null || height === null) {
      toast('Provjeri unos: dob 10–100 g., težina 30–250 kg, visina 120–220 cm.')
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
        <div className="row" style={{ marginBottom: 12 }}>
          <PersonPicker />
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

      <div className="card">
        <h2>Podaci — {person.name}</h2>
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
            <select id="p-goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
              {GOALS.map((g) => (
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

      <div className="card">
        <h2>Dnevni ciljevi — {person.name}</h2>
        <div className="grid g4">
          <TargetCard label="Kalorije" value={`${fmt(targets.kcal)} kcal`} note={`BMR ${fmt(targets.bmr)} · TDEE ${fmt(targets.tdee)}`} />
          <TargetCard label="Bjelančevine" value={`${fmt(targets.p)} g`} note="≈1,6 g/kg" />
          <TargetCard label="Ugljikohidrati" value={`${fmt(targets.c)} g`} note="ostatak energije" />
          <TargetCard label="Masti" value={`${fmt(targets.f)} g`} note="≈25 % energije" />
          <TargetCard label="Vlakna" value={`${fmt(targets.fib)} g`} note="14 g/1000 kcal" />
          <TargetCard label="Željezo" value={`${fmt(targets.fe)} mg`} />
          <TargetCard label="Kalcij" value={`${fmt(targets.ca)} mg`} />
          <TargetCard label="Magnezij" value={`${fmt(targets.mg)} mg`} />
          <TargetCard label="Vitamin C" value={`${fmt(targets.vc)} mg`} />
          <TargetCard label="Vitamin D" value={`${fmt(targets.vd)} µg`} />
          <TargetCard label="Voda" value={`${fmt(targets.water, 1)} L`} note="≈35 ml/kg" />
        </div>
        <p className="hint">Ciljevi su okvirni i ne zamjenjuju savjet liječnika ili nutricionista.</p>
      </div>
    </>
  )
}

function TargetCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card" style={{ margin: 0, background: 'var(--panel2)' }}>
      <div className="muted small">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, margin: '2px 0' }}>{value}</div>
      {note && <div className="muted small">{note}</div>}
    </div>
  )
}
