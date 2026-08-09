let seq = 0

/**
 * Identifikator jedinstven i unutar iste milisekunde (brojač) i između uređaja
 * (vremenska oznaka + slučajni dio).
 */
export function uid(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}-${(seq++).toString(36)}${Math.floor(
    Math.random() * 1e6,
  ).toString(36)}`
}
