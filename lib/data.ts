import fs from "fs/promises";
import path from "path";

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

const DATA_FILE_PATH = path.join(process.cwd(), "data", "tasks.json");

export async function getProjectData(): Promise<ProjectData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading project data:", error);
    // Return empty structure if file doesn't exist
    return {
      taskLists: [],
      team: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

export async function saveProjectData(data: ProjectData): Promise<void> {
  try {
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving project data:", error);
    throw new Error("Failed to save project data");
  }
}

export async function addTaskList(
  taskList: Omit<TaskList, "id">
): Promise<TaskList> {
  const data = await getProjectData();
  const newTaskList: TaskList = {
    ...taskList,
    id: `tl-${Date.now()}`
  };
  data.taskLists.push(newTaskList);
  await saveProjectData(data);
  return newTaskList;
}

export async function updateTaskList(
  id: string,
  updates: Partial<TaskList>
): Promise<void> {
  const data = await getProjectData();
  const index = data.taskLists.findIndex((tl) => tl.id === id);
  if (index === -1) throw new Error("Task list not found");

  data.taskLists[index] = { ...data.taskLists[index], ...updates };
  await saveProjectData(data);
}

export async function deleteTaskList(id: string): Promise<void> {
  const data = await getProjectData();
  data.taskLists = data.taskLists.filter((tl) => tl.id !== id);
  await saveProjectData(data);
}

export async function addTask(
  taskListId: string,
  task: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<Task> {
  const data = await getProjectData();
  const taskList = data.taskLists.find((tl) => tl.id === taskListId);
  if (!taskList) throw new Error("Task list not found");

  const newTask: Task = {
    ...task,
    id: `t-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  taskList.tasks.push(newTask);
  await saveProjectData(data);
  return newTask;
}

export async function updateTask(
  taskListId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  const data = await getProjectData();
  const taskList = data.taskLists.find((tl) => tl.id === taskListId);
  if (!taskList) throw new Error("Task list not found");

  const taskIndex = taskList.tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) throw new Error("Task not found");

  taskList.tasks[taskIndex] = {
    ...taskList.tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await saveProjectData(data);
}

export async function deleteTask(
  taskListId: string,
  taskId: string
): Promise<void> {
  const data = await getProjectData();
  const taskList = data.taskLists.find((tl) => tl.id === taskListId);
  if (!taskList) throw new Error("Task list not found");

  taskList.tasks = taskList.tasks.filter((t) => t.id !== taskId);
  await saveProjectData(data);
}

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
