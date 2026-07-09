"use client"

import { useRef } from "react"
import { IoArchiveOutline, IoCreateOutline, IoAdd } from "react-icons/io5"
import type { TaskList } from "@/lib/data"
import {
  updateTaskListAction,
  createTaskAction,
  archiveTaskListAction,
} from "@/lib/actions"
import { TaskListFields, TaskFields } from "./task-fields"
import { SubmitButton } from "./submit-button"

/**
 * Editor-only controls shown on a task-list card: edit list details, add a
 * task, and archive. Edit/add open dialogs that auto-close on success.
 */
export function ListAdminControls({
  taskList,
  teamNames,
  variant = "light",
}: {
  taskList: TaskList
  teamNames: string[]
  variant?: "light" | "dark"
}) {
  const editRef = useRef<HTMLDialogElement>(null)
  const addRef = useRef<HTMLDialogElement>(null)

  const btnClass =
    variant === "dark"
      ? "btn btn-xs btn-ghost text-neutral-content"
      : "btn btn-xs btn-ghost"

  async function submitEdit(formData: FormData) {
    await updateTaskListAction(formData)
    editRef.current?.close()
  }

  async function submitAdd(formData: FormData) {
    await createTaskAction(formData)
    addRef.current?.close()
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={btnClass}
        onClick={() => editRef.current?.showModal()}
        title="Edit list details"
      >
        <IoCreateOutline />
        Edit
      </button>
      <button
        type="button"
        className={btnClass}
        onClick={() => addRef.current?.showModal()}
        title="Add a task"
      >
        <IoAdd />
        Task
      </button>
      <form action={archiveTaskListAction}>
        <input type="hidden" name="id" value={taskList.id} />
        <button type="submit" className={btnClass} title="Archive list">
          <IoArchiveOutline />
          Archive
        </button>
      </form>

      {/* Edit list dialog */}
      <dialog ref={editRef} className="modal">
        <div className="modal-box max-w-2xl text-left text-base-content">
          <h3 className="font-bold text-lg mb-4">Edit list</h3>
          <form action={submitEdit} className="space-y-4">
            <input type="hidden" name="id" value={taskList.id} />
            <TaskListFields taskList={taskList} />
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => editRef.current?.close()}
              >
                Cancel
              </button>
              <SubmitButton className="btn btn-primary btn-sm">
                Save changes
              </SubmitButton>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Add task dialog */}
      <dialog ref={addRef} className="modal">
        <div className="modal-box max-w-2xl text-left text-base-content">
          <h3 className="font-bold text-lg mb-4">
            Add task to {taskList.name}
          </h3>
          <form action={submitAdd} className="space-y-4">
            <input type="hidden" name="taskListId" value={taskList.id} />
            <TaskFields team={teamNames} />
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => addRef.current?.close()}
              >
                Cancel
              </button>
              <SubmitButton className="btn btn-primary btn-sm">
                Add task
              </SubmitButton>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}
