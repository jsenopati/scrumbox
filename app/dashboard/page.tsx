import {
  getProjectData,
  calculateProgress,
  calculateStoryPoints
} from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard-header";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const role = await requireRole("viewer");
  const data = await getProjectData();

  const totalTasks = data.taskLists.reduce(
    (sum, tl) => sum + tl.tasks.length,
    0
  );
  const completedTasks = data.taskLists.reduce(
    (sum, tl) => sum + tl.tasks.filter((t) => t.status === "completed").length,
    0
  );
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const allStoryPoints = calculateStoryPoints(
    data.taskLists.flatMap((tl) => tl.tasks)
  );

  const activeTasks = data.taskLists.reduce(
    (sum, tl) =>
      sum + tl.tasks.filter((t) => t.status === "in-progress").length,
    0
  );
  const storyPointPct =
    allStoryPoints.total > 0
      ? Math.round((allStoryPoints.completed / allStoryPoints.total) * 100)
      : 0;

  const statusBadge: Record<string, string> = {
    completed: "badge-success",
    "in-progress": "badge-warning",
    "not-started": "badge-ghost"
  };
  const priorityBadge: Record<string, string> = {
    high: "badge-error",
    medium: "badge-warning",
    low: "badge-ghost"
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader lastUpdated={data.lastUpdated} role={role} />

        {/* Overall Stats */}
        <div className="stats stats-vertical sm:stats-horizontal w-full bg-base-100 shadow mb-6">
          <div className="stat">
            <div className="stat-title">Overall Progress</div>
            <div className="stat-value text-primary">{overallProgress}%</div>
            <div className="stat-desc">
              {completedTasks} of {totalTasks} tasks
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Story Points</div>
            <div className="stat-value text-success">
              {allStoryPoints.completed}/{allStoryPoints.total}
            </div>
            <div className="stat-desc">{storyPointPct}% complete</div>
          </div>
          <div className="stat">
            <div className="stat-title">Active Tasks</div>
            <div className="stat-value text-warning">{activeTasks}</div>
            <div className="stat-desc">In progress</div>
          </div>
          <div className="stat">
            <div className="stat-title">Team Size</div>
            <div className="stat-value">{data.team.length}</div>
            <div className="stat-desc">Team members</div>
          </div>
        </div>

        {data.taskLists.length === 0 && (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center text-base-content/60">
              No task lists yet.
            </div>
          </div>
        )}

        {/* Task Lists */}
        <div className="space-y-6">
          {data.taskLists.map((taskList) => {
            const progress = calculateProgress(taskList.tasks);
            const storyPoints = calculateStoryPoints(taskList.tasks);

            return (
              <div
                key={taskList.id}
                className="card bg-base-100 shadow-md overflow-hidden"
              >
                {/* Task List Header */}
                <div className="bg-neutral text-neutral-content p-6">
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{taskList.name}</h2>
                      <p className="opacity-80 mt-1">{taskList.description}</p>
                      {taskList.sprint && (
                        <span className="badge badge-primary mt-2">
                          {taskList.sprint}
                        </span>
                      )}
                    </div>
                    {taskList.startDate && taskList.endDate && (
                      <div className="text-sm opacity-80">
                        {new Date(taskList.startDate).toLocaleDateString()} –{" "}
                        {new Date(taskList.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: {progress}%</span>
                    <span>
                      Story Points: {storyPoints.completed}/{storyPoints.total}
                    </span>
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
                    <p className="text-base-content/60 text-sm">
                      No tasks in this list.
                    </p>
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
                          <span className="font-medium">{task.assignee}</span>
                          <span>•</span>
                          <span>{task.storyPoints} pts</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span>
                                Due:{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </>
                          )}
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="badge badge-sm badge-outline"
                            >
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
            );
          })}
        </div>

        {/* Team Section */}
        {data.team.length > 0 && (
          <div className="card bg-base-100 shadow mt-8">
            <div className="card-body">
              <h2 className="card-title">Team Members</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.team.map((member) => {
                  const memberTasks = data.taskLists.flatMap((tl) =>
                    tl.tasks.filter((t) => t.assignee === member)
                  );
                  const memberCompleted = memberTasks.filter(
                    (t) => t.status === "completed"
                  ).length;
                  const memberInProgress = memberTasks.filter(
                    (t) => t.status === "in-progress"
                  ).length;

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
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
