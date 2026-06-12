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

function TaskListFields({ taskList }: { taskList?: TaskList }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <fieldset className="fieldset md:col-span-2">
        <legend className="fieldset-legend">Name</legend>
        <input
          name="name"
          required
          defaultValue={taskList?.name}
          className="input w-full"
        />
      </fieldset>
      <fieldset className="fieldset md:col-span-2">
        <legend className="fieldset-legend">Description</legend>
        <input
          name="description"
          defaultValue={taskList?.description}
          className="input w-full"
        />
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Sprint</legend>
        <input
          name="sprint"
          defaultValue={taskList?.sprint}
          className="input w-full"
        />
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Start date</legend>
          <input
            name="startDate"
            type="date"
            defaultValue={taskList?.startDate}
            className="input w-full"
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">End date</legend>
          <input
            name="endDate"
            type="date"
            defaultValue={taskList?.endDate}
            className="input w-full"
          />
        </fieldset>
      </div>
    </div>
  );
}

function TaskFields({ task }: { task?: Task }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <fieldset className="fieldset md:col-span-2">
        <legend className="fieldset-legend">Title</legend>
        <input
          name="title"
          required
          defaultValue={task?.title}
          className="input w-full"
        />
      </fieldset>
      <fieldset className="fieldset md:col-span-2">
        <legend className="fieldset-legend">Description</legend>
        <input
          name="description"
          defaultValue={task?.description}
          className="input w-full"
        />
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Assignee</legend>
        <input
          name="assignee"
          defaultValue={task?.assignee}
          className="input w-full"
        />
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Story points</legend>
        <input
          name="storyPoints"
          type="number"
          min="0"
          defaultValue={task?.storyPoints ?? 0}
          className="input w-full"
        />
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Status</legend>
        <select
          name="status"
          defaultValue={task?.status ?? "not-started"}
          className="select w-full"
        >
          <option value="not-started">Not started</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Priority</legend>
        <select
          name="priority"
          defaultValue={task?.priority ?? "medium"}
          className="select w-full"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Due date</legend>
        <input
          name="dueDate"
          type="date"
          defaultValue={task?.dueDate}
          className="input w-full"
        />
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Tags (comma separated)</legend>
        <input
          name="tags"
          defaultValue={task?.tags.join(", ")}
          className="input w-full"
        />
      </fieldset>
    </div>
  );
}

export default async function ManagePage() {
  await requireRole("editor");
  const data = await getProjectData();

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="navbar bg-base-100 rounded-box shadow-sm mb-6 px-4">
          <div className="navbar-start">
            <h1 className="text-xl font-bold">Manage Tasks</h1>
          </div>
          <div className="navbar-end gap-2">
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              View Dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Add task list */}
        <div className="collapse collapse-arrow bg-base-100 shadow-sm mb-6">
          <input type="checkbox" />
          <div className="collapse-title font-semibold">+ New task list</div>
          <div className="collapse-content">
            <form action={createTaskListAction} className="space-y-4">
              <TaskListFields />
              <button type="submit" className="btn btn-primary">
                Create task list
              </button>
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
                    {taskList.sprint && (
                      <span className="badge badge-neutral mt-2">
                        {taskList.sprint}
                      </span>
                    )}
                  </div>
                  <form action={deleteTaskListAction}>
                    <input type="hidden" name="id" value={taskList.id} />
                    <button type="submit" className="btn btn-error btn-sm">
                      Delete list
                    </button>
                  </form>
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
                      <button type="submit" className="btn btn-primary btn-sm">
                        Save changes
                      </button>
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
                          <button
                            type="submit"
                            className="btn btn-error btn-sm btn-soft"
                          >
                            Delete
                          </button>
                        </form>
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
                            <TaskFields task={task} />
                            <button
                              type="submit"
                              className="btn btn-primary btn-sm"
                            >
                              Save task
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add task */}
                <div className="collapse collapse-arrow bg-base-200 mt-2">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium text-success">
                    + Add task to this list
                  </div>
                  <div className="collapse-content">
                    <form action={createTaskAction} className="space-y-4">
                      <input
                        type="hidden"
                        name="taskListId"
                        value={taskList.id}
                      />
                      <TaskFields />
                      <button type="submit" className="btn btn-primary btn-sm">
                        Add task
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
