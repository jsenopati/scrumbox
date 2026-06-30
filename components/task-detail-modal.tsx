"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import {
  IoClose,
  IoTrashOutline,
  IoAdd,
  IoCheckmarkCircle,
} from "react-icons/io5"
import type { Task } from "@/lib/data"
import type { Role } from "@/lib/session"
import {
  addChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
  updateTaskNotesAction,
} from "@/app/manage/actions"

const statusBadge: Record<string, string> = {
  completed: "badge-success",
  "in-progress": "badge-warning",
  "not-started": "badge-ghost",
}
const priorityBadge: Record<string, string> = {
  asap: "badge-error badge-outline font-bold",
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-ghost",
  backlog: "badge-neutral",
}
const statusLabel: Record<string, string> = {
  completed: "Done",
  "in-progress": "In progress",
  "not-started": "Not started",
}

interface Props {
  task: Task | null
  listName: string
  role: Role
  onClose: () => void
}

export function TaskDetailModal({ task, listName, role, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (task && !dlg.open) dlg.showModal()
    if (!task && dlg.open) dlg.close()
  }, [task])

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className="modal-box max-w-2xl">
        {task && (
          <TaskDetailContent task={task} listName={listName} role={role} />
        )}
        <form method="dialog" className="modal-action mt-6">
          <button className="btn btn-sm">Close</button>
        </form>
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label="Close"
          >
            <IoClose />
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

function TaskDetailContent({
  task,
  listName,
  role,
}: {
  task: Task
  listName: string
  role: Role
}) {
  const canEdit = role === "editor"
  const checkedCount = task.checklist.filter((i) => i.checked).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-wide text-base-content/50">
          {listName}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <h3 className="font-bold text-xl">{task.title}</h3>
          <span className={`badge badge-sm ${priorityBadge[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`badge badge-sm ${statusBadge[task.status]}`}>
            {statusLabel[task.status]}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-base-content/70">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
        {task.assignees.length > 0 && (
          <span className="font-medium">{task.assignees.join(", ")}</span>
        )}
        {task.storyPoints != null && <span>{task.storyPoints} pts</span>}
        {task.dueDate && (
          <span>
            Due: {new Date(task.dueDate + "T00:00:00").toLocaleDateString()}
          </span>
        )}
        {task.tags.map((tag) => (
          <span key={tag} className="badge badge-sm badge-outline">
            {tag}
          </span>
        ))}
      </div>

      <div className="divider my-1" />

      <ChecklistSection task={task} canEdit={canEdit} checked={checkedCount} />

      <div className="divider my-1" />

      <NotesSection task={task} canEdit={canEdit} />
    </div>
  )
}

function ChecklistSection({
  task,
  canEdit,
  checked,
}: {
  task: Task
  canEdit: boolean
  checked: number
}) {
  const [isPending, startTransition] = useTransition()
  const [newItem, setNewItem] = useState("")
  const total = task.checklist.length

  function toggle(itemId: string, value: boolean) {
    startTransition(async () => {
      await toggleChecklistItemAction(itemId, value)
    })
  }

  function remove(itemId: string) {
    startTransition(async () => {
      await deleteChecklistItemAction(itemId)
    })
  }

  function add() {
    const content = newItem.trim()
    if (!content) return
    setNewItem("")
    startTransition(async () => {
      await addChecklistItemAction(task.id, content)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <IoCheckmarkCircle className="text-success" />
          Checklist
        </h4>
        {total > 0 && (
          <span className="text-xs text-base-content/50">
            {checked}/{total} done
          </span>
        )}
      </div>

      {total === 0 && (
        <p className="text-sm text-base-content/50">No checklist items yet.</p>
      )}

      <ul className="space-y-1">
        {task.checklist.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-btn px-2 py-1 hover:bg-base-200"
          >
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-success"
              checked={item.checked}
              disabled={!canEdit || isPending}
              onChange={(e) => toggle(item.id, e.target.checked)}
            />
            <span
              className={`flex-1 text-sm ${
                item.checked ? "line-through text-base-content/40" : ""
              }`}
            >
              {item.content}
            </span>
            {canEdit && (
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle"
                disabled={isPending}
                onClick={() => remove(item.id)}
                aria-label="Delete item"
              >
                <IoTrashOutline />
              </button>
            )}
          </li>
        ))}
      </ul>

      {canEdit && (
        <div className="flex gap-2 pt-1">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
            placeholder="Add an item…"
            className="input input-sm flex-1"
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={isPending || newItem.trim().length === 0}
            onClick={add}
          >
            <IoAdd />
            Add
          </button>
        </div>
      )}
    </div>
  )
}

function NotesSection({ task, canEdit }: { task: Task; canEdit: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(task.notes)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  // Keep local state in sync when a different task is opened or notes change.
  useEffect(() => {
    setNotes(task.notes)
    setSavedAt(null)
  }, [task.id, task.notes])

  const dirty = notes !== task.notes

  function save() {
    startTransition(async () => {
      await updateTaskNotesAction(task.id, notes)
      setSavedAt(Date.now())
    })
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Notes</h4>

      {canEdit ? (
        <>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes during or after the task…"
            className="textarea w-full min-h-28"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={isPending || !dirty}
              onClick={save}
            >
              Save notes
            </button>
            {savedAt && !dirty && (
              <span className="text-xs text-success">Saved</span>
            )}
          </div>
        </>
      ) : task.notes ? (
        <p className="text-sm text-base-content/70 whitespace-pre-wrap">
          {task.notes}
        </p>
      ) : (
        <p className="text-sm text-base-content/50">No notes.</p>
      )}
    </div>
  )
}
