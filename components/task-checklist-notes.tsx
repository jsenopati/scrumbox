"use client"

import { useState, useTransition } from "react"
import { IoTrashOutline, IoAdd, IoCheckmarkCircle } from "react-icons/io5"
import type { Task } from "@/lib/data"
import {
  addChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
  updateTaskNotesAction,
} from "@/lib/actions"

export function TaskChecklistNotes({
  task,
  canEdit,
}: {
  task: Task
  canEdit: boolean
}) {
  return (
    <div className="space-y-5">
      <ChecklistSection task={task} canEdit={canEdit} />
      <div className="divider my-1" />
      <NotesSection task={task} canEdit={canEdit} />
    </div>
  )
}

export function ChecklistSection({
  task,
  canEdit,
}: {
  task: Task
  canEdit: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [newItem, setNewItem] = useState("")
  const total = task.checklist.length
  const checked = task.checklist.filter((i) => i.checked).length

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

export function NotesSection({
  task,
  canEdit,
}: {
  task: Task
  canEdit: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(task.notes)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [synced, setSynced] = useState({ id: task.id, notes: task.notes })

  // Keep local state in sync when a different task is opened or its notes
  // change externally. Done during render (per React guidance) instead of in
  // an effect to avoid cascading renders.
  if (synced.id !== task.id || synced.notes !== task.notes) {
    setSynced({ id: task.id, notes: task.notes })
    setNotes(task.notes)
    setSavedAt(null)
  }

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
