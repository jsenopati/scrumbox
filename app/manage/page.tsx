import {
  getProjectData,
  getTeamMembers,
} from "@/lib/data"
import { requireRole } from "@/lib/session"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import {
  IoArrowUp,
  IoArrowDown,
  IoArchiveOutline,
  IoArrowUndoOutline,
  IoTrashOutline,
  IoPersonRemoveOutline,
  IoAdd,
  IoGridOutline,
} from "react-icons/io5"
import {
  createTaskListAction,
  updateTaskListAction,
  deleteTaskListAction,
  archiveTaskListAction,
  unarchiveTaskListAction,
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  addTeamMemberAction,
  deleteTeamMemberAction,
  moveTaskListUpAction,
  moveTaskListDownAction,
  moveTaskUpAction,
  moveTaskDownAction,
} from "@/lib/actions"
import { SubmitButton } from "@/components/submit-button"
import { TaskChecklistNotes } from "@/components/task-checklist-notes"
import { TaskFields, TaskListFields } from "@/components/task-fields"

export const dynamic = "force-dynamic"

export default async function ManagePage() {
  await requireRole("editor")
  const [data, teamMembers] = await Promise.all([
    getProjectData(),
    getTeamMembers(),
  ])
  const teamNames = teamMembers.map((m) => m.name)

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="navbar bg-base-100 rounded-box shadow-sm mb-6 px-4">
          <div className="navbar-start">
            <h1 className="text-xl font-bold">Manage Tasks</h1>
          </div>
          <div className="navbar-end gap-2">
            <ThemeToggle />
            <Link href="/dashboard" className="btn btn-ghost btn-sm gap-1">
              <IoGridOutline />
              View Dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Team Members */}
        <div className="collapse collapse-arrow bg-base-100 shadow-sm mb-6">
          <input type="checkbox" />
          <div className="collapse-title font-semibold">Team Members</div>
          <div className="collapse-content space-y-3">
            {teamMembers.length === 0 && (
              <p className="text-sm text-base-content/60">
                No team members yet.
              </p>
            )}
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-box border border-base-300 px-4 py-2"
              >
                <span className="text-sm font-medium">{member.name}</span>
                <form action={deleteTeamMemberAction}>
                  <input type="hidden" name="id" value={member.id} />
                  <button
                    type="submit"
                    className="btn btn-error btn-xs btn-soft"
                  >
                    <IoPersonRemoveOutline />
                    Remove
                  </button>
                </form>
              </div>
            ))}
            <form action={addTeamMemberAction} className="flex gap-2 pt-1">
              <input
                name="name"
                required
                placeholder="Full name"
                className="input input-sm flex-1"
              />
              <SubmitButton className="btn btn-primary btn-sm">
                Add member
              </SubmitButton>
            </form>
          </div>
        </div>

        {/* Add task list */}
        <div className="collapse collapse-arrow bg-base-100 shadow-sm mb-6">
          <input type="checkbox" />
          <div className="collapse-title font-semibold flex items-center gap-2">
            <IoAdd />
            New task list
          </div>
          <div className="collapse-content">
            <form action={createTaskListAction} className="space-y-4">
              <TaskListFields />
              <SubmitButton className="btn btn-primary">
                Create task list
              </SubmitButton>
            </form>
          </div>
        </div>

        {data.taskLists.length === 0 && (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center text-base-content/60">
              No task lists yet. Create one to get started.
            </div>
          </div>
        )}

        <div className="space-y-6">
          {data.taskLists.map((taskList) => (
            <div key={taskList.id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <h2 className="card-title">{taskList.name}</h2>
                    <p className="text-base-content/60 text-sm mt-1">
                      {taskList.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {taskList.sprint && (
                        <span className="badge badge-neutral">
                          {taskList.sprint}
                        </span>
                      )}
                      <span className="badge badge-outline badge-sm">
                        {taskList.section === "focus"
                          ? "Currently working on"
                          : taskList.section === "upnext"
                            ? "Up next"
                            : taskList.section === "concurrent"
                              ? "Concurrent"
                              : "Backlog"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={moveTaskListUpAction}>
                      <input type="hidden" name="id" value={taskList.id} />
                      <button
                        type="submit"
                        className="btn btn-ghost btn-sm btn-square"
                        title="Move up"
                      >
                        <IoArrowUp />
                      </button>
                    </form>
                    <form action={moveTaskListDownAction}>
                      <input type="hidden" name="id" value={taskList.id} />
                      <button
                        type="submit"
                        className="btn btn-ghost btn-sm btn-square"
                        title="Move down"
                      >
                        <IoArrowDown />
                      </button>
                    </form>
                    <form action={archiveTaskListAction}>
                      <input type="hidden" name="id" value={taskList.id} />
                      <button type="submit" className="btn btn-warning btn-sm">
                        <IoArchiveOutline />
                        Archive
                      </button>
                    </form>
                    <form action={deleteTaskListAction}>
                      <input type="hidden" name="id" value={taskList.id} />
                      <button type="submit" className="btn btn-error btn-sm">
                        <IoTrashOutline />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                {/* Edit task list */}
                <div className="collapse collapse-arrow bg-base-200 mt-2">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium">
                    Edit list details
                  </div>
                  <div className="collapse-content">
                    <form action={updateTaskListAction} className="space-y-4">
                      <input type="hidden" name="id" value={taskList.id} />
                      <TaskListFields taskList={taskList} />
                      <SubmitButton className="btn btn-primary btn-sm">
                        Save changes
                      </SubmitButton>
                    </form>
                  </div>
                </div>

                {/* Tasks */}
                <div className="mt-2 space-y-3">
                  {taskList.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-box border border-base-300 p-4"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-3">
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <div className="text-xs text-base-content/60 mt-1 flex flex-wrap gap-2">
                            <span>{task.status.replace("-", " ")}</span>
                            <span>•</span>
                            <span>{task.priority}</span>
                            <span>•</span>
                            <span>
                              {task.assignees.length > 0
                                ? task.assignees.join(", ")
                                : "Unassigned"}
                            </span>
                            {task.storyPoints != null && (
                              <>
                                <span>•</span>
                                <span>{task.storyPoints} pts</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <form action={moveTaskUpAction}>
                            <input
                              type="hidden"
                              name="taskListId"
                              value={taskList.id}
                            />
                            <input
                              type="hidden"
                              name="taskId"
                              value={task.id}
                            />
                            <button
                              type="submit"
                              className="btn btn-ghost btn-xs btn-square"
                              title="Move up"
                            >
                              <IoArrowUp />
                            </button>
                          </form>
                          <form action={moveTaskDownAction}>
                            <input
                              type="hidden"
                              name="taskListId"
                              value={taskList.id}
                            />
                            <input
                              type="hidden"
                              name="taskId"
                              value={task.id}
                            />
                            <button
                              type="submit"
                              className="btn btn-ghost btn-xs btn-square"
                              title="Move down"
                            >
                              <IoArrowDown />
                            </button>
                          </form>
                          <form action={deleteTaskAction}>
                            <input
                              type="hidden"
                              name="taskListId"
                              value={taskList.id}
                            />
                            <input
                              type="hidden"
                              name="taskId"
                              value={task.id}
                            />
                            <button
                              type="submit"
                              className="btn btn-error btn-sm btn-soft"
                            >
                              <IoTrashOutline />
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>

                      <div className="collapse collapse-arrow bg-base-200 mt-3">
                        <input type="checkbox" />
                        <div className="collapse-title text-sm font-medium">
                          Edit task
                        </div>
                        <div className="collapse-content">
                          <form action={updateTaskAction} className="space-y-4">
                            <input
                              type="hidden"
                              name="taskListId"
                              value={taskList.id}
                            />
                            <input
                              type="hidden"
                              name="taskId"
                              value={task.id}
                            />
                            <TaskFields task={task} team={teamNames} />
                            <SubmitButton className="btn btn-primary btn-sm">
                              Save task
                            </SubmitButton>
                          </form>

                          <div className="divider my-4" />
                          <TaskChecklistNotes task={task} canEdit />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add task */}
                <div className="collapse collapse-arrow bg-base-200 mt-2">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium text-success flex items-center gap-2">
                    <IoAdd />
                    Add task to this list
                  </div>
                  <div className="collapse-content">
                    <form action={createTaskAction} className="space-y-4">
                      <input
                        type="hidden"
                        name="taskListId"
                        value={taskList.id}
                      />
                      <TaskFields team={teamNames} />
                      <SubmitButton className="btn btn-primary btn-sm">
                        Add task
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Archived task lists */}
        {data.archivedTaskLists.length > 0 && (
          <div className="collapse collapse-arrow bg-base-100 shadow-sm mt-6">
            <input type="checkbox" />
            <div className="collapse-title font-semibold text-base-content/60">
              Archived ({data.archivedTaskLists.length})
            </div>
            <div className="collapse-content space-y-4">
              {data.archivedTaskLists.map((taskList) => (
                <div
                  key={taskList.id}
                  className="rounded-box border border-base-300 p-4 opacity-70"
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <h2 className="font-bold text-lg">{taskList.name}</h2>
                      {taskList.description && (
                        <p className="text-base-content/60 text-sm mt-1">
                          {taskList.description}
                        </p>
                      )}
                      {taskList.sprint && (
                        <span className="badge badge-neutral mt-2">
                          {taskList.sprint}
                        </span>
                      )}
                      <p className="text-xs text-base-content/40 mt-2">
                        Archived{" "}
                        {taskList.archivedAt
                          ? new Date(taskList.archivedAt).toLocaleDateString()
                          : ""}{" "}
                        · {taskList.tasks.length} task
                        {taskList.tasks.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={unarchiveTaskListAction}>
                        <input type="hidden" name="id" value={taskList.id} />
                        <SubmitButton className="btn btn-ghost btn-sm">
                          <IoArrowUndoOutline />
                          Unarchive
                        </SubmitButton>
                      </form>
                      <form action={deleteTaskListAction}>
                        <input type="hidden" name="id" value={taskList.id} />
                        <button
                          type="submit"
                          className="btn btn-error btn-sm btn-soft"
                        >
                          <IoTrashOutline />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
