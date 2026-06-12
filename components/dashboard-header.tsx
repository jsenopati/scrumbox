import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import type { Role } from "@/lib/session";

interface DashboardHeaderProps {
  lastUpdated: string;
  role: Role;
}

export function DashboardHeader({ lastUpdated, role }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Project Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {role === "editor" && (
          <Link
            href="/manage"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage
          </Link>
        )}
        <LogoutButton />
      </div>
    </div>
  );
}
