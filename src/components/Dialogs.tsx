import { useEffect, useRef } from 'react'
import { useDialogs } from '../store/dialogs'

export function Dialogs() {
  const request = useDialogs((s) => s.request)
  const close = useDialogs((s) => s.close)
  const toastMessage = useDialogs((s) => s.toastMessage)
  const clearToast = useDialogs((s) => s.clearToast)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (request?.withInput) inputRef.current?.select()
  }, [request])

  useEffect(() => {
    if (!toastMessage) return
    const id = setTimeout(clearToast, 3600)
    return () => clearTimeout(id)
  }, [toastMessage, clearToast])

  return (
    <>
      {request && (
        <div
          className="modal-ov"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === 'Escape') close(false)
          }}
        >
          <div className="modal-box">
            <p className="m-msg">{request.message}</p>
            {request.withInput && (
              <input
                ref={inputRef}
                autoFocus
                defaultValue={request.defaultValue}
                aria-label={request.message}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') close(e.currentTarget.value)
                }}
              />
            )}
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => close(false)}>
                Odustani
              </button>
              <button
                className="btn"
                autoFocus={!request.withInput}
                onClick={(e) => {
                  const input = e.currentTarget
                    .closest('.modal-box')
                    ?.querySelector('input')
                  close(request.withInput ? (input?.value ?? '') : true)
                }}
              >
                {request.okText}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div id="toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </>
  )
}
