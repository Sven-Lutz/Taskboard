import { create } from 'zustand'
import type { TaskStatus, TaskPriority, Task } from '@/types/task'

interface TableState {
  sortColumn: keyof Task
  sortDirection: 'asc' | 'desc'
  filterAssignee: string | null
  filterStatus: TaskStatus | null
  filterPriority: TaskPriority | null
}

interface TableActions {
  setSortColumn: (column: keyof Task) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setFilterAssignee: (assignee: string | null) => void
  setFilterStatus: (status: TaskStatus | null) => void
  setFilterPriority: (priority: TaskPriority | null) => void
  resetFilters: () => void
}

const initialState: TableState = {
  sortColumn: 'createdAt',
  sortDirection: 'desc',
  filterAssignee: null,
  filterStatus: null,
  filterPriority: null,
}

export const useTableStore = create<TableState & TableActions>((set) => ({
  ...initialState,
  setSortColumn: (column) => set({ sortColumn: column }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  resetFilters: () =>
    set({
      filterAssignee: null,
      filterStatus: null,
      filterPriority: null,
    }),
}))
