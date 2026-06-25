import { supabase } from "./supabase"

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
  sort_order: number
  created_at: string
  updated_at: string
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

function mapTaskRow(row: TaskRow): Task {
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
  const [listsResult, tasksResult] = await Promise.all([
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
  ])

  if (listsResult.error) throw new Error(listsResult.error.message)
  if (tasksResult.error) throw new Error(tasksResult.error.message)

  const listRows = (listsResult.data ?? []) as TaskListRow[]
  const taskRows = (tasksResult.data ?? []) as TaskRow[]

  const tasksByList = new Map<string, Task[]>()
  for (const row of taskRows) {
    const list = tasksByList.get(row.task_list_id) ?? []
    list.push(mapTaskRow(row))
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
  task: Omit<Task, "id" | "sortOrder" | "createdAt" | "updatedAt">,
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

// --- reorder task lists -----------------------------------------------------

export async function reorderTaskList(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const { data, error } = await supabase
    .from("task_lists")
    .select("id, sort_order")
    .is("archived_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)

  const rows = data as { id: string; sort_order: number }[]
  const idx = rows.findIndex((r) => r.id === id)
  if (idx === -1) return
  const swapIdx = direction === "up" ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= rows.length) return

  const a = rows[idx]
  const b = rows[swapIdx]

  // Swap sort_order values
  const { error: e1 } = await supabase
    .from("task_lists")
    .update({ sort_order: b.sort_order })
    .eq("id", a.id)
  if (e1) throw new Error(e1.message)
  const { error: e2 } = await supabase
    .from("task_lists")
    .update({ sort_order: a.sort_order })
    .eq("id", b.id)
  if (e2) throw new Error(e2.message)
}

// --- reorder tasks ----------------------------------------------------------

export async function reorderTask(
  taskListId: string,
  taskId: string,
  direction: "up" | "down",
): Promise<void> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, sort_order")
    .eq("task_list_id", taskListId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)

  const rows = data as { id: string; sort_order: number }[]
  const idx = rows.findIndex((r) => r.id === taskId)
  if (idx === -1) return
  const swapIdx = direction === "up" ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= rows.length) return

  const a = rows[idx]
  const b = rows[swapIdx]

  const { error: e1 } = await supabase
    .from("tasks")
    .update({ sort_order: b.sort_order })
    .eq("id", a.id)
  if (e1) throw new Error(e1.message)
  const { error: e2 } = await supabase
    .from("tasks")
    .update({ sort_order: a.sort_order })
    .eq("id", b.id)
  if (e2) throw new Error(e2.message)
}

// --- computed metrics -------------------------------------------------------

export { calculateProgress, calculateStoryPoints } from "./metrics"
