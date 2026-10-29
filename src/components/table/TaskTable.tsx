import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import PriorityBadge from '@/components/tasks/PriorityBadge'
import TaskDialog from '@/components/tasks/TaskDialog'
import { useFilteredTasks } from '@/hooks/useFilteredTasks'
import { useTableStore } from '@/store/tableStore'
import type { Task } from '@/types/task'

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

type SortableColumn = 'title' | 'assignee' | 'status' | 'priority' | 'dueDate'

const COLUMNS: { key: SortableColumn; label: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'dueDate', label: 'Due Date' },
]

export default function TaskTable() {
  const { data: tasks = [], isLoading, isError } = useFilteredTasks()
  const { sortColumn, sortDirection, setSortColumn, setSortDirection } = useTableStore()
  const [editTask, setEditTask] = useState<Task | null>(null)

  function handleSort(col: SortableColumn) {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDirection('asc')
    }
  }

  function SortIcon({ col }: { col: SortableColumn }) {
    if (sortColumn !== col) return <ChevronUp className="h-3.5 w-3.5 text-slate-300 ml-1 inline" />
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 text-slate-700 ml-1 inline" />
      : <ChevronDown className="h-3.5 w-3.5 text-slate-700 ml-1 inline" />
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500 py-4">Loading tasks…</p>
  }
  if (isError) {
    return <p className="text-sm text-red-600 py-4">Failed to load tasks.</p>
  }

  return (
    <>
      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                  No tasks match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={task.number}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setEditTask(task)}
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`https://github.com/${task.assignee}.png?size=32`}
                            alt={task.assignee}
                          />
                          <AvatarFallback className="text-xs">
                            {task.assignee[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assignee}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{STATUS_LABELS[task.status]}</span>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <span className="text-sm">
                        {new Date(task.dueDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editTask && (
        <TaskDialog
          task={editTask}
          open={editTask !== null}
          onOpenChange={(open) => { if (!open) setEditTask(null) }}
        />
      )}
    </>
  )
}
