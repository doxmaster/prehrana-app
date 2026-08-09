import { create } from 'zustand'
import type { MealItem } from '../domain/types'

/** Međuspremnik radi i između kartica (dnevnik ↔ jelovnik), kao u staroj verziji. */
interface ClipboardState {
  meal: MealItem[] | null
  item: MealItem | null
  copyMeal: (items: MealItem[]) => void
  copyItem: (item: MealItem) => void
}

export const useClipboard = create<ClipboardState>()((set) => ({
  meal: null,
  item: null,
  copyMeal: (items) => set({ meal: structuredClone(items) }),
  copyItem: (item) => set({ item: structuredClone(item) }),
}))
