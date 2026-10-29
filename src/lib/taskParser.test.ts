import { describe, it, expect } from 'vitest'
import {
  parseIssue,
  serializeTaskBody,
  buildIssueLabels,
  META_COMMENT_REGEX,
} from './taskParser'
import type { GitHubIssue } from './taskParser'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeIssue(overrides: Partial<GitHubIssue> = {}): GitHubIssue {
  return {
    id: 1,
    number: 42,
    title: 'Test task',
    body: 'Some description',
    state: 'open',
    labels: [],
    assignee: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    ...overrides,
  }
}

// ── parseIssue ────────────────────────────────────────────────────────────────

describe('parseIssue', () => {
  it('extracts status and priority from labels', () => {
    const issue = makeIssue({
      labels: [{ name: 'status:in-progress' }, { name: 'priority:high' }],
    })
    const task = parseIssue(issue)
    expect(task.status).toBe('in-progress')
    expect(task.priority).toBe('high')
  })

  it('defaults to backlog status and medium priority when no labels', () => {
    const task = parseIssue(makeIssue())
    expect(task.status).toBe('backlog')
    expect(task.priority).toBe('medium')
  })

  it('treats a closed issue as status done regardless of labels', () => {
    const issue = makeIssue({
      state: 'closed',
      labels: [{ name: 'status:todo' }, { name: 'priority:low' }],
    })
    const task = parseIssue(issue)
    expect(task.status).toBe('done')
    expect(task.priority).toBe('low')
  })

  it('reads meta comment from body and strips it from the returned body', () => {
    const meta = { urgency: 'high', importance: 'low', dueDate: '2024-06-01' }
    const body = `My task body\n<!-- meta: ${JSON.stringify(meta)} -->`
    const issue = makeIssue({ body })
    const task = parseIssue(issue)
    expect(task.urgency).toBe('high')
    expect(task.importance).toBe('low')
    expect(task.dueDate).toBe('2024-06-01')
    expect(task.body).toBe('My task body')
    expect(META_COMMENT_REGEX.test(task.body)).toBe(false)
  })

  it('uses auto defaults when no meta comment is present', () => {
    const task = parseIssue(makeIssue({ body: 'No meta here' }))
    expect(task.urgency).toBe('auto')
    expect(task.importance).toBe('auto')
    expect(task.dueDate).toBeNull()
  })

  it('excludes status and priority labels from the labels array', () => {
    const issue = makeIssue({
      labels: [
        { name: 'status:todo' },
        { name: 'priority:medium' },
        { name: 'bug' },
        { name: 'help wanted' },
      ],
    })
    const task = parseIssue(issue)
    expect(task.labels).toEqual(['bug', 'help wanted'])
  })

  it('maps assignee login and avatar url', () => {
    const issue = makeIssue({
      assignee: { login: 'octocat', avatar_url: 'https://github.com/octocat.png' },
    })
    const task = parseIssue(issue)
    expect(task.assignee).toBe('octocat')
    expect(task.assigneeAvatarUrl).toBe('https://github.com/octocat.png')
  })

  it('handles null body gracefully', () => {
    const issue = makeIssue({ body: null })
    const task = parseIssue(issue)
    expect(task.body).toBe('')
    expect(task.urgency).toBe('auto')
  })
})

// ── serializeTaskBody ─────────────────────────────────────────────────────────

describe('serializeTaskBody', () => {
  it('appends a meta comment to plain body text', () => {
    const result = serializeTaskBody('Hello', {
      urgency: 'high',
      importance: 'low',
      dueDate: '2024-06-01',
    })
    expect(result).toContain('Hello')
    expect(result).toMatch(META_COMMENT_REGEX)
  })

  it('round-trips: write then read returns the same meta values', () => {
    const meta = { urgency: 'high' as const, importance: 'auto' as const, dueDate: '2025-12-31' }
    const serialized = serializeTaskBody('Task description', meta)
    const issue = makeIssue({ body: serialized })
    const task = parseIssue(issue)
    expect(task.urgency).toBe(meta.urgency)
    expect(task.importance).toBe(meta.importance)
    expect(task.dueDate).toBe(meta.dueDate)
    expect(task.body).toBe('Task description')
  })

  it('replaces an existing meta comment instead of appending a second one', () => {
    const first = serializeTaskBody('Body', { urgency: 'low', importance: 'high', dueDate: null })
    const second = serializeTaskBody(
      first.replace(META_COMMENT_REGEX, '').trimEnd(),
      { urgency: 'high', importance: 'low', dueDate: '2024-01-01' },
    )
    const matches = [...second.matchAll(/<!-- meta:/g)]
    expect(matches).toHaveLength(1)
    expect(second).toContain('"urgency":"high"')
  })
})

// ── buildIssueLabels ──────────────────────────────────────────────────────────

describe('buildIssueLabels', () => {
  it('replaces existing status and priority labels', () => {
    const result = buildIssueLabels('todo', 'high', [
      'status:backlog',
      'priority:low',
      'bug',
    ])
    expect(result).toContain('status:todo')
    expect(result).toContain('priority:high')
    expect(result).not.toContain('status:backlog')
    expect(result).not.toContain('priority:low')
    expect(result).toContain('bug')
  })

  it('works with an empty existing labels array', () => {
    const result = buildIssueLabels('in-progress', 'medium', [])
    expect(result).toEqual(['status:in-progress', 'priority:medium'])
  })
})
