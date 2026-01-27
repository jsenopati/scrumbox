"use client";

import { AdminHeader } from "@/components/admin-header";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminHeader />

        <div className="bg-gray-800 rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-white mb-4">Task Management</h2>
          <p className="text-gray-300 mb-6">
            This is the admin panel where you can manage tasks, task lists, and
            team members.
          </p>

          <div className="space-y-4">
            <div className="p-4 border border-blue-800 bg-blue-950 rounded-lg">
              <h3 className="font-semibold text-blue-200 mb-2">
                📝 Coming Soon: Task Editor
              </h3>
              <p className="text-sm text-blue-300">
                A full-featured task editor will be added here to create,
                update, and delete tasks.
              </p>
            </div>

            <div className="p-4 border border-green-800 bg-green-950 rounded-lg">
              <h3 className="font-semibold text-green-200 mb-2">
                📊 Coming Soon: Task List Manager
              </h3>
              <p className="text-sm text-green-300">
                Manage your task lists, sprints, and project timelines.
              </p>
            </div>

            <div className="p-4 border border-purple-800 bg-purple-950 rounded-lg">
              <h3 className="font-semibold text-purple-200 mb-2">
                👥 Coming Soon: Team Management
              </h3>
              <p className="text-sm text-purple-300">
                Add or remove team members and assign tasks.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Quick Actions</h3>
            <div className="text-sm text-gray-300">
              <p className="mb-2">
                For now, you can manually edit the tasks by modifying:
              </p>
              <code className="block bg-gray-900 p-2 rounded border border-gray-600 text-xs">
                data/tasks.json
              </code>
              <p className="mt-2 text-xs">
                The dashboard will automatically reflect your changes after
                saving the file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
