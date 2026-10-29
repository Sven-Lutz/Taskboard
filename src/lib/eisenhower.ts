import type { Task } from '@/types/task'

export type UrgencyLevel = 'high' | 'low'
export type ImportanceLevel = 'high' | 'low'

export interface QuadrantClassification {
  urgency: UrgencyLevel
  importance: ImportanceLevel
}

/**
 * Auto-classifies a task based on due date and priority.
 * - urgency: dueDate within 3 days from today → 'high', else → 'low'
 * - importance: priority 'high' or 'medium' → 'high', 'low' → 'low'
 */
export function autoClassify(task: Task): QuadrantClassification {
  let urgency: UrgencyLevel = 'low'
  if (task.dueDate) {
    const due = new Date(task.dueDate)
    const now = new Date()
    // Reset time to start of day for fair comparison
    now.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 3) urgency = 'high'
  }

  const importance: ImportanceLevel =
    task.priority === 'high' || task.priority === 'medium' ? 'high' : 'low'

  return { urgency, importance }
}

/**
 * Resolves the effective quadrant for a task, respecting manual overrides.
 * If urgency or importance is 'auto', the auto-classified value is used.
 */
export function resolveQuadrant(task: Task): QuadrantClassification {
  const auto = autoClassify(task)
  return {
    urgency: task.urgency !== 'auto' ? (task.urgency as UrgencyLevel) : auto.urgency,
    importance: task.importance !== 'auto' ? (task.importance as ImportanceLevel) : auto.importance,
  }
}

export interface QuadrantMeta {
  id: string
  label: string
  description: string
  urgency: UrgencyLevel
  importance: ImportanceLevel
  bgColor: string
}

/** The four Eisenhower quadrants, ordered for the 2×2 grid layout. */
export const QUADRANTS: QuadrantMeta[] = [
  {
    id: 'do-first',
    label: 'Do First',
    description: 'Urgent & Important',
    urgency: 'high',
    importance: 'high',
    bgColor: 'bg-red-50 border-red-200',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    description: 'Not Urgent & Important',
    urgency: 'low',
    importance: 'high',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'delegate',
    label: 'Delegate',
    description: 'Urgent & Not Important',
    urgency: 'high',
    importance: 'low',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'eliminate',
    label: 'Eliminate',
    description: 'Not Urgent & Not Important',
    urgency: 'low',
    importance: 'low',
    bgColor: 'bg-slate-50 border-slate-200',
  },
]
