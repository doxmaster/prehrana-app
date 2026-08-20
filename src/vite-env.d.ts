/// <reference types="vite/client" />

/**
 * Ključevi Google prijave mogu doći iz builda, a mogu se i upisati u Postavkama;
 * upisani nadjačava. Oba su javna po naravi — čuvaju pristup, ne podatke.
 */
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GOOGLE_API_KEY?: string
  /** Adrese kojima je dopusteno uskladivanje, odvojene zarezom. Prazno = svi. */
  readonly VITE_GOOGLE_DOZVOLJENI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
