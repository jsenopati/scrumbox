import {
  getProjectData,
  calculateProgress,
  calculateStoryPoints
} from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard-header";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <DashboardHeader lastUpdated={data.lastUpdated} />

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-400">Overall Progress</div>
              <div className="text-3xl font-bold text-blue-400 mt-2">
                {overallProgress}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {completedTasks} of {totalTasks} tasks
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-400">Story Points</div>
              <div className="text-3xl font-bold text-green-400 mt-2">
                {allStoryPoints.completed}/{allStoryPoints.total}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {Math.round(
                  (allStoryPoints.completed / allStoryPoints.total) * 100
                )}
                % complete
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-400">Active Tasks</div>
              <div className="text-3xl font-bold text-yellow-400 mt-2">
                {data.taskLists.reduce(
                  (sum, tl) =>
                    sum +
                    tl.tasks.filter((t) => t.status === "in-progress").length,
                  0
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">In progress</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-400">Team Size</div>
              <div className="text-3xl font-bold text-purple-400 mt-2">
                {data.team.length}
              </div>
              <div className="text-xs text-gray-400 mt-1">Team members</div>
            </div>
          </div>
        </div>

        {/* Task Lists */}
        <div className="space-y-6">
          {data.taskLists.map((taskList) => {
            const progress = calculateProgress(taskList.tasks);
            const storyPoints = calculateStoryPoints(taskList.tasks);

            return (
              <div
                key={taskList.id}
                className="bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                {/* Task List Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{taskList.name}</h2>
                      <p className="text-blue-100 mt-1">
                        {taskList.description}
                      </p>
                      {taskList.sprint && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-400 rounded-full text-sm">
                          {taskList.sprint}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {taskList.startDate && taskList.endDate && (
                        <div className="text-sm text-blue-100">
                          {new Date(taskList.startDate).toLocaleDateString()} -{" "}
                          {new Date(taskList.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress: {progress}%</span>
                      <span>
                        Story Points: {storyPoints.completed}/
                        {storyPoints.total}
                      </span>
                    </div>
                    <div className="w-full bg-blue-400 rounded-full h-2">
                      <div
                        className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-6">
                  <div className="space-y-4">
                    {taskList.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                task.status === "completed"
                                  ? "bg-green-500"
                                  : task.status === "in-progress"
                                    ? "bg-yellow-500"
                                    : "bg-gray-300"
                              }`}
                            />
                            <h3 className="font-semibold text-white">
                              {task.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                task.priority === "high"
                                  ? "bg-red-900 text-red-200"
                                  : task.priority === "medium"
                                    ? "bg-yellow-900 text-yellow-200"
                                    : "bg-gray-700 text-gray-200"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-400">
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
                            <div className="flex gap-1 ml-2">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              task.status === "completed"
                                ? "bg-green-900 text-green-200"
                                : task.status === "in-progress"
                                  ? "bg-yellow-900 text-yellow-200"
                                  : "bg-gray-700 text-gray-200"
                            }`}
                          >
                            {task.status.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Section */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-white mb-4">Team Members</h2>
          <div className="flex flex-wrap gap-3">
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
                  className="flex-1 min-w-50 p-4 border border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="font-semibold text-white">{member}</div>
                  <div className="text-sm text-gray-400 mt-2">
                    <div>Total tasks: {memberTasks.length}</div>
                    <div className="text-green-400">
                      Completed: {memberCompleted}
                    </div>
                    <div className="text-yellow-400">
                      In progress: {memberInProgress}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
