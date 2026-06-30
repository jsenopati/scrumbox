"use client"

import { useEffect, useRef } from "react"
import { IoClose } from "react-icons/io5"
import type { Task } from "@/lib/data"
import type { Role } from "@/lib/session"
import { ChecklistSection, NotesSection } from "./task-checklist-notes"

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

      <ChecklistSection task={task} canEdit={canEdit} />

      <div className="divider my-1" />

      <NotesSection task={task} canEdit={canEdit} />
    </div>
  )
}
