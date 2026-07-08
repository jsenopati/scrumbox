"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/session"
import {
  addTaskList,
  updateTaskList,
  deleteTaskList,
  archiveTaskList,
  unarchiveTaskList,
  addTask,
  updateTask,
  deleteTask,
  updateTaskNotes,
  addChecklistItem,
  setChecklistItemChecked,
  deleteChecklistItem,
  addTeamMember,
  deleteTeamMember,
  reorderTaskList,
  reorderTask,
  setTaskListOrder,
  setTaskOrder,
  type Task,
} from "@/lib/data"

function str(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function optionalStr(formData: FormData, key: string): string | undefined {
  const value = str(formData, key)
  return value.length > 0 ? value : undefined
}

function parseTags(formData: FormData): string[] {
  return str(formData, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

function parseAssignees(formData: FormData): string[] {
  return (formData.getAll("assignee") as string[]).filter((v) => v.length > 0)
}

function parseChecklistItems(formData: FormData): string[] {
  return (formData.getAll("checklistItem") as string[])
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
}

function parseStatus(formData: FormData): Task["status"] {
  const value = str(formData, "status")
  return value === "in-progress" || value === "completed"
    ? value
    : "not-started"
}

function parsePriority(formData: FormData): Task["priority"] {
  const value = str(formData, "priority")
  if (
    value === "asap" ||
    value === "high" ||
    value === "low" ||
    value === "backlog"
  )
    return value
  return "medium"
}

function parseSection(
  formData: FormData,
): "focus" | "upnext" | "concurrent" | "backlog" {
  const value = str(formData, "section")
  if (value === "upnext" || value === "concurrent" || value === "backlog")
    return value
  return "focus"
}

function parseStoryPoints(formData: FormData): number | null {
  if (formData.get("trackStoryPoints") == null) return null
  const points = Number.parseInt(str(formData, "storyPoints"), 10)
  return Number.isFinite(points) ? points : 0
}

function parseSortOrder(formData: FormData): number | undefined {
  const value = str(formData, "sortOrder")
  if (!value) return undefined
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

// --- task list actions ------------------------------------------------------

export async function createTaskListAction(formData: FormData) {
  await requireRole("editor")

  const name = str(formData, "name")
  if (!name) throw new Error("Task list name is required")

  await addTaskList({
    name,
    description: str(formData, "description"),
    sprint: optionalStr(formData, "sprint"),
    startDate: optionalStr(formData, "startDate"),
    endDate: optionalStr(formData, "endDate"),
    section: parseSection(formData),
    sortOrder: 0,
  })

  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function updateTaskListAction(formData: FormData) {
  await requireRole("editor")

  const id = str(formData, "id")
  if (!id) throw new Error("Task list id is required")

  await updateTaskList(id, {
    name: str(formData, "name"),
    description: str(formData, "description"),
    sprint: optionalStr(formData, "sprint"),
    startDate: optionalStr(formData, "startDate"),
    endDate: optionalStr(formData, "endDate"),
    section: parseSection(formData),
  })

  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function deleteTaskListAction(formData: FormData) {
  await requireRole("editor")

  const id = str(formData, "id")
  if (!id) throw new Error("Task list id is required")

  await deleteTaskList(id)

  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function archiveTaskListAction(formData: FormData) {
  await requireRole("editor")

  const id = str(formData, "id")
  if (!id) throw new Error("Task list id is required")

  await archiveTaskList(id)

  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function unarchiveTaskListAction(formData: FormData) {
  await requireRole("editor")

  const id = str(formData, "id")
  if (!id) throw new Error("Task list id is required")

  await unarchiveTaskList(id)

  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

// --- task actions -----------------------------------------------------------

export async function createTaskAction(formData: FormData) {
  await requireRole("editor")

  const taskListId = str(formData, "taskListId")
  if (!taskListId) throw new Error("Task list id is required")

  const title = str(formData, "title")
  if (!title) throw new Error("Task title is required")

  const created = await addTask(taskListId, {
    title,
    description: str(formData, "description"),
    assignees: parseAssignees(formData),
    storyPoints: parseStoryPoints(formData),
    status: parseStatus(formData),
    priority: parsePriority(formData),
    dueDate: optionalStr(formData, "dueDate"),
    tags: parseTags(formData),
  })

  const notes = str(formData, "notes")
  if (notes) await updateTaskNotes(created.id, notes)

  for (const content of parseChecklistItems(formData)) {
    await addChecklistItem(created.id, content)
  }

  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function updateTaskAction(formData: FormData) {
  await requireRole("editor")

  const taskListId = str(formData, "taskListId")
  const taskId = str(formData, "taskId")
  if (!taskListId || !taskId) {
    throw new Error("Task list id and task id are required")
  }

  await updateTask(taskListId, taskId, {
    title: str(formData, "title"),
    description: str(formData, "description"),
    assignees: parseAssignees(formData),
    storyPoints: parseStoryPoints(formData),
    status: parseStatus(formData),
    priority: parsePriority(formData),
    dueDate: optionalStr(formData, "dueDate"),
    tags: parseTags(formData),
    sortOrder: parseSortOrder(formData),
  })

  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function deleteTaskAction(formData: FormData) {
  await requireRole("editor")

  const taskListId = str(formData, "taskListId")
  const taskId = str(formData, "taskId")
  if (!taskListId || !taskId) {
    throw new Error("Task list id and task id are required")
  }

  await deleteTask(taskListId, taskId)

  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

// --- checklist + notes actions ---------------------------------------------

export async function updateTaskNotesAction(taskId: string, notes: string) {
  await requireRole("editor")
  if (!taskId) throw new Error("Task id is required")
  await updateTaskNotes(taskId, notes)
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function addChecklistItemAction(taskId: string, content: string) {
  await requireRole("editor")
  if (!taskId) throw new Error("Task id is required")
  const trimmed = content.trim()
  if (!trimmed) throw new Error("Checklist item text is required")
  await addChecklistItem(taskId, trimmed)
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function toggleChecklistItemAction(
  itemId: string,
  checked: boolean,
) {
  await requireRole("editor")
  if (!itemId) throw new Error("Checklist item id is required")
  await setChecklistItemChecked(itemId, checked)
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function deleteChecklistItemAction(itemId: string) {
  await requireRole("editor")
  if (!itemId) throw new Error("Checklist item id is required")
  await deleteChecklistItem(itemId)
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

// --- team member actions ----------------------------------------------------

export async function addTeamMemberAction(formData: FormData) {
  await requireRole("editor")

  const name = str(formData, "name")
  if (!name) throw new Error("Name is required")

  await addTeamMember(name)

  revalidatePath("/manage")
}

export async function deleteTeamMemberAction(formData: FormData) {
  await requireRole("editor")

  const id = str(formData, "id")
  if (!id) throw new Error("Team member id is required")

  await deleteTeamMember(id)

  revalidatePath("/manage")
}

// --- reorder actions --------------------------------------------------------

export async function moveTaskListUpAction(formData: FormData) {
  await requireRole("editor")
  const id = str(formData, "id")
  if (!id) throw new Error("Task list id is required")
  await reorderTaskList(id, "up")
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function moveTaskListDownAction(formData: FormData) {
  await requireRole("editor")
  const id = str(formData, "id")
  if (!id) throw new Error("Task list id is required")
  await reorderTaskList(id, "down")
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function moveTaskUpAction(formData: FormData) {
  await requireRole("editor")
  const taskListId = str(formData, "taskListId")
  const taskId = str(formData, "taskId")
  if (!taskListId || !taskId)
    throw new Error("Task list id and task id are required")
  await reorderTask(taskListId, taskId, "up")
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function moveTaskDownAction(formData: FormData) {
  await requireRole("editor")
  const taskListId = str(formData, "taskListId")
  const taskId = str(formData, "taskId")
  if (!taskListId || !taskId)
    throw new Error("Task list id and task id are required")
  await reorderTask(taskListId, taskId, "down")
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

// --- drag and drop reorder (index-based) ------------------------------------

export async function reorderTaskListsAction(orderedIds: string[]) {
  await requireRole("editor")
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return
  await setTaskListOrder(orderedIds)
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}

export async function reorderTasksAction(
  taskListId: string,
  orderedIds: string[],
) {
  await requireRole("editor")
  if (!taskListId) throw new Error("Task list id is required")
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return
  await setTaskOrder(taskListId, orderedIds)
  revalidatePath("/manage")
  revalidatePath("/dashboard")
}
