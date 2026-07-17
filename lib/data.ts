import { supabase } from "./supabase"

export interface ChecklistItem {
  id: string
  content: string
  checked: boolean
  sortOrder: number
}

export interface Task {
  id: string
  title: string
  description: string
  assignees: string[]
  storyPoints: number | null
  status: "not-started" | "in-progress" | "completed"
  priority: "backlog" | "low" | "medium" | "high" | "asap"
  dueDate?: string
  tags: string[]
  notes: string
  checklist: ChecklistItem[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TaskList {
  id: string
  name: string
  description: string
  tasks: Task[]
  sprint?: string
  startDate?: string
  endDate?: string
  archivedAt?: string
  sortOrder: number
  section: "focus" | "upnext" | "concurrent" | "backlog"
}

export interface ProjectData {
  taskLists: TaskList[]
  archivedTaskLists: TaskList[]
  team: string[]
  lastUpdated: string
}

// --- row <-> domain mappers -------------------------------------------------

interface TaskRow {
  id: string
  task_list_id: string
  title: string
  description: string
  assignees: string[] | null
  story_points: number | null
  status: Task["status"]
  priority: Task["priority"]
  due_date: string | null
  tags: string[] | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

interface ChecklistItemRow {
  id: string
  task_id: string
  content: string
  checked: boolean
  sort_order: number
  created_at: string
}

interface TaskListRow {
  id: string
  name: string
  description: string
  sprint: string | null
  start_date: string | null
  end_date: string | null
  archived_at: string | null
  sort_order: number
  section: TaskList["section"]
  created_at: string
}

function mapChecklistItemRow(row: ChecklistItemRow): ChecklistItem {
  return {
    id: row.id,
    content: row.content,
    checked: row.checked,
    sortOrder: row.sort_order,
  }
}

function mapTaskRow(row: TaskRow, checklist: ChecklistItem[] = []): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assignees: row.assignees ?? [],
    storyPoints: row.story_points,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    tags: row.tags ?? [],
    notes: row.notes ?? "",
    checklist,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// --- reads ------------------------------------------------------------------

function mapTaskListRow(row: TaskListRow, tasks: Task[]): TaskList {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sprint: row.sprint ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    sortOrder: row.sort_order,
    section: row.section,
    tasks,
  }
}

export async function getProjectData(): Promise<ProjectData> {
  const [listsResult, tasksResult, checklistResult] = await Promise.all([
    supabase
      .from("task_lists")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("task_checklist_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ])

  if (listsResult.error) throw new Error(listsResult.error.message)
  if (tasksResult.error) throw new Error(tasksResult.error.message)
  if (checklistResult.error) throw new Error(checklistResult.error.message)

  const listRows = (listsResult.data ?? []) as TaskListRow[]
  const taskRows = (tasksResult.data ?? []) as TaskRow[]
  const checklistRows = (checklistResult.data ?? []) as ChecklistItemRow[]

  const checklistByTask = new Map<string, ChecklistItem[]>()
  for (const row of checklistRows) {
    const list = checklistByTask.get(row.task_id) ?? []
    list.push(mapChecklistItemRow(row))
    checklistByTask.set(row.task_id, list)
  }

  const tasksByList = new Map<string, Task[]>()
  for (const row of taskRows) {
    const list = tasksByList.get(row.task_list_id) ?? []
    list.push(mapTaskRow(row, checklistByTask.get(row.id) ?? []))
    tasksByList.set(row.task_list_id, list)
  }

  const activeRows = listRows.filter((row) => row.archived_at == null)
  const archivedRows = listRows.filter((row) => row.archived_at != null)

  const taskLists = activeRows.map((row) =>
    mapTaskListRow(row, tasksByList.get(row.id) ?? []),
  )
  const archivedTaskLists = archivedRows.map((row) =>
    mapTaskListRow(row, tasksByList.get(row.id) ?? []),
  )

  const team = Array.from(
    new Set(
      taskRows
        .flatMap((row) => row.assignees ?? [])
        .filter((name) => name.trim().length > 0),
    ),
  ).sort()

  const lastUpdated = taskRows.reduce<string>((latest, row) => {
    return row.updated_at > latest ? row.updated_at : latest
  }, "")

  return {
    taskLists,
    archivedTaskLists,
    team,
    lastUpdated: lastUpdated || new Date().toISOString(),
  }
}

// --- task list writes -------------------------------------------------------

export async function addTaskList(
  taskList: Omit<TaskList, "id" | "tasks" | "archivedAt">,
): Promise<TaskList> {
  // Place new list at the end of its section
  const { data: maxRow } = await supabase
    .from("task_lists")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()
  const nextOrder =
    ((maxRow as { sort_order: number } | null)?.sort_order ?? 0) + 10

  const { data, error } = await supabase
    .from("task_lists")
    .insert({
      name: taskList.name,
      description: taskList.description,
      sprint: taskList.sprint ?? null,
      start_date: taskList.startDate ?? null,
      end_date: taskList.endDate ?? null,
      sort_order: nextOrder,
      section: taskList.section,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  return mapTaskListRow(data as TaskListRow, [])
}

export async function archiveTaskList(id: string): Promise<void> {
  const { error } = await supabase
    .from("task_lists")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function unarchiveTaskList(id: string): Promise<void> {
  const { error } = await supabase
    .from("task_lists")
    .update({ archived_at: null })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function updateTaskList(
  id: string,
  updates: Partial<Omit<TaskList, "id" | "tasks" | "archivedAt">>,
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (updates.name !== undefined) patch.name = updates.name
  if (updates.description !== undefined) patch.description = updates.description
  if (updates.sprint !== undefined) patch.sprint = updates.sprint ?? null
  if (updates.startDate !== undefined)
    patch.start_date = updates.startDate ?? null
  if (updates.endDate !== undefined) patch.end_date = updates.endDate ?? null
  if (updates.section !== undefined) patch.section = updates.section

  const { error } = await supabase.from("task_lists").update(patch).eq("id", id)

  if (error) throw new Error(error.message)
}

export async function deleteTaskList(id: string): Promise<void> {
  const { error } = await supabase.from("task_lists").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

// --- task writes ------------------------------------------------------------

export async function addTask(
  taskListId: string,
  task: Omit<
    Task,
    "id" | "sortOrder" | "createdAt" | "updatedAt" | "notes" | "checklist"
  >,
): Promise<Task> {
  // Place new task at the end of this list
  const { data: maxRow } = await supabase
    .from("tasks")
    .select("sort_order")
    .eq("task_list_id", taskListId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()
  const nextOrder =
    ((maxRow as { sort_order: number } | null)?.sort_order ?? 0) + 10

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      task_list_id: taskListId,
      title: task.title,
      description: task.description,
      assignees: task.assignees,
      story_points: task.storyPoints,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate ?? null,
      tags: task.tags,
      sort_order: nextOrder,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return mapTaskRow(data as TaskRow)
}

export async function updateTask(
  taskListId: string,
  taskId: string,
  updates: Partial<Task>,
): Promise<void> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (updates.title !== undefined) patch.title = updates.title
  if (updates.description !== undefined) patch.description = updates.description
  if (updates.assignees !== undefined) patch.assignees = updates.assignees
  if (updates.storyPoints !== undefined)
    patch.story_points = updates.storyPoints
  if (updates.status !== undefined) patch.status = updates.status
  if (updates.priority !== undefined) patch.priority = updates.priority
  if (updates.dueDate !== undefined) patch.due_date = updates.dueDate ?? null
  if (updates.tags !== undefined) patch.tags = updates.tags
  if (updates.notes !== undefined) patch.notes = updates.notes
  if (updates.sortOrder !== undefined) patch.sort_order = updates.sortOrder

  const { error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .eq("task_list_id", taskListId)

  if (error) throw new Error(error.message)
}

export async function deleteTask(
  taskListId: string,
  taskId: string,
): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("task_list_id", taskListId)

  if (error) throw new Error(error.message)
}

// --- checklist + notes writes ----------------------------------------------

export async function updateTaskNotes(
  taskId: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", taskId)
  if (error) throw new Error(error.message)
}

export async function addChecklistItem(
  taskId: string,
  content: string,
): Promise<ChecklistItem> {
  const { data: maxRow } = await supabase
    .from("task_checklist_items")
    .select("sort_order")
    .eq("task_id", taskId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()
  const nextOrder =
    ((maxRow as { sort_order: number } | null)?.sort_order ?? 0) + 10

  const { data, error } = await supabase
    .from("task_checklist_items")
    .insert({ task_id: taskId, content, sort_order: nextOrder })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return mapChecklistItemRow(data as ChecklistItemRow)
}

export async function setChecklistItemChecked(
  itemId: string,
  checked: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("task_checklist_items")
    .update({ checked })
    .eq("id", itemId)
  if (error) throw new Error(error.message)
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("task_checklist_items")
    .delete()
    .eq("id", itemId)
  if (error) throw new Error(error.message)
}

/**
 * Rewrites sort_order for a task's checklist items from an ordered list of
 * ids. Items receive evenly spaced sort_order values in the given order.
 */
export async function setChecklistItemOrder(
  taskId: string,
  orderedIds: string[],
): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("task_checklist_items")
        .update({ sort_order: (index + 1) * 10 })
        .eq("id", id)
        .eq("task_id", taskId),
    ),
  )
  for (const { error } of results) {
    if (error) throw new Error(error.message)
  }
}

// --- team member writes -----------------------------------------------------

export interface TeamMember {
  id: string
  name: string
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as TeamMember[]
}

export async function addTeamMember(name: string): Promise<TeamMember> {
  const { data, error } = await supabase
    .from("team_members")
    .insert({ name })
    .select("id, name")
    .single()

  if (error) throw new Error(error.message)
  return data as TeamMember
}

export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase.from("team_members").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

// --- bulk reorder (index-based, for drag and drop) -------------------------

/**
 * Rewrites both section and sort_order for task lists from a flat arrangement
 * ordered across all sections. Each entry carries the section the list now
 * belongs to; sort_order is assigned sequentially in the given order.
 */
export async function setTaskListArrangement(
  arrangement: { id: string; section: TaskList["section"] }[],
): Promise<void> {
  const results = await Promise.all(
    arrangement.map((item, index) =>
      supabase
        .from("task_lists")
        .update({ sort_order: (index + 1) * 10, section: item.section })
        .eq("id", item.id),
    ),
  )
  for (const { error } of results) {
    if (error) throw new Error(error.message)
  }
}

/**
 * Rewrites sort_order for tasks within a list from an ordered list of "steps".
 * Each step is a group of task ids shown as concurrent (they share a
 * sort_order); steps flow in the given order. Tasks in the same step all
 * receive the same sort_order so `groupByStep` renders them side by side.
 */
export async function setTaskOrder(
  taskListId: string,
  steps: string[][],
): Promise<void> {
  const results = await Promise.all(
    steps.flatMap((step, index) =>
      step.map((id) =>
        supabase
          .from("tasks")
          .update({ sort_order: (index + 1) * 10 })
          .eq("id", id)
          .eq("task_list_id", taskListId),
      ),
    ),
  )
  for (const { error } of results) {
    if (error) throw new Error(error.message)
  }
}

// --- computed metrics -------------------------------------------------------

export { calculateProgress, calculateStoryPoints } from "./metrics"
