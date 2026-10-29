
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { getOctokit } from '@/lib/github'
import {
  fetchTasks,
  fetchTask,
  createTask,
  updateTask,
  closeTask,
} from '@/lib/taskApi'
import type { CreateTaskInput, UpdateTaskPatch } from '@/lib/taskApi'
import type { Task } from '@/types/task'

// ── Shared helper ─────────────────────────────────────────────────────────────

function useOctokit() {
  const { user } = useAuth()
  if (!user) throw new Error('useOctokit: user is not authenticated')
  return getOctokit(user.token)
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Returns all tasks, cached under the key `['tasks']`. */
export function useTasks() {
  const octokit = useOctokit()
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(octokit),
  })
}

/** Returns a single task by issue number, cached under `['task', number]`. */
export function useTask(number: number) {
  const octokit = useOctokit()
  return useQuery({
    queryKey: ['task', number],
    queryFn: () => fetchTask(octokit, number),
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Creates a new task and invalidates the tasks list on success. */
export function useCreateTask() {
  const octokit = useOctokit()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(octokit, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * Updates a task with an optimistic update on the `['tasks']` cache.
 * Rolls back to the previous value if the mutation fails.
 */
export function useUpdateTask() {
  const octokit = useOctokit()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      number,
      patch,
    }: {
      number: number
      patch: UpdateTaskPatch
    }) => updateTask(octokit, number, patch),

    onMutate: async ({ number, patch }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = qc.getQueryData<Task[]>(['tasks'])
      qc.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) =>
          t.number === number ? { ...t, ...patch } : t,
        ),
      )
      return { previousTasks }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousTasks !== undefined) {
        qc.setQueryData(['tasks'], context.previousTasks)
      }
    },

    onSettled: (_data, _err, { number }) => {
      void qc.invalidateQueries({ queryKey: ['tasks'] })
      void qc.invalidateQueries({ queryKey: ['task', number] })
    },
  })
}

/** Closes a task and invalidates the tasks list on success. */
export function useCloseTask() {
  const octokit = useOctokit()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (number: number) => closeTask(octokit, number),
    onSuccess: (_data, number) => {
      void qc.invalidateQueries({ queryKey: ['tasks'] })
      void qc.invalidateQueries({ queryKey: ['task', number] })
    },
  })
}
