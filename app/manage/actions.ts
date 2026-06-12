"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import {
  addTaskList,
  updateTaskList,
  deleteTaskList,
  addTask,
  updateTask,
  deleteTask,
  type Task
} from "@/lib/data";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalStr(formData: FormData, key: string): string | undefined {
  const value = str(formData, key);
  return value.length > 0 ? value : undefined;
}

function parseTags(formData: FormData): string[] {
  return str(formData, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function parseStatus(formData: FormData): Task["status"] {
  const value = str(formData, "status");
  return value === "in-progress" || value === "completed"
    ? value
    : "not-started";
}

function parsePriority(formData: FormData): Task["priority"] {
  const value = str(formData, "priority");
  return value === "high" || value === "low" ? value : "medium";
}

// --- task list actions ------------------------------------------------------

export async function createTaskListAction(formData: FormData) {
  await requireRole("editor");

  const name = str(formData, "name");
  if (!name) throw new Error("Task list name is required");

  await addTaskList({
    name,
    description: str(formData, "description"),
    sprint: optionalStr(formData, "sprint"),
    startDate: optionalStr(formData, "startDate"),
    endDate: optionalStr(formData, "endDate")
  });

  revalidatePath("/manage");
  revalidatePath("/dashboard");
}

export async function updateTaskListAction(formData: FormData) {
  await requireRole("editor");

  const id = str(formData, "id");
  if (!id) throw new Error("Task list id is required");

  await updateTaskList(id, {
    name: str(formData, "name"),
    description: str(formData, "description"),
    sprint: optionalStr(formData, "sprint"),
    startDate: optionalStr(formData, "startDate"),
    endDate: optionalStr(formData, "endDate")
  });

  revalidatePath("/manage");
  revalidatePath("/dashboard");
}

export async function deleteTaskListAction(formData: FormData) {
  await requireRole("editor");

  const id = str(formData, "id");
  if (!id) throw new Error("Task list id is required");

  await deleteTaskList(id);

  revalidatePath("/manage");
  revalidatePath("/dashboard");
}

// --- task actions -----------------------------------------------------------

export async function createTaskAction(formData: FormData) {
  await requireRole("editor");

  const taskListId = str(formData, "taskListId");
  if (!taskListId) throw new Error("Task list id is required");

  const title = str(formData, "title");
  if (!title) throw new Error("Task title is required");

  const storyPoints = Number.parseInt(str(formData, "storyPoints"), 10);

  await addTask(taskListId, {
    title,
    description: str(formData, "description"),
    assignee: str(formData, "assignee"),
    storyPoints: Number.isFinite(storyPoints) ? storyPoints : 0,
    status: parseStatus(formData),
    priority: parsePriority(formData),
    dueDate: optionalStr(formData, "dueDate"),
    tags: parseTags(formData)
  });

  revalidatePath("/manage");
  revalidatePath("/dashboard");
}

export async function updateTaskAction(formData: FormData) {
  await requireRole("editor");

  const taskListId = str(formData, "taskListId");
  const taskId = str(formData, "taskId");
  if (!taskListId || !taskId) {
    throw new Error("Task list id and task id are required");
  }

  const storyPoints = Number.parseInt(str(formData, "storyPoints"), 10);

  await updateTask(taskListId, taskId, {
    title: str(formData, "title"),
    description: str(formData, "description"),
    assignee: str(formData, "assignee"),
    storyPoints: Number.isFinite(storyPoints) ? storyPoints : 0,
    status: parseStatus(formData),
    priority: parsePriority(formData),
    dueDate: optionalStr(formData, "dueDate"),
    tags: parseTags(formData)
  });

  revalidatePath("/manage");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData) {
  await requireRole("editor");

  const taskListId = str(formData, "taskListId");
  const taskId = str(formData, "taskId");
  if (!taskListId || !taskId) {
    throw new Error("Task list id and task id are required");
  }

  await deleteTask(taskListId, taskId);

  revalidatePath("/manage");
  revalidatePath("/dashboard");
}
