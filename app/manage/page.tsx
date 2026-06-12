import { getProjectData, type Task, type TaskList } from "@/lib/data";
import { requireRole } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import {
  createTaskListAction,
  updateTaskListAction,
  deleteTaskListAction,
  createTaskAction,
  updateTaskAction,
  deleteTaskAction
} from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full px-3 py-2 rounded-md border border-gray-600 bg-gray-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";
const primaryBtn =
  "px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors";
const dangerBtn =
  "px-3 py-2 rounded-md bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors";

function TaskListFields({ taskList }: { taskList?: TaskList }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className={labelClass}>Name</label>
        <input
          name="name"
          required
          defaultValue={taskList?.name}
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Description</label>
        <input
          name="description"
          defaultValue={taskList?.description}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Sprint</label>
        <input
          name="sprint"
          defaultValue={taskList?.sprint}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start date</label>
          <input
            name="startDate"
            type="date"
            defaultValue={taskList?.startDate}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input
            name="endDate"
            type="date"
            defaultValue={taskList?.endDate}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

function TaskFields({ task }: { task?: Task }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className={labelClass}>Title</label>
        <input
          name="title"
          required
          defaultValue={task?.title}
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Description</label>
        <input
          name="description"
          defaultValue={task?.description}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Assignee</label>
        <input
          name="assignee"
          defaultValue={task?.assignee}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Story points</label>
        <input
          name="storyPoints"
          type="number"
          min="0"
          defaultValue={task?.storyPoints ?? 0}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          name="status"
          defaultValue={task?.status ?? "not-started"}
          className={inputClass}
        >
          <option value="not-started">Not started</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Priority</label>
        <select
          name="priority"
          defaultValue={task?.priority ?? "medium"}
          className={inputClass}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Due date</label>
        <input
          name="dueDate"
          type="date"
          defaultValue={task?.dueDate}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Tags (comma separated)</label>
        <input
          name="tags"
          defaultValue={task?.tags.join(", ")}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default async function ManagePage() {
  await requireRole("editor");
  const data = await getProjectData();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Manage Tasks</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              View Dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Add task list */}
        <details className="mb-8 bg-gray-800 rounded-lg p-5">
          <summary className="cursor-pointer font-semibold text-white">
            + New task list
          </summary>
          <form action={createTaskListAction} className="mt-4 space-y-4">
            <TaskListFields />
            <button type="submit" className={primaryBtn}>
              Create task list
            </button>
          </form>
        </details>

        {data.taskLists.length === 0 && (
          <p className="text-gray-400">
            No task lists yet. Create one to get started.
          </p>
        )}

        <div className="space-y-6">
          {data.taskLists.map((taskList) => (
            <div key={taskList.id} className="bg-gray-800 rounded-lg p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {taskList.name}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {taskList.description}
                  </p>
                  {taskList.sprint && (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-700 rounded text-xs text-gray-200">
                      {taskList.sprint}
                    </span>
                  )}
                </div>
                <form action={deleteTaskListAction}>
                  <input type="hidden" name="id" value={taskList.id} />
                  <button type="submit" className={dangerBtn}>
                    Delete list
                  </button>
                </form>
              </div>

              {/* Edit task list */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-blue-400">
                  Edit list details
                </summary>
                <form action={updateTaskListAction} className="mt-3 space-y-4">
                  <input type="hidden" name="id" value={taskList.id} />
                  <TaskListFields taskList={taskList} />
                  <button type="submit" className={primaryBtn}>
                    Save changes
                  </button>
                </form>
              </details>

              {/* Tasks */}
              <div className="mt-5 space-y-3">
                {taskList.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-700 rounded-md p-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-white">
                          {task.title}
                        </h3>
                        <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                          <span>{task.status.replace("-", " ")}</span>
                          <span>•</span>
                          <span>{task.priority}</span>
                          <span>•</span>
                          <span>{task.assignee || "Unassigned"}</span>
                          <span>•</span>
                          <span>{task.storyPoints} pts</span>
                        </div>
                      </div>
                      <form action={deleteTaskAction}>
                        <input
                          type="hidden"
                          name="taskListId"
                          value={taskList.id}
                        />
                        <input type="hidden" name="taskId" value={task.id} />
                        <button type="submit" className={dangerBtn}>
                          Delete
                        </button>
                      </form>
                    </div>

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-400">
                        Edit task
                      </summary>
                      <form
                        action={updateTaskAction}
                        className="mt-3 space-y-4"
                      >
                        <input
                          type="hidden"
                          name="taskListId"
                          value={taskList.id}
                        />
                        <input type="hidden" name="taskId" value={task.id} />
                        <TaskFields task={task} />
                        <button type="submit" className={primaryBtn}>
                          Save task
                        </button>
                      </form>
                    </details>
                  </div>
                ))}
              </div>

              {/* Add task */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-green-400">
                  + Add task to this list
                </summary>
                <form action={createTaskAction} className="mt-3 space-y-4">
                  <input type="hidden" name="taskListId" value={taskList.id} />
                  <TaskFields />
                  <button type="submit" className={primaryBtn}>
                    Add task
                  </button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
