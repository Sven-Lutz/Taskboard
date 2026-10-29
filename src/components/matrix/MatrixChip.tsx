import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Task } from '@/types/task'

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
}

interface MatrixChipProps {
  task: Task
}

export default function MatrixChip({ task }: MatrixChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.number })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1 cursor-grab active:cursor-grabbing shadow-sm max-w-full"
    >
      <span
        className={`h-2 w-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`}
      />
      <span className="text-xs font-medium text-slate-800 truncate flex-1">
        {task.title}
      </span>
      {task.assignee && (
        <Avatar className="h-5 w-5 flex-shrink-0">
          <AvatarImage
            src={`https://github.com/${task.assignee}.png?size=32`}
            alt={task.assignee}
          />
          <AvatarFallback className="text-[10px]">
            {task.assignee[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
