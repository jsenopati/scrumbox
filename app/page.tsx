"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Login failed");
        setSubmitting(false);
        return;
      }

      const { role } = await res.json();
      router.replace(role === "editor" ? "/manage" : "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="w-full max-w-md mx-auto px-8 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            📊 ScrumBox
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your access password to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-left"
        >
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />

          {error && (
            <p
              className="mt-3 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || password.length === 0}
            className="mt-6 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {submitting ? "Checking…" : "Enter"}
          </button>
        </form>
      </main>
    </div>
  );
}
