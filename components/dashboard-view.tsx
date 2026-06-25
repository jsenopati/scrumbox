"use client"

import { useState } from "react"
import { calculateProgress, calculateStoryPoints } from "@/lib/metrics"
import type { ProjectData } from "@/lib/data"

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
const priorityLabel: Record<string, string> = {
  asap: "ASAP",
  high: "High",
  medium: "Med",
  low: "Low",
  backlog: "Backlog",
}

interface Props {
  data: ProjectData
  anyStoryPoints: boolean
  allStoryPoints: { total: number; completed: number }
  storyPointPct: number
  overallProgress: number
  completedTasks: number
  totalTasks: number
  activeTasks: number
}

export function DashboardView({
  data,
  anyStoryPoints,
  allStoryPoints,
  storyPointPct,
  overallProgress,
  completedTasks,
  totalTasks,
  activeTasks,
}: Props) {
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [simple, setSimple] = useState(true)

  return (
    <>
      {/* Stats + toggle row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="stats stats-vertical sm:stats-horizontal bg-base-100 shadow flex-1 min-w-0">
          <div className="stat">
            <div className="stat-title">Overall Progress</div>
            <div className="stat-value text-primary">{overallProgress}%</div>
            <div className="stat-desc">
              {completedTasks} of {totalTasks} tasks
            </div>
          </div>
          {anyStoryPoints && (
            <div className="stat">
              <div className="stat-title">Story Points</div>
              <div className="stat-value text-success">
                {allStoryPoints.completed}/{allStoryPoints.total}
              </div>
              <div className="stat-desc">{storyPointPct}% complete</div>
            </div>
          )}
          <div className="stat">
            <div className="stat-title">Active Tasks</div>
            <div className="stat-value text-warning">{activeTasks}</div>
            <div className="stat-desc">In progress</div>
          </div>
        </div>

        {/* View toggle */}
        <div className="join shadow bg-base-100 rounded-box h-fit self-center">
          <button
            className={`join-item btn btn-sm ${simple ? "btn-neutral" : "btn-ghost"}`}
            onClick={() => setSimple(true)}
          >
            Simple
          </button>
          <button
            className={`join-item btn btn-sm ${simple ? "btn-ghost" : "btn-neutral"}`}
            onClick={() => setSimple(false)}
          >
            Detailed
          </button>
        </div>
      </div>

      {data.taskLists.length === 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center text-base-content/60">
            No task lists yet.
          </div>
        </div>
      )}

      {simple ? <SimpleView data={data} /> : <DetailedView data={data} />}

      {data.archivedTaskLists.length > 0 && (
        <div className="mt-6">
          <button
            className="flex items-center gap-2 text-sm font-medium text-base-content/50 hover:text-base-content transition-colors mb-3"
            onClick={() => setArchiveOpen((o) => !o)}
          >
            <span
              className={`inline-block transition-transform ${
                archiveOpen ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
            Archived ({data.archivedTaskLists.length})
          </button>
          {archiveOpen && (
            <div className="space-y-4 opacity-60">
              {data.archivedTaskLists.map((taskList) => {
                const progress = calculateProgress(taskList.tasks)
                return (
                  <div key={taskList.id} className="card bg-base-100 shadow-md">
                    <div className="card-body p-4 gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-bold text-lg">{taskList.name}</h2>
                          {taskList.sprint && (
                            <span className="badge badge-neutral badge-sm">
                              {taskList.sprint}
                            </span>
                          )}
                          <span className="badge badge-ghost badge-sm">Archived</span>
                        </div>
                        <span className="text-sm text-base-content/50">
                          {taskList.tasks.length} task
                          {taskList.tasks.length !== 1 ? "s" : ""} · {progress}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary w-full h-1.5"
                        value={progress}
                        max={100}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <h2 className="text-base font-semibold text-base-content">{title}</h2>
      {subtitle && (
        <span className="text-xs text-base-content/50">{subtitle}</span>
      )}
      <div className="flex-1 border-t border-base-300 ml-1" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Simple view
// ---------------------------------------------------------------------------

function SimpleView({ data }: { data: ProjectData }) {
  const focus = data.taskLists.filter((tl) => tl.section === "focus")
  const upnext = data.taskLists.filter((tl) => tl.section === "upnext")
  const concurrent = data.taskLists.filter((tl) => tl.section === "concurrent")
  const backlog = data.taskLists.filter((tl) => tl.section === "backlog")

  return (
    <div className="space-y-8">
      {focus.length > 0 && (
        <div>
          <SectionHeader title="Currently working on" />
          <div className="space-y-4">
            {focus.map((taskList) => (
              <SimpleTaskListCard key={taskList.id} taskList={taskList} />
            ))}
          </div>
        </div>
      )}
      {upnext.length > 0 && (
        <div>
          <SectionHeader title="Up next" />
          <div className="space-y-4">
            {upnext.map((taskList) => (
              <SimpleTaskListCard key={taskList.id} taskList={taskList} />
            ))}
          </div>
        </div>
      )}
      {concurrent.length > 0 && (
        <div>
          <SectionHeader title="Concurrent Tasks" subtitle="dynamic priority" />
          <div className="space-y-4">
            {concurrent.map((taskList) => (
              <SimpleTaskListCard key={taskList.id} taskList={taskList} />
            ))}
          </div>
        </div>
      )}
      {backlog.length > 0 && (
        <div>
          <SectionHeader title="Backlog" />
          <div className="space-y-4 opacity-80">
            {backlog.map((taskList) => (
              <SimpleTaskListCard key={taskList.id} taskList={taskList} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SimpleTaskListCard({
  taskList,
}: {
  taskList: ProjectData["taskLists"][number]
}) {
  const progress = calculateProgress(taskList.tasks)
  const notStarted = taskList.tasks.filter(
    (t) => t.status === "not-started",
  ).length
  const inProgress = taskList.tasks.filter(
    (t) => t.status === "in-progress",
  ).length
  const completed = taskList.tasks.filter(
    (t) => t.status === "completed",
  ).length

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-4 gap-3">
        {/* List header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg">{taskList.name}</h3>
            {taskList.sprint && (
              <span className="badge badge-primary badge-sm">
                {taskList.sprint}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-base-content/60">
            <span className="text-success">{completed} done</span>
            <span className="text-warning">{inProgress} active</span>
            <span>{notStarted} pending</span>
            <span className="font-semibold text-base-content">{progress}%</span>
          </div>
        </div>

        <progress
          className="progress progress-primary w-full h-1.5"
          value={progress}
          max={100}
        />

        {/* Task grid */}
        {taskList.tasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
            {taskList.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-2 rounded-btn border border-base-300 px-3 py-2 bg-base-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.assignees.length > 0 && (
                    <p className="text-xs text-base-content/50 truncate">
                      {task.assignees.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`badge badge-xs ${priorityBadge[task.priority]}`}
                  >
                    {priorityLabel[task.priority]}
                  </span>
                  <span
                    className={`badge badge-xs ${statusBadge[task.status]}`}
                  >
                    {task.status === "not-started"
                      ? "Pending"
                      : task.status === "in-progress"
                        ? "Active"
                        : "Done"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Detailed view
// ---------------------------------------------------------------------------

function DetailedView({ data }: { data: ProjectData }) {
  const focus = data.taskLists.filter((tl) => tl.section === "focus")
  const upnext = data.taskLists.filter((tl) => tl.section === "upnext")
  const concurrent = data.taskLists.filter((tl) => tl.section === "concurrent")
  const backlog = data.taskLists.filter((tl) => tl.section === "backlog")

  return (
    <div className="space-y-10">
      {focus.length > 0 && (
        <div>
          <SectionHeader title="Currently working on" />
          <div className="space-y-6">
            {focus.map((taskList) => (
              <DetailedTaskListCard key={taskList.id} taskList={taskList} />
            ))}
          </div>
        </div>
      )}
      {upnext.length > 0 && (
        <div>
          <SectionHeader title="Up next" />
          <div className="space-y-6">
            {upnext.map((taskList) => (
              <DetailedTaskListCard key={taskList.id} taskList={taskList} />
            ))}
          </div>
        </div>
      )}
      {concurrent.length > 0 && (
        <div>
          <SectionHeader title="Concurrent Tasks" subtitle="dynamic priority" />
          <div className="space-y-6">
            {concurrent.map((taskList) => (
              <DetailedTaskListCard key={taskList.id} taskList={taskList} />
            ))}
          </div>
        </div>
      )}
      {backlog.length > 0 && (
        <div>
          <SectionHeader title="Backlog" />
          <div className="space-y-6 opacity-80">
            {backlog.map((taskList) => (
              <DetailedTaskListCard key={taskList.id} taskList={taskList} />
            ))}
          </div>
        </div>
      )}

      {/* Team Section */}
      {data.team.length > 0 && (
        <div className="card bg-base-100 shadow mt-8">
          <div className="card-body">
            <h2 className="card-title">Team Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.team.map((member) => {
                const memberTasks = data.taskLists.flatMap((tl) =>
                  tl.tasks.filter((t) => t.assignees.includes(member)),
                )
                const memberCompleted = memberTasks.filter(
                  (t) => t.status === "completed",
                ).length
                const memberInProgress = memberTasks.filter(
                  (t) => t.status === "in-progress",
                ).length

                return (
                  <div
                    key={member}
                    className="rounded-box border border-base-300 p-4"
                  >
                    <div className="font-semibold">{member}</div>
                    <div className="text-sm text-base-content/60 mt-2 space-y-1">
                      <div>Total tasks: {memberTasks.length}</div>
                      <div className="text-success">
                        Completed: {memberCompleted}
                      </div>
                      <div className="text-warning">
                        In progress: {memberInProgress}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailedTaskListCard({ taskList }: { taskList: ProjectData["taskLists"][number] }) {
  const progress = calculateProgress(taskList.tasks)
  const storyPoints = calculateStoryPoints(taskList.tasks)
  const listHasStoryPoints = taskList.tasks.some((t) => t.storyPoints != null)

  return (
    <div className="card bg-base-100 shadow-md overflow-hidden">
      {/* Task List Header */}
      <div className="bg-neutral text-neutral-content p-6">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
          <div>
            <h3 className="text-2xl font-bold">{taskList.name}</h3>
            <p className="opacity-80 mt-1">{taskList.description}</p>
            {taskList.sprint && (
              <span className="badge badge-primary mt-2">
                {taskList.sprint}
              </span>
            )}
          </div>
          {taskList.startDate && taskList.endDate && (
            <div className="text-sm opacity-80">
              {new Date(taskList.startDate + "T00:00:00").toLocaleDateString()}{" "}
              – {new Date(taskList.endDate + "T00:00:00").toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex justify-between text-sm mb-1">
          <span>Progress: {progress}%</span>
          {listHasStoryPoints && (
            <span>
              Story Points: {storyPoints.completed}/{storyPoints.total}
            </span>
          )}
        </div>
        <progress
          className="progress progress-primary w-full"
          value={progress}
          max={100}
        />
      </div>

      {/* Tasks */}
      <div className="card-body gap-3">
        {taskList.tasks.length === 0 && (
          <p className="text-base-content/60 text-sm">No tasks in this list.</p>
        )}
        {taskList.tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-wrap items-start justify-between gap-3 p-4 rounded-box border border-base-300 hover:bg-base-200 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h3 className="font-semibold">{task.title}</h3>
                <span
                  className={`badge badge-sm ${priorityBadge[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="text-base-content/70 text-sm mb-2">
                {task.description}
              </p>
              <div className="flex flex-wrap gap-2 items-center text-sm text-base-content/60">
                <span className="font-medium">{task.assignees.join(", ")}</span>
                {task.storyPoints != null && (
                  <>
                    <span>•</span>
                    <span>{task.storyPoints} pts</span>
                  </>
                )}
                {task.dueDate && (
                  <>
                    <span>•</span>
                    <span>
                      Due:{" "}
                      {new Date(
                        task.dueDate + "T00:00:00",
                      ).toLocaleDateString()}
                    </span>
                  </>
                )}
                {task.tags.map((tag) => (
                  <span key={tag} className="badge badge-sm badge-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className={`badge ${statusBadge[task.status]}`}>
              {task.status.replace("-", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
