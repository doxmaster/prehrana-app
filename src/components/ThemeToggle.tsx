import { useEffect, useState } from 'react'

const KEY = 'prehrana_theme'
type Theme = 'light' | 'dark' | 'system'

function read(): Theme {
  const raw = localStorage.getItem(KEY)
  return raw === 'light' || raw === 'dark' ? raw : 'system'
}

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

/**
 * Prebacivanje svjetle i tamne teme.
 *
 * Zadano se prati postavka sustava; klik je nadjacava i pamti. Treci polozaj
 * ("po sustavu") namjerno postoji jer bi inace, jednom kliknuta, aplikacija
 * zauvijek ignorirala vecernji prelazak sustava u tamno.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => (typeof localStorage === 'undefined' ? 'system' : read()))

  useEffect(() => {
    apply(theme)
    if (theme === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, theme)
  }, [theme])

  const next: Record<Theme, Theme> = { system: 'dark', dark: 'light', light: 'system' }
  const label: Record<Theme, string> = {
    system: 'Tema prati sustav',
    dark: 'Tamna tema',
    light: 'Svijetla tema',
  }
  const icon: Record<Theme, string> = { system: '🌗', dark: '🌙', light: '☀️' }

  return (
    <button
      className="theme-toggle"
      title={`${label[theme]} — klik za ${label[next[theme]].toLowerCase()}`}
      aria-label={label[theme]}
      onClick={() => setTheme(next[theme])}
    >
      {icon[theme]}
    </button>
  )
}
