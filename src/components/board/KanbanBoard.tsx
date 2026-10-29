import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useTasks, useUpdateTask } from '@/hooks/useTasks'
import KanbanColumn from '@/components/board/KanbanColumn'
import type { Task, TaskStatus } from '@/types/task'

const COLUMNS: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'done']

export default function KanbanBoard() {
  const { data: tasks = [], isLoading, isError } = useTasks()
  const updateTask = useUpdateTask()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const taskNumber = active.id as number
    const overId = over.id as string | number

    // Determine the target column: `over.id` may be a column status or a task number
    const targetStatus: TaskStatus | undefined = COLUMNS.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : (tasks.find((t) => t.number === overId)?.status)

    const task = tasks.find((t) => t.number === taskNumber)
    if (!task || !targetStatus || task.status === targetStatus) return

    updateTask.mutate({ number: taskNumber, patch: { status: targetStatus } })
  }

  if (isLoading) {
    return (
      <div className="flex gap-6 p-6">
        {COLUMNS.map((col) => (
          <div key={col} className="w-72 h-96 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="p-6 text-red-600 text-sm">
        Failed to load tasks. Check your GitHub credentials.
      </p>
    )
  }

  const tasksByStatus = (status: TaskStatus): Task[] =>
    tasks.filter((t) => t.status === status)

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 p-6 overflow-x-auto">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
          />
        ))}
      </div>
    </DndContext>
  )
}
