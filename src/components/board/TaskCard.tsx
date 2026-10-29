import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import PriorityBadge from '@/components/tasks/PriorityBadge'
import TaskDialog from '@/components/tasks/TaskDialog'
import type { Task } from '@/types/task'

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.number })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setDialogOpen(true)}
        className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow select-none"
      >
        <p className="text-sm font-medium text-slate-900 mb-2 leading-snug line-clamp-2">
          {task.title}
        </p>

        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} />

          <div className="flex items-center gap-1.5 ml-auto">
            {task.dueDate && (
              <span className="text-xs text-slate-500">
                {new Date(task.dueDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            )}
            {task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={`https://github.com/${task.assignee}.png?size=32`}
                  alt={task.assignee}
                />
                <AvatarFallback className="text-xs">
                  {task.assignee[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>

      <TaskDialog
        task={task}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
