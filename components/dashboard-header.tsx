import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardHeaderProps {
  lastUpdated: string
}

export function DashboardHeader({ lastUpdated }: DashboardHeaderProps) {
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
        <LogoutButton />
      </div>
    </div>
  )
}
