import type {
  Task,
  TaskStatus,
  TaskPriority,
  EisenhowerLevel,
} from '@/types/task'

// ── Raw GitHub API shape ─────────────────────────────────────────────────────

export interface GitHubLabel {
  name: string
}

export interface GitHubAssignee {
  login: string
  avatar_url: string
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  labels: GitHubLabel[]
  assignee: GitHubAssignee | null
  created_at: string
  updated_at: string
  /** Present on pull requests; used to filter PRs out of the issues list. */
  pull_request?: unknown
}

// ── Meta comment ─────────────────────────────────────────────────────────────

export interface TaskMeta {
  urgency: EisenhowerLevel
  importance: EisenhowerLevel
  dueDate: string | null
}

const DEFAULT_META: TaskMeta = {
  urgency: 'auto',
  importance: 'auto',
  dueDate: null,
}

/**
 * Matches the trailing HTML comment that stores app-specific metadata,
 * e.g. `<!-- meta: {"urgency":"high","importance":"low","dueDate":"2024-06-01"} -->`
 *
 * The regex captures the raw JSON string so it can be parsed independently.
 */
export const META_COMMENT_REGEX =
  /<!--\s*meta:\s*(\{[^}]*\})\s*-->\s*$/

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractMeta(body: string): TaskMeta {
  const match = META_COMMENT_REGEX.exec(body)
  if (!match) return { ...DEFAULT_META }
  try {
    const parsed = JSON.parse(match[1]) as Partial<TaskMeta>
    return {
      urgency: parsed.urgency ?? 'auto',
      importance: parsed.importance ?? 'auto',
      dueDate: parsed.dueDate ?? null,
    }
  } catch {
    return { ...DEFAULT_META }
  }
}

function stripMetaComment(body: string): string {
  return body.replace(META_COMMENT_REGEX, '').trimEnd()
}

function extractStatus(
  issue: GitHubIssue,
  labelNames: string[],
): TaskStatus {
  if (issue.state === 'closed') return 'done'
  for (const name of labelNames) {
    if (name === 'status:backlog') return 'backlog'
    if (name === 'status:todo') return 'todo'
    if (name === 'status:in-progress') return 'in-progress'
  }
  return 'backlog'
}

function extractPriority(labelNames: string[]): TaskPriority {
  for (const name of labelNames) {
    if (name === 'priority:high') return 'high'
    if (name === 'priority:medium') return 'medium'
    if (name === 'priority:low') return 'low'
  }
  return 'medium'
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Converts a raw GitHub Issue into a typed Task. */
export function parseIssue(issue: GitHubIssue): Task {
  const rawBody = issue.body ?? ''
  const labelNames = issue.labels.map((l) => l.name)
  const meta = extractMeta(rawBody)

  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    body: stripMetaComment(rawBody),
    assignee: issue.assignee?.login ?? null,
    assigneeAvatarUrl: issue.assignee?.avatar_url ?? null,
    status: extractStatus(issue, labelNames),
    priority: extractPriority(labelNames),
    labels: labelNames.filter(
      (n) => !n.startsWith('status:') && !n.startsWith('priority:'),
    ),
    dueDate: meta.dueDate,
    urgency: meta.urgency,
    importance: meta.importance,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
  }
}

/**
 * Appends (or replaces) the meta comment on an issue body string.
 * Always produces exactly one meta comment at the very end of the body.
 */
export function serializeTaskBody(bodyText: string, meta: TaskMeta): string {
  const stripped = stripMetaComment(bodyText)
  const comment = `<!-- meta: ${JSON.stringify(meta)} -->`
  return stripped.length > 0 ? `${stripped}\n${comment}` : comment
}

/**
 * Returns the complete label array that should be sent to GitHub:
 * - removes any existing `status:*` and `priority:*` labels
 * - adds the new `status:{status}` and `priority:{priority}` labels
 * - preserves all other labels unchanged
 */
export function buildIssueLabels(
  status: TaskStatus,
  priority: TaskPriority,
  existingLabels: string[],
): string[] {
  const other = existingLabels.filter(
    (n) => !n.startsWith('status:') && !n.startsWith('priority:'),
  )
  // 'done' maps to closed state, not a label — still set status:done label for
  // informational purposes but GitHub state drives the Done column.
  return [...other, `status:${status}`, `priority:${priority}`]
}
