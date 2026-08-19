import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../src/domain/constants'
import { readSafetyBackup, writeSafetyBackup } from '../src/store/storage'
import { useAppStore } from '../src/store/useAppStore'
import { emptyState } from '../src/domain/migrate'

/**
 * Zastita od slucajnog gubitka podataka.
 *
 * Ovi testovi cuvaju mehanizam, ne pojedini gumb: dok god svaka izmjena ide
 * kroz store, poništavanje vrijedi i za radnje koje jos ne postoje.
 */
describe('poništavanje zadnje promjene', () => {
  beforeEach(() => {
    localStorage.clear()
    const svjeze = emptyState()
    svjeze.menus = [{ id: 'mn1', title: 'Prvi', meals: [[], [], [], []] }]
    useAppStore.getState().replaceAll(svjeze, 'priprema testa')
  })

  it('vraća stanje kakvo je bilo prije izmjene', () => {
    const { update, undo } = useAppStore.getState()

    update((draft) => {
      draft.menus.push({ id: 'mn2', title: 'Drugi', meals: [[], [], [], []] })
    }, 'dodavanje jelovnika')
    expect(useAppStore.getState().data.menus).toHaveLength(2)

    expect(undo()).toBe(true)
    expect(useAppStore.getState().data.menus).toHaveLength(1)
  })

  it('vraća i ono što je obrisano', () => {
    const { update, undo } = useAppStore.getState()

    update((draft) => {
      draft.menus = []
    }, 'brisanje svih jelovnika')
    expect(useAppStore.getState().data.menus).toHaveLength(0)

    undo()
    expect(useAppStore.getState().data.menus).toHaveLength(1)
    expect(useAppStore.getState().data.menus[0]!.title).toBe('Prvi')
  })

  it('poništavanje se upiše i u pohranu, ne samo u prikaz', () => {
    const { update, undo } = useAppStore.getState()
    update((draft) => void (draft.menus = []), 'brisanje')
    undo()

    const spremljeno = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(spremljeno.menus).toHaveLength(1)
  })

  it('drži samo zadnju promjenu — dvostruko poništavanje ne ide dublje', () => {
    const { update } = useAppStore.getState()
    update((draft) => void draft.menus.push({ id: 'a', meals: [[], [], [], []] }), 'prva')
    update((draft) => void draft.menus.push({ id: 'b', meals: [[], [], [], []] }), 'druga')

    expect(useAppStore.getState().undo()).toBe(true)
    expect(useAppStore.getState().data.menus).toHaveLength(2)
    // Nema drugog koraka: obecava se jedan povratak, ne povijest.
    expect(useAppStore.getState().undo()).toBe(false)
    expect(useAppStore.getState().data.menus).toHaveLength(2)
  })

  it('bez ijedne promjene nema što poništiti', () => {
    // replaceAll iz pripreme je postavio previous, pa se prvo potrosi.
    useAppStore.getState().undo()
    expect(useAppStore.getState().undo()).toBe(false)
  })
})

describe('sigurnosna kopija prije velikih zahvata', () => {
  beforeEach(() => localStorage.clear())

  it('replaceAll ostavlja kopiju stanja PRIJE zahvata', () => {
    const prije = emptyState()
    prije.menus = [{ id: 'stari', title: 'Stari', meals: [[], [], [], []] }]
    useAppStore.getState().replaceAll(prije, 'priprema')

    const poslije = emptyState()
    poslije.menus = []
    useAppStore.getState().replaceAll(poslije, 'uvoz sigurnosne kopije')

    const backup = readSafetyBackup()
    expect(backup?.reason).toBe('uvoz sigurnosne kopije')
    expect(backup?.state.menus).toHaveLength(1)
    expect(backup?.state.menus[0]!.title).toBe('Stari')
  })

  it('kopija preživi ponovno čitanje i prođe kroz migraciju', () => {
    const state = emptyState()
    state.menus = [{ id: 'x', title: 'Test', meals: [[], [], [], []] }]
    writeSafetyBackup(state, 'test')

    const read = readSafetyBackup()
    expect(read?.state.version).toBe(4)
    expect(read?.state.menus[0]!.title).toBe('Test')
    expect(read?.at).toBeGreaterThan(0)
  })

  it('bez kopije vraća null umjesto da padne', () => {
    expect(readSafetyBackup()).toBeNull()
  })

  it('pokvarena kopija ne ruši aplikaciju', () => {
    localStorage.setItem(`${STORAGE_KEY}_prije_zahvata`, '{ ovo nije json')
    expect(readSafetyBackup()).toBeNull()
  })
})
