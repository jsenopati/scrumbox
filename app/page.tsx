"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? "Login failed")
        setSubmitting(false)
        return
      }

      const { role } = await res.json()
      router.replace(role === "editor" ? "/manage" : "/dashboard")
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <main className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-3">📊 ScrumBox</h1>
          <p className="text-base-content/60">
            Enter your access password to continue
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <form onSubmit={handleSubmit} className="card-body">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
              />
            </fieldset>

            {error && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || password.length === 0}
              className="btn btn-primary btn-block mt-2"
            >
              {submitting && <span className="loading loading-spinner" />}
              {submitting ? "Checking…" : "Enter"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
