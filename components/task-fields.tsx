import type { Task, TaskList } from "@/lib/data"
import { ChecklistBuilder } from "./checklist-builder"

export function TaskListFields({ taskList }: { taskList?: TaskList }) {
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
        <legend className="fieldset-legend">Section</legend>
        <select
          key={taskList?.section}
          name="section"
          defaultValue={taskList?.section ?? "focus"}
          className="select w-full"
        >
          <option value="focus">Currently working on</option>
          <option value="upnext">Up next</option>
          <option value="concurrent">Concurrent Tasks</option>
          <option value="backlog">Backlog</option>
        </select>
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
  )
}

export function TaskFields({ task, team }: { task?: Task; team: string[] }) {
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
      <fieldset className="fieldset md:col-span-2">
        <legend className="fieldset-legend">Assignees</legend>
        <select
          key={(task?.assignees ?? []).join(",")}
          name="assignee"
          multiple
          defaultValue={task?.assignees ?? []}
          className="select w-full"
          size={Math.max(
            3,
            Math.min(
              team.length +
                (task?.assignees.filter((a) => !team.includes(a)).length ?? 0),
              6,
            ),
          )}
        >
          {team.map((name) => (
            <option key={name} value={name} className="py-1 px-2">
              {name}
            </option>
          ))}
          {task?.assignees
            .filter((a) => !team.includes(a))
            .map((a) => (
              <option key={a} value={a} className="py-1 px-2">
                {a}
              </option>
            ))}
        </select>
      </fieldset>
      <fieldset className="fieldset md:col-span-2">
        <legend className="fieldset-legend">Story points</legend>
        <div className="flex items-center gap-3">
          <input
            key={String(task?.storyPoints != null)}
            type="checkbox"
            name="trackStoryPoints"
            defaultChecked={task?.storyPoints != null}
            className="toggle toggle-sm peer"
          />
          <span className="label-text">Track story points</span>
          <input
            key={task?.storyPoints}
            name="storyPoints"
            type="number"
            min="0"
            defaultValue={task?.storyPoints ?? 0}
            className="input input-sm w-24 ml-auto hidden peer-checked:block"
          />
        </div>
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Status</legend>
        <select
          key={task?.status}
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
          key={task?.priority}
          name="priority"
          defaultValue={task?.priority ?? "medium"}
          className="select w-full"
        >
          <option value="asap">DO IT ASAP!</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="backlog">Backlog</option>
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
      {!task && (
        <>
          <fieldset className="fieldset md:col-span-2">
            <legend className="fieldset-legend">Notes (optional)</legend>
            <textarea
              name="notes"
              className="textarea w-full min-h-24"
              placeholder="Add notes during or after the task…"
            />
          </fieldset>
          <div className="md:col-span-2">
            <ChecklistBuilder />
          </div>
        </>
      )}
      {task && (
        <fieldset className="fieldset md:col-span-2">
          <legend className="fieldset-legend">Step</legend>
          <input
            key={task.sortOrder}
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={task.sortOrder}
            className="input w-32"
          />
          <p className="label text-xs text-base-content/50 mt-1">
            Tasks with the same step number are shown as concurrent (no arrow
            between them) in the dashboard flow.
          </p>
        </fieldset>
      )}
    </div>
  )
}
