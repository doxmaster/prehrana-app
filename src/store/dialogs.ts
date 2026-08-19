import { create } from 'zustand'

/**
 * Imperativni dijalozi. Preglednički `confirm`/`prompt` blokirani su u Claude
 * sandboxu, a i inače prekidaju render, pa se sve rješava kroz stanje.
 */
interface DialogRequest {
  message: string
  okText: string
  withInput: boolean
  defaultValue: string
  resolve: (value: string | boolean | null) => void
}

/**
 * Obavijest moze nositi jednu radnju — u praksi "Poništi".
 *
 * Zato da se destruktivna radnja ne mora braniti potvrdom PRIJE (koja usporava
 * svaki klik), nego ponudom da se vrati POSLIJE. Potvrda ostaje samo ondje gdje
 * povratka nema ili je skup.
 */
export interface ToastAction {
  label: string
  run: () => void
}

interface DialogState {
  request: DialogRequest | null
  toastMessage: string | null
  toastAction: ToastAction | null
  open: (r: DialogRequest) => void
  close: (value: string | boolean | null) => void
  showToast: (message: string, action?: ToastAction) => void
  clearToast: () => void
}

export const useDialogs = create<DialogState>()((set, get) => ({
  request: null,
  toastMessage: null,
  toastAction: null,
  open: (request) => set({ request }),
  close: (value) => {
    const { request } = get()
    set({ request: null })
    request?.resolve(value)
  },
  showToast: (toastMessage, action) => set({ toastMessage, toastAction: action ?? null }),
  clearToast: () => set({ toastMessage: null, toastAction: null }),
}))

export function confirmDialog(message: string, okText = 'U redu'): Promise<boolean> {
  return new Promise((resolve) => {
    useDialogs.getState().open({
      message,
      okText,
      withInput: false,
      defaultValue: '',
      resolve: (v) => resolve(v === true),
    })
  })
}

export function promptDialog(message: string, defaultValue = ''): Promise<string | null> {
  return new Promise((resolve) => {
    useDialogs.getState().open({
      message,
      okText: 'Spremi',
      withInput: true,
      defaultValue,
      resolve: (v) => resolve(typeof v === 'string' ? v : null),
    })
  })
}

export function toast(message: string, action?: ToastAction): void {
  useDialogs.getState().showToast(message, action)
}
