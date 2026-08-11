import { catColor } from '../domain/constants'
import type { Category } from '../domain/types'

/**
 * Nacrtani znak kategorije.
 *
 * Crta se, ne ucitava: fotografije 250 namirnica nemamo odakle uzeti, a
 * vektorski znak je par stotina bajta, ostar na svakom zaslonu i sam se boji
 * bojom kategorije — pa popis ostaje prepoznatljiv i kad se cita na brzinu.
 */
const PATHS: Record<Category, string> = {
  // But s kosti
  'Meso i riba':
    'M7 14c-2.2 0-4-1.8-4-4s1.8-4 4-4c.6 0 1.2.1 1.7.4l6.6-3.1c1.7-.8 3.7 0 4.5 1.7.8 1.7 0 3.7-1.7 4.5l-6.6 3.1c0 .1.1.3.1.4 0 .6-.2 1-.4 1.5',
  // Casa mlijeka
  'Mliječno i jaja': 'M7 3h10l-1.2 16.2c-.1 1-.9 1.8-2 1.8h-3.6c-1.1 0-1.9-.8-2-1.8L7 3Zm.6 5h8.8',
  // Klas
  'Žitarice i kruh':
    'M12 21V9m0 0c0-2 1.4-4 3.5-5C16 6 15 8.6 12 9Zm0 0C12 7 10.6 5 8.5 4 8 6 9 8.6 12 9Zm0 5c0-2 1.4-4 3.5-5 .5 2-.5 4.6-3.5 5Zm0 0c0-2-1.4-4-3.5-5-.5 2 .5 4.6 3.5 5Z',
  // Mahuna sa zrnima
  Mahunarke: 'M5 15c0-5 4-9 9-9 3 0 5 2 5 4 0 5-4 9-9 9-3 0-5-2-5-4Zm3.5-.5 6-6m-3.5 8 6-6',
  // Brokula
  'Povrće': 'M12 21v-7m0 0c-3 0-5-1.8-5-4 0-1 .4-1.9 1-2.6C8 5.5 9.8 4 12 4s4 1.5 4 3.4c.6.7 1 1.6 1 2.6 0 2.2-2 4-5 4Z',
  // Jabuka s listom
  'Voće': 'M12 8c-1-1.6-3-2.4-4.6-1.4C5.4 7.8 5 10.6 6.2 13.4 7.4 16.2 9.6 20 12 20s4.6-3.8 5.8-6.6C19 10.6 18.6 7.8 16.6 6.6 15 5.6 13 6.4 12 8Zm0 0V4m0 0c1.6 0 3-1 3-2-1.6 0-3 1-3 2Z',
  // Zrno u ljusci
  'Orašasti i masti': 'M12 3c4 2 6 5.5 6 9 0 4-2.7 7-6 7s-6-3-6-7c0-3.5 2-7 6-9Zm0 3v10',
  // Casa s cjevcicom
  'Pića': 'M6 5h12l-1.5 13.5c-.1 1-1 1.5-2 1.5h-5c-1 0-1.9-.5-2-1.5L6 5Zm6 4v8m3-13-3 3',
  // Tableta
  Suplementi: 'M9.5 4.5h5A4.5 4.5 0 0 1 19 9v6a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 5 15V9a4.5 4.5 0 0 1 4.5-4.5Zm-4 7.5h13',
  // Tanjur s priborom
  Ostalo: 'M12 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
}

interface Props {
  cat: Category
  size?: number
  /** Naziv za citace ekrana; bez njega je znak cista dekoracija. */
  title?: string
}

export function CatIcon({ cat, size = 18, title }: Props) {
  const color = catColor(cat)
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      className="cat-icon"
      style={{ flex: 'none' }}
    >
      {title && <title>{title}</title>}
      <path d={PATHS[cat] ?? PATHS.Ostalo} />
    </svg>
  )
}
