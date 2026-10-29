import { useDroppable } from '@dnd-kit/core'
import MatrixChip from '@/components/matrix/MatrixChip'
import type { QuadrantMeta } from '@/lib/eisenhower'
import type { Task } from '@/types/task'

interface MatrixQuadrantProps {
  quadrant: QuadrantMeta
  tasks: Task[]
}

export default function MatrixQuadrant({ quadrant, tasks }: MatrixQuadrantProps) {
  const { setNodeRef, isOver } = useDroppable({ id: quadrant.id })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 p-3 flex flex-col min-h-48 transition-colors ${quadrant.bgColor} ${
        isOver ? 'ring-2 ring-slate-400 ring-offset-1' : ''
      }`}
    >
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-800">{quadrant.label}</h3>
        <p className="text-xs text-slate-500">{quadrant.description}</p>
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        {tasks.map((task) => (
          <MatrixChip key={task.number} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-slate-400 mt-2 text-center">Drop tasks here</p>
        )}
      </div>
    </div>
  )
}
