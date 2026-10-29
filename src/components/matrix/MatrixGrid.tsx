import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useTasks, useUpdateTask } from '@/hooks/useTasks'
import MatrixQuadrant from '@/components/matrix/MatrixQuadrant'
import { QUADRANTS, resolveQuadrant } from '@/lib/eisenhower'
import type { Task } from '@/types/task'
import type { UrgencyLevel, ImportanceLevel } from '@/lib/eisenhower'

export default function MatrixGrid() {
  const { data: tasks = [], isLoading, isError } = useTasks()
  const updateTask = useUpdateTask()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const taskNumber = active.id as number
    const quadrantId = over.id as string

    const quadrant = QUADRANTS.find((q) => q.id === quadrantId)
    if (!quadrant) return

    updateTask.mutate({
      number: taskNumber,
      patch: {
        meta: {
          urgency: quadrant.urgency as UrgencyLevel,
          importance: quadrant.importance as ImportanceLevel,
        },
      },
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-2 gap-4">
        {QUADRANTS.map((q) => (
          <div key={q.id} className="h-48 rounded-lg bg-slate-100 animate-pulse" />
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

  function tasksForQuadrant(urgency: UrgencyLevel, importance: ImportanceLevel): Task[] {
    return tasks.filter((t) => {
      const q = resolveQuadrant(t)
      return q.urgency === urgency && q.importance === importance
    })
  }

  return (
    <div className="p-6">
      {/* Axis labels + grid */}
      <div className="flex">
        {/* Left importance axis label */}
        <div className="flex items-center justify-center w-8 mr-2">
          <span className="text-xs font-semibold text-slate-500 -rotate-90 whitespace-nowrap tracking-wide uppercase">
            Importance
          </span>
        </div>

        <div className="flex-1">
          {/* Top urgency labels */}
          <div className="grid grid-cols-2 mb-1">
            <div className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Urgent
            </div>
            <div className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Not Urgent
            </div>
          </div>

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-2 gap-3">
              {/* Row 1: Important */}
              <MatrixQuadrant
                quadrant={QUADRANTS.find((q) => q.id === 'do-first')!}
                tasks={tasksForQuadrant('high', 'high')}
              />
              <MatrixQuadrant
                quadrant={QUADRANTS.find((q) => q.id === 'schedule')!}
                tasks={tasksForQuadrant('low', 'high')}
              />
              {/* Row 2: Not Important */}
              <MatrixQuadrant
                quadrant={QUADRANTS.find((q) => q.id === 'delegate')!}
                tasks={tasksForQuadrant('high', 'low')}
              />
              <MatrixQuadrant
                quadrant={QUADRANTS.find((q) => q.id === 'eliminate')!}
                tasks={tasksForQuadrant('low', 'low')}
              />
            </div>
          </DndContext>

          {/* Row labels on the right side */}
          <div className="grid grid-cols-2 gap-3 mt-1 pointer-events-none">
            <div />
            <div />
          </div>
        </div>

        {/* Right importance labels */}
        <div className="flex flex-col justify-around ml-2 w-8">
          <span className="text-xs font-semibold text-slate-500 -rotate-90 whitespace-nowrap tracking-wide uppercase text-center">
            High
          </span>
          <span className="text-xs font-semibold text-slate-500 -rotate-90 whitespace-nowrap tracking-wide uppercase text-center">
            Low
          </span>
        </div>
      </div>
    </div>
  )
}
