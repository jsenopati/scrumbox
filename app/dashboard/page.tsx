import { getProjectData, calculateStoryPoints } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardView } from "@/components/dashboard-view"
import { requireRole } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const role = await requireRole("viewer")
  const data = await getProjectData()

  const totalTasks = data.taskLists.reduce(
    (sum, tl) => sum + tl.tasks.length,
    0,
  )
  const completedTasks = data.taskLists.reduce(
    (sum, tl) => sum + tl.tasks.filter((t) => t.status === "completed").length,
    0,
  )
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const allStoryPoints = calculateStoryPoints(
    data.taskLists.flatMap((tl) => tl.tasks),
  )
  const anyStoryPoints = data.taskLists.some((tl) =>
    tl.tasks.some((t) => t.storyPoints != null),
  )
  const activeTasks = data.taskLists.reduce(
    (sum, tl) =>
      sum + tl.tasks.filter((t) => t.status === "in-progress").length,
    0,
  )
  const storyPointPct =
    allStoryPoints.total > 0
      ? Math.round((allStoryPoints.completed / allStoryPoints.total) * 100)
      : 0

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader lastUpdated={data.lastUpdated} role={role} />
        <DashboardView
          data={data}
          anyStoryPoints={anyStoryPoints}
          allStoryPoints={allStoryPoints}
          storyPointPct={storyPointPct}
          overallProgress={overallProgress}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          activeTasks={activeTasks}
        />
      </div>
    </div>
  )
}
