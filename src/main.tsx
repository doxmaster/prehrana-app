import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/app.css'
import './styles/modern.css'
import './styles/header.css'
import './styles/motion.css'
import './styles/layout.css'

const root = document.getElementById('root')
if (!root) throw new Error('Nedostaje #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/*
 * Service worker drzi aplikaciju dostupnom bez mreze i omogucuje instalaciju na
 * pocetni zaslon. Samo u produkciji: u razvoju bi spremiste posluzivalo stari
 * kod umjesto onoga koji se upravo mijenja.
 *
 * U okviru (Claude artefakt) se preskace — ondje registracija ionako ne prolazi,
 * a aplikacija je tamo vec cijela u jednoj datoteci.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.top === window.self) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((err) => console.warn('Offline rad nije dostupan:', err))
  })
}
