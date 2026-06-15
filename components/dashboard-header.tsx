import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Role } from "@/lib/session"

interface DashboardHeaderProps {
  lastUpdated: string
  role: Role
}

export function DashboardHeader({ lastUpdated, role }: DashboardHeaderProps) {
  return (
    <div className="navbar bg-base-100 rounded-box shadow-sm mb-6 px-4">
      <div className="navbar-start">
        <div>
          <h1 className="text-xl font-bold">Project Dashboard</h1>
          <p className="text-xs text-base-content/60">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="navbar-end gap-2">
        <ThemeToggle />
        {role === "editor" && (
          <Link href="/manage" className="btn btn-primary btn-sm">
            Manage
          </Link>
        )}
        <LogoutButton />
      </div>
    </div>
  )
}
