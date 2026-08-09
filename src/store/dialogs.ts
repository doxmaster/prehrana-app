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

interface DialogState {
  request: DialogRequest | null
  toastMessage: string | null
  open: (r: DialogRequest) => void
  close: (value: string | boolean | null) => void
  showToast: (message: string) => void
  clearToast: () => void
}

export const useDialogs = create<DialogState>()((set, get) => ({
  request: null,
  toastMessage: null,
  open: (request) => set({ request }),
  close: (value) => {
    const { request } = get()
    set({ request: null })
    request?.resolve(value)
  },
  showToast: (toastMessage) => set({ toastMessage }),
  clearToast: () => set({ toastMessage: null }),
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

export function toast(message: string): void {
  useDialogs.getState().showToast(message)
}
