import { useMemo } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useTableStore } from '@/store/tableStore'
import type { Task } from '@/types/task'

export function useFilteredTasks() {
  const query = useTasks()
  const {
    sortColumn,
    sortDirection,
    filterAssignee,
    filterStatus,
    filterPriority,
  } = useTableStore()

  const filtered = useMemo<Task[]>(() => {
    let list = query.data ?? []

    if (filterAssignee) {
      list = list.filter((t) => t.assignee === filterAssignee)
    }
    if (filterStatus) {
      list = list.filter((t) => t.status === filterStatus)
    }
    if (filterPriority) {
      list = list.filter((t) => t.priority === filterPriority)
    }

    return [...list].sort((a, b) => {
      const aVal = a[sortColumn] ?? ''
      const bVal = b[sortColumn] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [query.data, sortColumn, sortDirection, filterAssignee, filterStatus, filterPriority])

  return { ...query, data: filtered }
}
