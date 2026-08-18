import { describe, expect, it } from 'vitest'
import { matchFood, parseRecipe, stem } from '../src/domain/parseRecipe'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { emptyState } from '../src/domain/migrate'

import { STARTER_RECIPES } from '../src/data/recipes'

const state = emptyState()
state.recipes = structuredClone(STARTER_RECIPES)
const foods = buildFoodIndex(state)
/** Parseru se predaju SAMO namirnice — jelo ne smije postati sastojak jela. */
const all = foods.ingredients()

describe('skidanje nastavaka', () => {
  it('padeži istog pojma daju isti korijen', () => {
    expect(stem('mesa')).toBe(stem('meso'))
    expect(stem('mljevenog')).toBe(stem('mljeveno'))
    expect(stem('krumpira')).toBe(stem('krumpir'))
    expect(stem('jaja')).toBe(stem('jaje'))
    expect(stem('ulja')).toBe(stem('ulje'))
  })

  it('ne skraćuje ispod tri slova', () => {
    // "sir" bi inače postao "si" i poklapao se sa svime.
    expect(stem('sir')).toBe('sir')
    expect(stem('sol')).toBe('sol')
  })

  it('ne spaja različite pojmove', () => {
    expect(stem('sir')).not.toBe(stem('sirup'))
  })

  it('kvačice ne mijenjaju korijen', () => {
    expect(stem('šećer')).toBe(stem('secer'))
  })
})

describe('pogađanje namirnice', () => {
  it('nalazi namirnicu iz opisa u padežu', () => {
    expect(matchFood('400 g mljevenog mesa', all)?.name).toBe('Mljeveno meso (miješano)')
    expect(matchFood('500 g krumpira', all)?.name).toContain('Krumpir')
    expect(matchFood('2 jaja', all)?.name).toContain('Jaje')
  })

  it('kod izjednačenja bira određeniji, kraći naziv', () => {
    // "riže" pogađa i bijelu i smeđu; bijela je kraći naziv.
    expect(matchFood('200 g riže', all)?.name).toBe('Riža bijela (kuhana)')
  })

  it('bliži naziv pobjeđuje općenitiji', () => {
    expect(matchFood('100 g integralnog kruha', all)?.name).toBe('Kruh integralni')
  })

  it('ne izmišlja pogodak za nepoznat sastojak', () => {
    expect(matchFood('1 vezica vlasca za ukras', all)).toBeUndefined()
  })

  it('jelo iz kataloga nikad ne postane sastojak', () => {
    // Naslov "Punjene paprike moje bake" pogadao je postojece jelo "Punjena
    // paprika", pa je jelo sadrzavalo samo sebe; "150 g rize" zavrsavalo je na
    // "Leca s rizom". Zato parser vidi samo namirnice.
    expect(all.some((f) => f.id.startsWith('r:'))).toBe(false)
    expect(matchFood('Punjene paprike moje bake', all)?.name).not.toBe('Punjena paprika')
    expect(matchFood('150 g riže', all)?.name).toBe('Riža bijela (kuhana)')
  })
})

describe('razlaganje zalijepljenog recepta', () => {
  it('čita količine u gramima i kilogramima', () => {
    const r = parseRecipe('500 g krumpira\n1 kg kupusa', all)
    expect(r.items.map((i) => i.g)).toEqual([500, 1000])
  })

  it('prevodi kuhinjske mjere u grame', () => {
    const r = parseRecipe('2 žlice maslinovog ulja\n3 dl mlijeka', all)
    expect(r.items[0]!.g).toBe(30)
    expect(r.items[1]!.g).toBe(300)
  })

  it('komad se množi uobičajenom porcijom te namirnice', () => {
    const jaje = all.find((f) => f.name === 'Jaje (cijelo)')!
    const r = parseRecipe('3 jaja', all)
    expect(r.items[0]!.g).toBe(3 * jaje.serv)
  })

  it('broj napisan riječju se razumije', () => {
    const r = parseRecipe('dva jaja', all)
    expect(r.items).toHaveLength(1)
    expect(r.items[0]!.g).toBeGreaterThan(0)
  })

  it('sastojak bez količine dobiva uobičajenu porciju i to se označi', () => {
    const r = parseRecipe('krumpir', all)
    expect(r.items[0]!.assumedAmount).toBe(true)
    expect(r.items[0]!.g).toBeGreaterThan(0)
  })

  it('nepoznat redak se vraća, ne preskače tiho', () => {
    const r = parseRecipe('500 g krumpira\n1 vezica vlasca za ukras', all)
    expect(r.items).toHaveLength(1)
    expect(r.unknown).toEqual(['1 vezica vlasca za ukras'])
  })

  it('prvi redak bez sastojka postaje naziv jela', () => {
    const r = parseRecipe('Bakina sarma\n800 g kupusa\n400 g mljevenog mesa', all)
    expect(r.name).toBe('Bakina sarma')
    expect(r.items).toHaveLength(2)
  })

  it('broj porcija se čita iz teksta', () => {
    const r = parseRecipe('Za 6 osoba\n500 g krumpira', all)
    expect(r.servings).toBe(6)
    expect(r.items).toHaveLength(1)
  })

  it('nabrajanje s crticama i brojevima se čisti', () => {
    const r = parseRecipe('- 500 g krumpira\n1. 200 g mrkve\n• 2 jaja', all)
    expect(r.items).toHaveLength(3)
    expect(r.items[0]!.g).toBe(500)
    expect(r.items[1]!.g).toBe(200)
  })

  it('decimalni zarez se razumije kao decimalna točka', () => {
    const r = parseRecipe('0,5 kg krumpira', all)
    expect(r.items[0]!.g).toBe(500)
  })

  it('prazan tekst ne ruši i ne izmišlja', () => {
    const r = parseRecipe('', all)
    expect(r.items).toEqual([])
    expect(r.unknown).toEqual([])
    expect(r.name).toBe('')
  })

  it('stvarni popis s videa prolazi u cjelini', () => {
    const tekst = [
      'Sarma',
      'Za 6 osoba',
      '- 800 g kupusa',
      '- 400 g mljevenog mesa',
      '- 200 g riže',
      '- 1 luk',
      '- 2 žlice ulja',
    ].join('\n')

    const r = parseRecipe(tekst, all)
    expect(r.name).toBe('Sarma')
    expect(r.servings).toBe(6)
    expect(r.items).toHaveLength(5)
    expect(r.unknown).toEqual([])
    expect(r.items.map((i) => i.g).slice(0, 3)).toEqual([800, 400, 200])
  })
})

describe('naslov koji sadrži namirnicu', () => {
  it('"Punjene paprike moje bake" je naslov, ne sastojak', () => {
    // Sam pogodak nije dovoljan: naslov cesto sadrzi ime namirnice, pa bi jelo
    // dobilo sastojak kojeg u receptu nema.
    const r = parseRecipe('Punjene paprike moje bake\n8 paprika\n500 g mljevenog mesa', all)
    expect(r.name).toBe('Punjene paprike moje bake')
    expect(r.items).toHaveLength(2)
    expect(r.items.every((i) => !i.assumedAmount)).toBe(true)
  })

  it('sastojak koji sam za sebe ispuni redak ostaje sastojak', () => {
    const r = parseRecipe('krumpir\n2 jaja', all)
    expect(r.name).toBe('')
    expect(r.items).toHaveLength(2)
  })

  it('sastojak bez količine usred popisa se ne pretvara u naslov', () => {
    const r = parseRecipe('500 g krumpira\nperšin po želji', all)
    expect(r.items).toHaveLength(2)
    expect(r.items[1]!.foodName).toBe('Peršin')
  })
})
