import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useTableStore } from '@/store/tableStore'
import { TEAM_MEMBERS } from '@/lib/constants'
import type { TaskStatus, TaskPriority } from '@/types/task'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function TaskTableFilters() {
  const {
    filterAssignee,
    filterStatus,
    filterPriority,
    setFilterAssignee,
    setFilterStatus,
    setFilterPriority,
    resetFilters,
  } = useTableStore()

  const hasFilters = filterAssignee || filterStatus || filterPriority

  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Assignee filter */}
      <Select
        value={filterAssignee ?? '__all__'}
        onValueChange={(v: string) => setFilterAssignee(v === '__all__' ? null : v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All assignees</SelectItem>
          {TEAM_MEMBERS.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filterStatus ?? '__all__'}
        onValueChange={(v: string) => setFilterStatus(v === '__all__' ? null : (v as TaskStatus))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All statuses</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority filter */}
      <Select
        value={filterPriority ?? '__all__'}
        onValueChange={(v: string) => setFilterPriority(v === '__all__' ? null : (v as TaskPriority))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All priorities</SelectItem>
          {PRIORITY_OPTIONS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reset filters
        </Button>
      )}
    </div>
  )
}
