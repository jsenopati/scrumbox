"use client"

import { useState, useTransition } from "react"
import {
  IoArrowForward,
  IoArrowDown,
  IoChevronForward,
  IoCheckmarkDoneOutline,
  IoDocumentTextOutline,
} from "react-icons/io5"
import { calculateProgress, calculateStoryPoints } from "@/lib/metrics"
import type { ProjectData, TeamMember } from "@/lib/data"
import type { Role } from "@/lib/session"
import { reorderTaskListsAction, reorderTasksAction } from "@/lib/actions"
import { TaskDetailModal } from "./task-detail-modal"
import { ListAdminControls } from "./list-admin-controls"
import { DashboardAdminTools } from "./dashboard-admin-tools"
import { SortableGroup, SortableItem, MaybeSortableItem, MaybeTaskSortableGroup } from "./sortable"

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
  role: Role
  teamNames: string[]
  teamMembers: TeamMember[]
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
  role,
  teamNames,
  teamMembers,
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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const canEdit = role === "editor"

  // Derive the live task + its list from data so the modal reflects edits.
  let selectedTask: ProjectData["taskLists"][number]["tasks"][number] | null =
    null
  let selectedListName = ""
  let selectedListId = ""
  for (const list of data.taskLists) {
    const found = list.tasks.find((t) => t.id === selectedTaskId)
    if (found) {
      selectedTask = found
      selectedListName = list.name
      selectedListId = list.id
      break
    }
  }

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

      {canEdit && <DashboardAdminTools teamMembers={teamMembers} />}

      {data.taskLists.length === 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center text-base-content/60">
            No task lists yet.
          </div>
        </div>
      )}

      {simple ? (
        <SimpleView
          data={data}
          canEdit={canEdit}
          teamNames={teamNames}
          onSelectTask={setSelectedTaskId}
        />
      ) : (
        <DetailedView data={data} canEdit={canEdit} teamNames={teamNames} />
      )}

      {data.archivedTaskLists.length > 0 && (
        <div className="mt-6">
          <button
            className="flex items-center gap-2 text-sm font-medium text-base-content/50 hover:text-base-content transition-colors mb-3"
            onClick={() => setArchiveOpen((o) => !o)}
          >
            <IoChevronForward
              className={`transition-transform ${archiveOpen ? "rotate-90" : ""}`}
            />
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
                          <span className="badge badge-ghost badge-sm">
                            Archived
                          </span>
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

      <TaskDetailModal
        task={selectedTask}
        listName={selectedListName}
        listId={selectedListId}
        role={role}
        teamNames={teamNames}
        onClose={() => setSelectedTaskId(null)}
      />
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

// Rebuild the full global task-list ordering after reordering one section.
// Non-section lists keep their exact global slots; the section's slots are
// filled with the new intra-section order.
function reorderSectionInGlobal(
  all: ProjectData["taskLists"],
  section: ProjectData["taskLists"][number]["section"],
  newSectionOrder: string[],
): string[] {
  const queue = [...newSectionOrder]
  return all.map((tl) => (tl.section === section ? queue.shift()! : tl.id))
}


// ---------------------------------------------------------------------------
// Simple view
// ---------------------------------------------------------------------------

function SimpleView({
  data,
  canEdit,
  teamNames,
  onSelectTask,
}: {
  data: ProjectData
  canEdit: boolean
  teamNames: string[]
  onSelectTask: (taskId: string) => void
}) {
  const [, startTransition] = useTransition()
  const focus = data.taskLists.filter((tl) => tl.section === "focus")
  const upnext = data.taskLists.filter((tl) => tl.section === "upnext")
  const concurrent = data.taskLists.filter((tl) => tl.section === "concurrent")
  const backlog = data.taskLists.filter((tl) => tl.section === "backlog")

  const handleReorder = (
    section: ProjectData["taskLists"][number]["section"],
    orderedIds: string[],
  ) => {
    const global = reorderSectionInGlobal(data.taskLists, section, orderedIds)
    startTransition(async () => {
      await reorderTaskListsAction(global)
    })
  }

  return (
    <div className="space-y-8">
      <SimpleSection
        title="Currently working on"
        lists={focus}
        canEdit={canEdit}
        teamNames={teamNames}
        onReorder={handleReorder}
        onSelectTask={onSelectTask}
      />
      <SimpleSection
        title="Up next"
        lists={upnext}
        canEdit={canEdit}
        teamNames={teamNames}
        onReorder={handleReorder}
        onSelectTask={onSelectTask}
      />
      <SimpleSection
        title="Concurrent Tasks"
        subtitle="dynamic priority"
        lists={concurrent}
        canEdit={canEdit}
        teamNames={teamNames}
        onReorder={handleReorder}
        onSelectTask={onSelectTask}
      />
      <SimpleSection
        title="Backlog"
        lists={backlog}
        faded
        canEdit={canEdit}
        teamNames={teamNames}
        onReorder={handleReorder}
        onSelectTask={onSelectTask}
      />
    </div>
  )
}

function SimpleSection({
  title,
  subtitle,
  lists,
  faded,
  canEdit,
  teamNames,
  onReorder,
  onSelectTask,
}: {
  title: string
  subtitle?: string
  lists: ProjectData["taskLists"]
  faded?: boolean
  canEdit: boolean
  teamNames: string[]
  onReorder: (
    section: ProjectData["taskLists"][number]["section"],
    orderedIds: string[],
  ) => void
  onSelectTask: (taskId: string) => void
}) {
  if (lists.length === 0) return null
  const section = lists[0].section

  const cards = (
    <div className={`space-y-4 ${faded ? "opacity-80" : ""}`}>
      {lists.map((taskList) => {
        const card = (
          <SimpleTaskListCard
            taskList={taskList}
            canEdit={canEdit}
            teamNames={teamNames}
            onSelectTask={onSelectTask}
          />
        )
        return canEdit ? (
          <SortableItem key={taskList.id} id={taskList.id}>
            {card}
          </SortableItem>
        ) : (
          <div key={taskList.id}>{card}</div>
        )
      })}
    </div>
  )

  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} />
      {canEdit ? (
        <SortableGroup
          items={lists.map((l) => l.id)}
          onReorder={(orderedIds) => onReorder(section, orderedIds)}
        >
          {cards}
        </SortableGroup>
      ) : (
        cards
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Flow helpers
// ---------------------------------------------------------------------------

type FlowTask = ProjectData["taskLists"][number]["tasks"][number]

function groupByStep(tasks: FlowTask[]): FlowTask[][] {
  const map = new Map<number, FlowTask[]>()
  for (const task of tasks) {
    const group = map.get(task.sortOrder) ?? []
    group.push(task)
    map.set(task.sortOrder, group)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([, group]) => group)
}

function FlowArrow() {
  return (
    <div className="flex items-center self-center shrink-0 px-2 text-base-content/30">
      <IoArrowForward size={18} />
    </div>
  )
}

function SimpleTaskListCard({
  taskList,
  canEdit,
  teamNames,
  onSelectTask,
}: {
  taskList: ProjectData["taskLists"][number]
  canEdit: boolean
  teamNames: string[]
  onSelectTask: (taskId: string) => void
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
  const [, startTaskTransition] = useTransition()
  const handleTaskReorder = (steps: string[][]) => {
    startTaskTransition(async () => {
      await reorderTasksAction(taskList.id, steps)
    })
  }

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

        {canEdit && (
          <ListAdminControls taskList={taskList} teamNames={teamNames} />
        )}

        <progress
          className="progress progress-primary w-full h-1.5"
          value={progress}
          max={100}
        />

        {/* Task flow */}
        {taskList.tasks.length > 0 && (
          <div className="overflow-x-auto pb-2 mt-1">
            <MaybeTaskSortableGroup
              enabled={canEdit}
              steps={groupByStep(taskList.tasks).map((step) =>
                step.map((t) => t.id),
              )}
              concurrentAxis="vertical"
              onReorder={handleTaskReorder}
            >
            <div className="flex items-center gap-0 w-max">
              {groupByStep(taskList.tasks).flatMap((step, stepIdx, steps) => {
                const nodes = [
                  <div
                    key={`step-${stepIdx}`}
                    className="flex flex-col gap-1.5"
                  >
                    {step.map((task) => (
                      <MaybeSortableItem
                        key={task.id}
                        enabled={canEdit}
                        id={task.id}
                        orientation="free"
                      >
                      <button
                        type="button"
                        onClick={() => onSelectTask(task.id)}
                        className={`flex flex-col gap-1 rounded-btn border px-3 py-2 w-48 text-left cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          task.status === "completed"
                            ? "border-success/30 bg-success/5 opacity-60"
                            : task.status === "in-progress"
                              ? "border-warning/40 bg-warning/5"
                              : "border-base-300 bg-base-200"
                        }`}
                      >
                        <p className="text-sm font-medium leading-snug line-clamp-2">
                          {task.title}
                        </p>
                        {task.assignees.length > 0 && (
                          <p className="text-xs text-base-content/50 truncate">
                            {task.assignees.join(", ")}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
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
                          {task.checklist.length > 0 && (
                            <span className="badge badge-xs badge-ghost gap-0.5">
                              <IoCheckmarkDoneOutline size={11} />
                              {task.checklist.filter((i) => i.checked).length}/
                              {task.checklist.length}
                            </span>
                          )}
                          {task.notes.trim().length > 0 && (
                            <span className="badge badge-xs badge-ghost">
                              <IoDocumentTextOutline size={11} />
                            </span>
                          )}
                        </div>
                      </button>
                      </MaybeSortableItem>
                    ))}
                  </div>,
                ]
                if (stepIdx < steps.length - 1) {
                  nodes.push(<FlowArrow key={`arrow-${stepIdx}`} />)
                }
                return nodes
              })}
            </div>
            </MaybeTaskSortableGroup>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Detailed view
// ---------------------------------------------------------------------------

function DetailedView({
  data,
  canEdit,
  teamNames,
}: {
  data: ProjectData
  canEdit: boolean
  teamNames: string[]
}) {
  const [, startTransition] = useTransition()
  const focus = data.taskLists.filter((tl) => tl.section === "focus")
  const upnext = data.taskLists.filter((tl) => tl.section === "upnext")
  const concurrent = data.taskLists.filter((tl) => tl.section === "concurrent")
  const backlog = data.taskLists.filter((tl) => tl.section === "backlog")

  const handleReorder = (
    section: ProjectData["taskLists"][number]["section"],
    orderedIds: string[],
  ) => {
    const global = reorderSectionInGlobal(data.taskLists, section, orderedIds)
    startTransition(async () => {
      await reorderTaskListsAction(global)
    })
  }

  return (
    <div className="space-y-10">
      <DetailedSection
        title="Currently working on"
        lists={focus}
        canEdit={canEdit}
        teamNames={teamNames}
        onReorder={handleReorder}
      />
      <DetailedSection
        title="Up next"
        lists={upnext}
        canEdit={canEdit}
        teamNames={teamNames}
        onReorder={handleReorder}
      />
      <DetailedSection
        title="Concurrent Tasks"
        subtitle="dynamic priority"
        lists={concurrent}
        canEdit={canEdit}
        teamNames={teamNames}
        onReorder={handleReorder}
      />
      <DetailedSection
        title="Backlog"
        lists={backlog}
        faded
        canEdit={canEdit}
        teamNames={teamNames}
        onReorder={handleReorder}
      />

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

function DetailedSection({
  title,
  subtitle,
  lists,
  faded,
  canEdit,
  teamNames,
  onReorder,
}: {
  title: string
  subtitle?: string
  lists: ProjectData["taskLists"]
  faded?: boolean
  canEdit: boolean
  teamNames: string[]
  onReorder: (
    section: ProjectData["taskLists"][number]["section"],
    orderedIds: string[],
  ) => void
}) {
  if (lists.length === 0) return null
  const section = lists[0].section

  const cards = (
    <div className={`space-y-6 ${faded ? "opacity-80" : ""}`}>
      {lists.map((taskList) => {
        const card = (
          <DetailedTaskListCard
            taskList={taskList}
            canEdit={canEdit}
            teamNames={teamNames}
          />
        )
        return canEdit ? (
          <SortableItem key={taskList.id} id={taskList.id}>
            {card}
          </SortableItem>
        ) : (
          <div key={taskList.id}>{card}</div>
        )
      })}
    </div>
  )

  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} />
      {canEdit ? (
        <SortableGroup
          items={lists.map((l) => l.id)}
          onReorder={(orderedIds) => onReorder(section, orderedIds)}
        >
          {cards}
        </SortableGroup>
      ) : (
        cards
      )}
    </div>
  )
}

function DetailedTaskListCard({
  taskList,
  canEdit,
  teamNames,
}: {
  taskList: ProjectData["taskLists"][number]
  canEdit: boolean
  teamNames: string[]
}) {
  const progress = calculateProgress(taskList.tasks)
  const storyPoints = calculateStoryPoints(taskList.tasks)
  const listHasStoryPoints = taskList.tasks.some((t) => t.storyPoints != null)
  const [, startTaskTransition] = useTransition()
  const handleTaskReorder = (steps: string[][]) => {
    startTaskTransition(async () => {
      await reorderTasksAction(taskList.id, steps)
    })
  }

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
        {canEdit && (
          <div className="mt-4">
            <ListAdminControls
              taskList={taskList}
              teamNames={teamNames}
              variant="dark"
            />
          </div>
        )}
      </div>

      {/* Task flow — vertical, full-width */}
      <div className="card-body gap-0 pt-5">
        {taskList.tasks.length === 0 && (
          <p className="text-base-content/60 text-sm">No tasks in this list.</p>
        )}
        <MaybeTaskSortableGroup
          enabled={canEdit && taskList.tasks.length > 0}
          steps={groupByStep(taskList.tasks).map((step) =>
            step.map((t) => t.id),
          )}
          concurrentAxis="horizontal"
          onReorder={handleTaskReorder}
        >
        {groupByStep(taskList.tasks).map((step, stepIdx, steps) => (
          <div key={stepIdx}>
            {/* Concurrent tasks in this step sit side-by-side */}
            <div className="flex flex-wrap gap-3">
              {step.map((task) => (
                <MaybeSortableItem
                  key={task.id}
                  enabled={canEdit}
                  id={task.id}
                  orientation="free"
                  className={canEdit ? "flex-1 min-w-64" : undefined}
                >
                <div
                  className={`flex-1 min-w-64 rounded-box border p-4 transition-colors ${
                    task.status === "completed"
                      ? "border-success/30 bg-success/5 opacity-60"
                      : task.status === "in-progress"
                        ? "border-warning/40 bg-warning/5"
                        : "border-base-300"
                  }`}
                >
                  {/* Title + priority + status */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-semibold text-base">{task.title}</h3>
                      <span
                        className={`badge badge-sm ${priorityBadge[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <span
                      className={`badge shrink-0 ${statusBadge[task.status]}`}
                    >
                      {task.status.replace("-", " ")}
                    </span>
                  </div>

                  {/* Full description — no truncation */}
                  {task.description && (
                    <p className="text-base-content/70 text-sm mb-3">
                      {task.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-sm text-base-content/60">
                    {task.assignees.length > 0 && (
                      <span className="font-medium">
                        {task.assignees.join(", ")}
                      </span>
                    )}
                    {task.storyPoints != null && (
                      <span>{task.storyPoints} pts</span>
                    )}
                    {task.dueDate && (
                      <span>
                        Due:{" "}
                        {new Date(
                          task.dueDate + "T00:00:00",
                        ).toLocaleDateString()}
                      </span>
                    )}
                    {task.tags.map((tag) => (
                      <span key={tag} className="badge badge-sm badge-outline">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                </MaybeSortableItem>
              ))}
            </div>

            {/* Down-arrow between steps */}
            {stepIdx < steps.length - 1 && (
              <div className="flex justify-center py-1 text-base-content/30">
                <IoArrowDown size={16} />
              </div>
            )}
          </div>
        ))}
        </MaybeTaskSortableGroup>
      </div>
    </div>
  )
}
