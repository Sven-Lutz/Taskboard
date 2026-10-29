import { create } from 'zustand'
import type { Task } from '@/types/task'

interface UIState {
  taskDialogOpen: boolean
  editingTask: Task | null
}

interface UIActions {
  openCreateDialog: () => void
  openEditDialog: (task: Task) => void
  closeDialog: () => void
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  taskDialogOpen: false,
  editingTask: null,
  openCreateDialog: () => set({ taskDialogOpen: true, editingTask: null }),
  openEditDialog: (task) => set({ taskDialogOpen: true, editingTask: task }),
  closeDialog: () => set({ taskDialogOpen: false, editingTask: null }),
}))
