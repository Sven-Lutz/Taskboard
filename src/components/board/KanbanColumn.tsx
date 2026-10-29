import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TaskCard from '@/components/board/TaskCard'
import TaskDialog from '@/components/tasks/TaskDialog'
import type { Task, TaskStatus } from '@/types/task'

const COLUMN_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
}

export default function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const [createOpen, setCreateOpen] = useState(false)

  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <>
      <div className="flex flex-col w-72 flex-shrink-0">
        {/* Column header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-700">
              {COLUMN_LABELS[status]}
            </h2>
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-slate-200 text-xs font-medium text-slate-600">
              {tasks.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCreateOpen(true)}
            title="Add task"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2 flex-1 min-h-24 rounded-lg p-1 transition-colors ${
            isOver ? 'bg-slate-100' : 'bg-slate-50'
          }`}
        >
          <SortableContext
            items={tasks.map((t) => t.number)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard key={task.number} task={task} />
            ))}
          </SortableContext>
        </div>
      </div>

      <TaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultStatus={status}
      />
    </>
  )
}
