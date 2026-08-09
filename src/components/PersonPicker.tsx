import { useId } from 'react'
import { useAppStore, usePeople } from '../store/useAppStore'

export function PersonPicker() {
  const people = usePeople()
  const activeId = useAppStore((s) => s.data.activeProfileId)
  const update = useAppStore((s) => s.update)
  const id = useId()

  return (
    <>
      <label htmlFor={id} style={{ margin: 0 }}>
        Osoba:
      </label>
      <select
        id={id}
        style={{ width: 'auto', minWidth: 150 }}
        value={activeId}
        onChange={(e) =>
          update((state) => {
            state.activeProfileId = e.target.value
          })
        }
      >
        {people.map((p) => (
          <option value={p.id} key={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </>
  )
}
