import type { Task } from "./data"

export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter((t) => t.status === "completed").length
  return Math.round((completed / tasks.length) * 100)
}

export function calculateStoryPoints(tasks: Task[]): {
  total: number
  completed: number
} {
  const total = tasks.reduce((sum, task) => sum + (task.storyPoints ?? 0), 0)
  const completed = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, task) => sum + (task.storyPoints ?? 0), 0)
  return { total, completed }
}
