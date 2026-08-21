import { describe, expect, it } from 'vitest'
import { spoji } from '../src/domain/sync'
import { emptyState } from '../src/domain/migrate'
import type { AppState, Menu, Person } from '../src/domain/types'

/**
 * Spajanje pri usklađivanju.
 *
 * Ovi testovi čuvaju ono što se pri sinkronizaciji najčešće pokvari: brisanje
 * koje se vrati, tuđi unos koji nestane bez traga, i dvoje koji istodobno
 * upisuju različite dane pa jedan drugome gaze dnevnik.
 */

function osoba(id: string, ime: string): Person {
  return {
    id,
    name: ime,
    profile: {},
    log: {},
    measurements: [],
  } as unknown as Person
}

function jelovnik(id: string, naslov: string): Menu {
  return { id, title: naslov, meals: [[], [], [], []] } as Menu
}

function stanje(izmjena: (s: AppState) => void = () => {}): AppState {
  const s = emptyState()
  s.profiles = [osoba('p1', 'Darijo')]
  s.activeProfileId = 'p1'
  izmjena(s)
  return s
}

const klon = (s: AppState) => structuredClone(s)

describe('spajanje dnevnika', () => {
  it('dvoje koji upisuju različite dane ne gaze jedan drugoga', () => {
    const osnova = stanje()
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)

    ovdje.profiles[0]!.log['2026-08-19'] = [[{ foodId: 'f1', g: 100 }], [], [], []]
    drugdje.profiles[0]!.log['2026-08-20'] = [[{ foodId: 'f2', g: 200 }], [], [], []]

    const rez = spoji(osnova, ovdje, drugdje)
    const log = rez.state.profiles[0]!.log
    expect(Object.keys(log).sort()).toEqual(['2026-08-19', '2026-08-20'])
    expect(rez.sukobi).toEqual([])
  })

  it('isti dan promijenjen na oba uređaja javlja se kao sukob, ne guta se tiho', () => {
    const osnova = stanje((s) => {
      s.profiles[0]!.log['2026-08-19'] = [[], [], [], []]
    })
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)

    ovdje.profiles[0]!.log['2026-08-19'] = [[{ foodId: 'kruh', g: 50 }], [], [], []]
    drugdje.profiles[0]!.log['2026-08-19'] = [[{ foodId: 'jaje', g: 60 }], [], [], []]

    const rez = spoji(osnova, ovdje, drugdje)
    expect(rez.sukobi).toHaveLength(1)
    expect(rez.sukobi[0]).toContain('dnevnik Darijo 2026-08-19')
    // Zadržava se ovaj uređaj — ali korisnik za to zna.
    expect(rez.state.profiles[0]!.log['2026-08-19']![0]).toEqual([{ foodId: 'kruh', g: 50 }])
  })

  it('dan upisan samo drugdje stiže k nama', () => {
    const osnova = stanje()
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    drugdje.profiles[0]!.log['2026-08-21'] = [[{ foodId: 'f9', g: 10 }], [], [], []]

    const rez = spoji(osnova, ovdje, drugdje)
    expect(rez.state.profiles[0]!.log['2026-08-21']).toBeDefined()
    expect(rez.drugdje).toBe(1)
  })
})

describe('brisanje se ne vraća', () => {
  it('jelovnik obrisan drugdje ostaje obrisan i kod nas', () => {
    const osnova = stanje((s) => {
      s.menus = [jelovnik('m1', 'Grah'), jelovnik('m2', 'Sarma')]
    })
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    drugdje.menus = drugdje.menus.filter((m) => m.id !== 'm2')

    const rez = spoji(osnova, ovdje, drugdje)
    expect(rez.state.menus.map((m) => m.id)).toEqual(['m1'])
  })

  it('jelovnik obrisan kod nas ne vraća se s drugog uređaja', () => {
    const osnova = stanje((s) => {
      s.menus = [jelovnik('m1', 'Grah'), jelovnik('m2', 'Sarma')]
    })
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    ovdje.menus = ovdje.menus.filter((m) => m.id !== 'm2')

    const rez = spoji(osnova, ovdje, drugdje)
    expect(rez.state.menus.map((m) => m.id)).toEqual(['m1'])
  })

  it('ali obrisan kod nas a IZMIJENJEN drugdje se zadrži — izmjena je namjera', () => {
    const osnova = stanje((s) => {
      s.menus = [jelovnik('m1', 'Grah')]
    })
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    ovdje.menus = []
    drugdje.menus = [jelovnik('m1', 'Grah s kobasicom')]

    const rez = spoji(osnova, ovdje, drugdje)
    expect(rez.state.menus).toHaveLength(1)
    expect(rez.state.menus[0]!.title).toBe('Grah s kobasicom')
    expect(rez.sukobi).toHaveLength(1)
  })

  it('osoba obrisana drugdje ostaje obrisana', () => {
    const osnova = stanje((s) => {
      s.profiles = [osoba('p1', 'Darijo'), osoba('p2', 'Gost')]
    })
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    drugdje.profiles = drugdje.profiles.filter((p) => p.id !== 'p2')

    const rez = spoji(osnova, ovdje, drugdje)
    expect(rez.state.profiles.map((p) => p.id)).toEqual(['p1'])
  })

  it('osoba s unosom obrisana drugdje NE nestaje ako smo joj mi nešto upisali', () => {
    const osnova = stanje((s) => {
      s.profiles = [osoba('p1', 'Darijo'), osoba('p2', 'Ana')]
    })
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    ovdje.profiles[1]!.log['2026-08-19'] = [[{ foodId: 'f1', g: 100 }], [], [], []]
    drugdje.profiles = drugdje.profiles.filter((p) => p.id !== 'p2')

    const rez = spoji(osnova, ovdje, drugdje)
    expect(rez.state.profiles.map((p) => p.id)).toEqual(['p1', 'p2'])
  })
})

describe('nove stvari s obje strane', () => {
  it('jela dodana na oba uređaja spajaju se, ne prepisuju', () => {
    const osnova = stanje()
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    ovdje.menus = [jelovnik('a', 'Moj')]
    drugdje.menus = [jelovnik('b', 'Njezin')]

    const rez = spoji(osnova, ovdje, drugdje)
    expect(rez.state.menus.map((m) => m.id).sort()).toEqual(['a', 'b'])
    expect(rez.sukobi).toEqual([])
  })

  it('nova osoba s drugog uređaja dolazi sa svojim dnevnikom', () => {
    const osnova = stanje()
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    const ana = osoba('p2', 'Ana')
    ana.log['2026-08-19'] = [[{ foodId: 'f1', g: 42 }], [], [], []]
    drugdje.profiles.push(ana)

    const rez = spoji(osnova, ovdje, drugdje)
    const nadena = rez.state.profiles.find((p) => p.id === 'p2')
    expect(nadena?.name).toBe('Ana')
    expect(nadena?.log['2026-08-19']?.[0]).toEqual([{ foodId: 'f1', g: 42 }])
  })
})

describe('postavke uređaja se ne dijele', () => {
  it('odabrana osoba ostaje kakva je na ovom uređaju', () => {
    const osnova = stanje((s) => {
      s.profiles = [osoba('p1', 'Darijo'), osoba('p2', 'Ana')]
    })
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    ovdje.activeProfileId = 'p1'
    drugdje.activeProfileId = 'p2'

    expect(spoji(osnova, ovdje, drugdje).state.activeProfileId).toBe('p1')
  })
})

describe('prvo spajanje bez osnove', () => {
  it('spaja ono što postoji samo na jednoj strani', () => {
    const ovdje = stanje((s) => {
      s.menus = [jelovnik('a', 'Moj')]
    })
    const drugdje = stanje((s) => {
      s.menus = [jelovnik('b', 'Njezin')]
    })

    const rez = spoji(null, ovdje, drugdje)
    expect(rez.state.menus.map((m) => m.id).sort()).toEqual(['a', 'b'])
  })

  it('bez osnove se razlika istog jelovnika broji kao sukob', () => {
    const ovdje = stanje((s) => {
      s.menus = [jelovnik('a', 'Moj')]
    })
    const drugdje = stanje((s) => {
      s.menus = [jelovnik('a', 'Drukčiji')]
    })

    const rez = spoji(null, ovdje, drugdje)
    expect(rez.sukobi).toHaveLength(1)
  })
})

describe('spajanje ne mijenja ono što mu je dano', () => {
  it('ulazna stanja ostaju netaknuta', () => {
    const osnova = stanje((s) => {
      s.menus = [jelovnik('m1', 'Grah')]
    })
    const ovdje = klon(osnova)
    const drugdje = klon(osnova)
    drugdje.menus = [jelovnik('m1', 'Grah'), jelovnik('m2', 'Novi')]

    const prijeOvdje = JSON.stringify(ovdje)
    const prijeDrugdje = JSON.stringify(drugdje)
    spoji(osnova, ovdje, drugdje)

    expect(JSON.stringify(ovdje)).toBe(prijeOvdje)
    expect(JSON.stringify(drugdje)).toBe(prijeDrugdje)
  })
})

/**
 * Usporedba po sadrzaju, ne po zapisu.
 *
 * Prvo uskladivanje prijavljivalo je cijeli ugradeni katalog kao sukob, jer je
 * stanje s Drivea proslo kroz zapis i migraciju pa mu se promijenio redoslijed
 * kljuceva. Podaci su bili isti; razlikovao se samo niz znakova.
 */
describe('redoslijed polja ne pravi lažne sukobe', () => {
  /** Isti jelovnik, ali s poljima upisanima drugim redom. */
  const sJelovnikom = (m: Record<string, unknown>) =>
    stanje((s) => {
      s.menus = [m as unknown as Menu]
    })

  it('isti jelovnik s drukčijim redoslijedom polja nije sukob', () => {
    const ovdje = sJelovnikom({ id: 'm1', title: 'Sarma', cuisine: 'hr', meals: [[], [], [], []] })
    const drugdje = sJelovnikom({
      meals: [[], [], [], []],
      cuisine: 'hr',
      title: 'Sarma',
      id: 'm1',
    })
    expect(spoji(null, ovdje, drugdje).sukobi).toHaveLength(0)
  })

  it('polje sa `undefined` jednako je polju kojeg nema', () => {
    const ovdje = sJelovnikom({
      id: 'm1',
      title: 'Sarma',
      season: undefined,
      meals: [[], [], [], []],
    })
    const drugdje = sJelovnikom({ id: 'm1', title: 'Sarma', meals: [[], [], [], []] })
    expect(spoji(null, ovdje, drugdje).sukobi).toHaveLength(0)
  })

  it('stvarna razlika i dalje jest sukob', () => {
    const ovdje = sJelovnikom({ id: 'm1', title: 'Sarma', meals: [[], [], [], []] })
    const drugdje = sJelovnikom({ id: 'm1', title: 'Musaka', meals: [[], [], [], []] })
    expect(spoji(null, ovdje, drugdje).sukobi.length).toBeGreaterThan(0)
  })

  it('redoslijed u nizu OSTAJE bitan — obroci nisu skup', () => {
    const ovdje = sJelovnikom({ id: 'm1', meals: [[{ foodId: 'f1', g: 100 }], [], [], []] })
    const drugdje = sJelovnikom({ id: 'm1', meals: [[], [{ foodId: 'f1', g: 100 }], [], []] })
    expect(spoji(null, ovdje, drugdje).sukobi.length).toBeGreaterThan(0)
  })
})
