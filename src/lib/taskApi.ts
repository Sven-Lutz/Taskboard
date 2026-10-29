import type { Octokit } from '@octokit/rest'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'
import type { TaskMeta } from '@/lib/taskParser'
import {
  parseIssue,
  serializeTaskBody,
  buildIssueLabels,
} from '@/lib/taskParser'

const OWNER = import.meta.env.VITE_GITHUB_OWNER as string
const REPO = import.meta.env.VITE_GITHUB_REPO as string

// ── Input / patch types ───────────────────────────────────────────────────────

export interface CreateTaskInput {
  title: string
  body?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee?: string | null
  meta?: Partial<TaskMeta>
}

export interface UpdateTaskPatch {
  title?: string
  body?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee?: string | null
  meta?: Partial<TaskMeta>
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Fetches all issues (open + closed) from the repo and converts them to Tasks.
 * Pull requests are filtered out (GitHub returns PRs in the Issues API).
 */
export async function fetchTasks(octokit: Octokit): Promise<Task[]> {
  const { data } = await octokit.rest.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'all',
    per_page: 100,
  })

  return data
    .filter((issue) => !('pull_request' in issue && issue.pull_request))
    .map((issue) =>
      parseIssue(
        issue as Parameters<typeof parseIssue>[0],
      ),
    )
}

/** Fetches a single issue by its issue number. */
export async function fetchTask(
  octokit: Octokit,
  number: number,
): Promise<Task> {
  const { data } = await octokit.rest.issues.get({
    owner: OWNER,
    repo: REPO,
    issue_number: number,
  })
  return parseIssue(data as Parameters<typeof parseIssue>[0])
}

/** Creates a new GitHub Issue and returns the parsed Task. */
export async function createTask(
  octokit: Octokit,
  input: CreateTaskInput,
): Promise<Task> {
  const status: TaskStatus = input.status ?? 'backlog'
  const priority: TaskPriority = input.priority ?? 'medium'
  const meta: TaskMeta = {
    urgency: input.meta?.urgency ?? 'auto',
    importance: input.meta?.importance ?? 'auto',
    dueDate: input.meta?.dueDate ?? null,
  }
  const labels = buildIssueLabels(status, priority, [])
  const body = serializeTaskBody(input.body ?? '', meta)

  const { data } = await octokit.rest.issues.create({
    owner: OWNER,
    repo: REPO,
    title: input.title,
    body,
    labels,
    ...(input.assignee ? { assignees: [input.assignee] } : {}),
  })
  return parseIssue(data as Parameters<typeof parseIssue>[0])
}

/** Partially updates an existing issue and returns the updated Task. */
export async function updateTask(
  octokit: Octokit,
  number: number,
  patch: UpdateTaskPatch,
): Promise<Task> {
  // Fetch current issue to merge labels and body
  const current = await fetchTask(octokit, number)

  const status = patch.status ?? current.status
  const priority = patch.priority ?? current.priority

  // Rebuild the full label list (preserves non-status/priority labels)
  const allCurrentLabels = [
    ...current.labels,
    `status:${current.status}`,
    `priority:${current.priority}`,
  ]
  const labels = buildIssueLabels(status, priority, allCurrentLabels)

  // Merge meta fields
  const meta: TaskMeta = {
    urgency: patch.meta?.urgency ?? current.urgency,
    importance: patch.meta?.importance ?? current.importance,
    dueDate: patch.meta?.dueDate !== undefined
      ? patch.meta.dueDate
      : current.dueDate,
  }

  const bodyText = patch.body !== undefined ? patch.body : current.body
  const body = serializeTaskBody(bodyText, meta)

  const issueState = status === 'done' ? 'closed' : 'open'

  const { data } = await octokit.rest.issues.update({
    owner: OWNER,
    repo: REPO,
    issue_number: number,
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    body,
    labels,
    state: issueState,
    ...(patch.assignee !== undefined
      ? { assignees: patch.assignee ? [patch.assignee] : [] }
      : {}),
  })
  return parseIssue(data as Parameters<typeof parseIssue>[0])
}

/** Closes a GitHub Issue (maps to 'done' status). */
export async function closeTask(
  octokit: Octokit,
  number: number,
): Promise<Task> {
  const { data } = await octokit.rest.issues.update({
    owner: OWNER,
    repo: REPO,
    issue_number: number,
    state: 'closed',
  })
  return parseIssue(data as Parameters<typeof parseIssue>[0])
}
