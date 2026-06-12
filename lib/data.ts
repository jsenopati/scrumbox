import { supabase } from "./supabase";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  storyPoints: number;
  status: "not-started" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  sprint?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectData {
  taskLists: TaskList[];
  team: string[];
  lastUpdated: string;
}

// --- row <-> domain mappers -------------------------------------------------

interface TaskRow {
  id: string;
  task_list_id: string;
  title: string;
  description: string;
  assignee: string;
  story_points: number;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface TaskListRow {
  id: string;
  name: string;
  description: string;
  sprint: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assignee: row.assignee,
    storyPoints: row.story_points,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// --- reads ------------------------------------------------------------------

export async function getProjectData(): Promise<ProjectData> {
  const [listsResult, tasksResult] = await Promise.all([
    supabase
      .from("task_lists")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase.from("tasks").select("*").order("created_at", { ascending: true })
  ]);

  if (listsResult.error) throw new Error(listsResult.error.message);
  if (tasksResult.error) throw new Error(tasksResult.error.message);

  const listRows = (listsResult.data ?? []) as TaskListRow[];
  const taskRows = (tasksResult.data ?? []) as TaskRow[];

  const tasksByList = new Map<string, Task[]>();
  for (const row of taskRows) {
    const list = tasksByList.get(row.task_list_id) ?? [];
    list.push(mapTaskRow(row));
    tasksByList.set(row.task_list_id, list);
  }

  const taskLists: TaskList[] = listRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    sprint: row.sprint ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    tasks: tasksByList.get(row.id) ?? []
  }));

  const team = Array.from(
    new Set(
      taskRows
        .map((row) => row.assignee)
        .filter((assignee) => assignee.trim().length > 0)
    )
  ).sort();

  const lastUpdated = taskRows.reduce<string>((latest, row) => {
    return row.updated_at > latest ? row.updated_at : latest;
  }, "");

  return {
    taskLists,
    team,
    lastUpdated: lastUpdated || new Date().toISOString()
  };
}

// --- task list writes -------------------------------------------------------

export async function addTaskList(
  taskList: Omit<TaskList, "id" | "tasks">
): Promise<TaskList> {
  const { data, error } = await supabase
    .from("task_lists")
    .insert({
      name: taskList.name,
      description: taskList.description,
      sprint: taskList.sprint ?? null,
      start_date: taskList.startDate ?? null,
      end_date: taskList.endDate ?? null
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const row = data as TaskListRow;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sprint: row.sprint ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    tasks: []
  };
}

export async function updateTaskList(
  id: string,
  updates: Partial<Omit<TaskList, "id" | "tasks">>
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.description !== undefined)
    patch.description = updates.description;
  if (updates.sprint !== undefined) patch.sprint = updates.sprint ?? null;
  if (updates.startDate !== undefined)
    patch.start_date = updates.startDate ?? null;
  if (updates.endDate !== undefined) patch.end_date = updates.endDate ?? null;

  const { error } = await supabase
    .from("task_lists")
    .update(patch)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteTaskList(id: string): Promise<void> {
  const { error } = await supabase.from("task_lists").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- task writes ------------------------------------------------------------

export async function addTask(
  taskListId: string,
  task: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      task_list_id: taskListId,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      story_points: task.storyPoints,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate ?? null,
      tags: task.tags
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapTaskRow(data as TaskRow);
}

export async function updateTask(
  taskListId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.description !== undefined)
    patch.description = updates.description;
  if (updates.assignee !== undefined) patch.assignee = updates.assignee;
  if (updates.storyPoints !== undefined)
    patch.story_points = updates.storyPoints;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.priority !== undefined) patch.priority = updates.priority;
  if (updates.dueDate !== undefined) patch.due_date = updates.dueDate ?? null;
  if (updates.tags !== undefined) patch.tags = updates.tags;

  const { error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .eq("task_list_id", taskListId);

  if (error) throw new Error(error.message);
}

export async function deleteTask(
  taskListId: string,
  taskId: string
): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("task_list_id", taskListId);

  if (error) throw new Error(error.message);
}

// --- computed metrics -------------------------------------------------------

export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}

export function calculateStoryPoints(tasks: Task[]): {
  total: number;
  completed: number;
} {
  const total = tasks.reduce((sum, task) => sum + task.storyPoints, 0);
  const completed = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, task) => sum + task.storyPoints, 0);
  return { total, completed };
}
