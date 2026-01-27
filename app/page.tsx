"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-4xl mx-auto px-8 py-16 text-center relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            📊 ScrumBox
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Lightweight Project Tracking for Executive Reporting
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Track task lists, progress, story points, and team performance in
            one digestible view
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/dashboard"
            className="group p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-4xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              View public read-only dashboard with all project metrics, progress
              tracking, and team insights
            </p>
          </Link>

          <Link
            href="/admin"
            className="group p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">
              Admin Panel
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Password-protected access to manage tasks, update progress, and
              edit project data
            </p>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            ✨ Features
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
              Progress Tracking
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
              Story Points
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
              Team Analytics
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
              Sprint Management
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
              Secure Access
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
