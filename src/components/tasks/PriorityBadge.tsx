import type { TaskPriority } from '@/types/task'

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
}

interface PriorityBadgeProps {
  priority: TaskPriority
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  )
}
