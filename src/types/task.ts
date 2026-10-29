export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type EisenhowerLevel = 'auto' | 'high' | 'low'

export interface Task {
  id: number              // GitHub Issue id
  number: number          // GitHub Issue number (used in API calls)
  title: string
  body: string            // Issue body WITHOUT the meta comment
  assignee: string | null         // GitHub login
  assigneeAvatarUrl: string | null
  status: TaskStatus
  priority: TaskPriority
  labels: string[]
  dueDate: string | null          // ISO date string, e.g. "2024-06-01"
  urgency: EisenhowerLevel
  importance: EisenhowerLevel
  createdAt: string
  updatedAt: string
}
