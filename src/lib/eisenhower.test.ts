import { describe, it, expect } from 'vitest'
import { autoClassify, resolveQuadrant } from './eisenhower'
import type { Task } from '@/types/task'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    number: 1,
    title: 'Test task',
    body: '',
    assignee: null,
    assigneeAvatarUrl: null,
    status: 'todo',
    priority: 'medium',
    labels: [],
    dueDate: null,
    urgency: 'auto',
    importance: 'auto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

describe('autoClassify', () => {
  it('marks task as urgent when dueDate is today', () => {
    const task = makeTask({ dueDate: todayPlus(0) })
    expect(autoClassify(task).urgency).toBe('high')
  })

  it('marks task as urgent when dueDate is in 2 days', () => {
    const task = makeTask({ dueDate: todayPlus(2) })
    expect(autoClassify(task).urgency).toBe('high')
  })

  it('marks task as NOT urgent when dueDate is in 5 days', () => {
    const task = makeTask({ dueDate: todayPlus(5) })
    expect(autoClassify(task).urgency).toBe('low')
  })

  it('marks task as NOT urgent when dueDate is null', () => {
    const task = makeTask({ dueDate: null })
    expect(autoClassify(task).urgency).toBe('low')
  })

  it('marks task as important when priority is high', () => {
    const task = makeTask({ priority: 'high' })
    expect(autoClassify(task).importance).toBe('high')
  })

  it('marks task as important when priority is medium', () => {
    const task = makeTask({ priority: 'medium' })
    expect(autoClassify(task).importance).toBe('high')
  })

  it('marks task as NOT important when priority is low', () => {
    const task = makeTask({ priority: 'low' })
    expect(autoClassify(task).importance).toBe('low')
  })
})

describe('resolveQuadrant', () => {
  it('uses auto-classification when both urgency and importance are "auto"', () => {
    const task = makeTask({ dueDate: todayPlus(1), priority: 'high' })
    const result = resolveQuadrant(task)
    expect(result).toEqual({ urgency: 'high', importance: 'high' })
  })

  it('respects manual urgency override', () => {
    const task = makeTask({ dueDate: todayPlus(10), urgency: 'high' })
    expect(resolveQuadrant(task).urgency).toBe('high')
  })

  it('respects manual importance override', () => {
    const task = makeTask({ priority: 'low', importance: 'high' })
    expect(resolveQuadrant(task).importance).toBe('high')
  })

  it('allows partial override: manual urgency + auto importance', () => {
    const task = makeTask({ priority: 'low', urgency: 'high', importance: 'auto' })
    const result = resolveQuadrant(task)
    expect(result.urgency).toBe('high')
    expect(result.importance).toBe('low')
  })
})
