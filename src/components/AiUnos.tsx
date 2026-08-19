import { useState } from 'react'
import { AiParseError, buildEntryPrompt, parseAiResponse } from '../domain/aiEntry'
import { MEALS } from '../domain/constants'
import { itemName } from '../domain/nutrients'
import { toast } from '../store/dialogs'
import { useFoods } from '../store/useAppStore'
import type { DayMeals } from '../domain/types'

interface Props {
  onChange: (mutate: (meals: DayMeals) => void) => void
  onClose: () => void
}

/** Postoji samo kad je aplikacija otvorena unutar Claudea. */
interface CoworkBridge {
  askClaude?: (prompt: string, attachments: unknown[]) => Promise<unknown>
}

function coworkBridge(): CoworkBridge | null {
  const w = window as unknown as { cowork?: CoworkBridge }
  return w.cowork?.askClaude ? w.cowork : null
}

function textOf(response: unknown): string {
  if (typeof response === 'string') return response
  const r = response as { text?: string; content?: Array<{ text?: string }> }
  if (typeof r?.text === 'string') return r.text
  if (Array.isArray(r?.content) && typeof r.content[0]?.text === 'string') return r.content[0].text
  return JSON.stringify(response)
}

/**
 * Unos obroka prirodnim jezikom.
 *
 * Unutar Claudea ide u jednom kliku. Drugdje se upit kopira, zalijepi u bilo koji
 * jezicni model i odgovor vrati natrag — bez API kljuca u pregledniku i bez
 * troska, uz cijenu jednog kopiraj/zalijepi.
 *
 * Otvara se kao dijalog, a ne kao stalna kartica: izvan Claudea trazi
 * kopiraj/zalijepi, pa je to povremen put, a ne glavni. Kao kartica je zauzimao
 * vise prostora nego sam unos obroka.
 */
export function AiUnos({ onChange, onClose }: Props) {
  const foods = useFoods()
  const [text, setText] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPaste, setShowPaste] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const bridge = coworkBridge()

  const prompt = () =>
    buildEntryPrompt(
      text.trim(),
      foods.ingredients().map((f) => f.name),
    )

  const applyAnswer = (raw: string) => {
    try {
      const parsed = parseAiResponse(raw, foods)
      onChange((meals) => {
        parsed.items.forEach((item, i) => {
          meals[parsed.mealIndex[i] ?? 3]?.push(item)
        })
      })
      const names = parsed.items.map((i) => itemName(i, foods)).slice(0, 4).join(', ')
      toast(
        `Dodano ${parsed.items.length} stavki (${parsed.matched} iz baze): ${names}` +
          (parsed.items.length > 4 ? '…' : ''),
      )
      for (const warning of parsed.warnings) toast(`⚠ ${warning}`)
      setText('')
      setAnswer('')
      setShowPaste(false)
    } catch (err) {
      toast(err instanceof AiParseError ? err.message : 'Odgovor nije bilo moguće pročitati.')
    }
  }

  const askInClaude = async () => {
    const cowork = coworkBridge()
    if (!cowork?.askClaude) return
    setBusy(true)
    try {
      applyAnswer(textOf(await cowork.askClaude(prompt(), [])))
    } catch (err) {
      toast(`Greška: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  const copyPrompt = async () => {
    if (!text.trim()) return toast('Prvo upiši što si jeo.')
    setShowPaste(true)
    try {
      await navigator.clipboard.writeText(prompt())
      setCopyFailed(false)
      toast('Upit kopiran. Zalijepi ga u Claude i vrati odgovor ovdje.')
    } catch {
      // Bez pristupa meduspremniku upit se mora vidjeti da bi se mogao oznaciti.
      setCopyFailed(true)
      toast('Kopiranje nije uspjelo — označi upit ispod i kopiraj ručno.')
    }
  }

  return (
    <div className="modal-ov" role="dialog" aria-modal="true" aria-label="Upiši što si jeo">
      <div className="modal-box wide" style={{ maxHeight: '88vh', overflowY: 'auto' }}>
      <h2 style={{ marginTop: 0 }}>🤖 Upiši što si jeo</h2>
      <p className="muted small" style={{ margin: '-6px 0 10px' }}>
        Napiši običnim jezikom, npr. <i>„za ručak sarma i dvije kriške kruha, uz čašu vina”</i>.
        Poznate namirnice se povezuju s provjerenom bazom, a ostalo se procjenjuje.
      </p>

      <textarea
        value={text}
        placeholder="npr. dva jaja, kriška kruha s maslacem i velika kava s mlijekom"
        aria-label="Što si jeo"
        onChange={(e) => setText(e.target.value)}
      />

      <div className="row" style={{ marginTop: 10 }}>
        {bridge ? (
          <button className="btn" disabled={busy || !text.trim()} onClick={() => void askInClaude()}>
            {busy ? 'Računam…' : '✨ Izračunaj i dodaj'}
          </button>
        ) : (
          <button className="btn" disabled={!text.trim()} onClick={() => void copyPrompt()}>
            📋 Kopiraj upit za AI
          </button>
        )}
        {!bridge && showPaste && (
          <button className="btn secondary small" onClick={() => setShowPaste(false)}>
            Odustani
          </button>
        )}
      </div>

      {!bridge && showPaste && copyFailed && (
        <div style={{ marginTop: 12 }}>
          <label htmlFor="ai-upit">Upit — označi sve i kopiraj</label>
          <textarea
            id="ai-upit"
            readOnly
            value={prompt()}
            style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 11 }}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}

      {!bridge && showPaste && (
        <div style={{ marginTop: 12 }}>
          <label htmlFor="ai-odgovor">Zalijepi odgovor modela</label>
          <textarea
            id="ai-odgovor"
            value={answer}
            placeholder='{"items":[…]}'
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn" disabled={!answer.trim()} onClick={() => applyAnswer(answer)}>
              ➕ Dodaj u obroke
            </button>
            <span className="small muted">
              Ide u {MEALS.join(' / ')} prema tome što model prepozna.
            </span>
          </div>
        </div>
      )}

      {!bridge && !showPaste && (
        <p className="hint">
          Unutar Claude aplikacije ovo radi u jednom kliku. Ovdje se upit kopira i zalijepi — bez API
          ključa u pregledniku i bez troška.
        </p>
      )}

        <div className="modal-actions" style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={onClose}>
            Zatvori
          </button>
        </div>
      </div>
    </div>
  )
}
