import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks'
import { TEAM_MEMBERS } from '@/lib/constants'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'

interface TaskDialogProps {
  task?: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStatus?: TaskStatus
}

interface FormState {
  title: string
  body: string
  assignee: string
  priority: TaskPriority
  dueDate: string
  status: TaskStatus
}

function getInitialForm(task?: Task, defaultStatus?: TaskStatus): FormState {
  return {
    title: task?.title ?? '',
    body: task?.body ?? '',
    assignee: task?.assignee ?? '',
    priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ?? '',
    status: task?.status ?? defaultStatus ?? 'backlog',
  }
}

// Inner component so it remounts (and resets form) each time the dialog opens
function TaskDialogForm({
  task,
  defaultStatus,
  onOpenChange,
}: {
  task?: Task
  defaultStatus?: TaskStatus
  onOpenChange: (open: boolean) => void
}) {
  const isEdit = task !== undefined
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const [form, setForm] = useState<FormState>(() =>
    getInitialForm(task, defaultStatus),
  )

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!form.title.trim()) return
    const meta = { dueDate: form.dueDate || null }
    if (isEdit) {
      updateTask.mutate(
        {
          number: task.number,
          patch: {
            title: form.title,
            body: form.body,
            assignee: form.assignee || null,
            priority: form.priority,
            status: form.status,
            meta,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createTask.mutate(
        {
          title: form.title,
          body: form.body,
          assignee: form.assignee || null,
          priority: form.priority,
          status: form.status,
          meta,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  const isPending = createTask.isPending || updateTask.isPending

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Task' : 'New Task'}</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label htmlFor="td-title">Title *</Label>
          <Input
            id="td-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Task title"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="td-body">Description</Label>
          <Textarea
            id="td-body"
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>Assignee</Label>
            <Select
              value={form.assignee}
              onValueChange={(v) => set('assignee', v === '__none__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Unassigned</SelectItem>
                {TEAM_MEMBERS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => set('priority', v as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="td-due">Due Date</Label>
            <Input
              id="td-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set('status', v as TaskStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending || !form.title.trim()}>
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
        </Button>
      </DialogFooter>
    </>
  )
}

export default function TaskDialog({
  task,
  open,
  onOpenChange,
  defaultStatus,
}: TaskDialogProps) {
  // key changes when the dialog opens or the task changes, forcing a fresh form
  const formKey = open ? `${task?.number ?? 'new'}-${defaultStatus ?? ''}` : 'closed'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <TaskDialogForm
          key={formKey}
          task={task}
          defaultStatus={defaultStatus}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  )
}
