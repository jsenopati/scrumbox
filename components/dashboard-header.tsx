import Link from "next/link";

interface DashboardHeaderProps {
  lastUpdated: string;
}

export function DashboardHeader({ lastUpdated }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Project Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      </div>
      <Link
        href="/admin"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Admin Panel
      </Link>
    </div>
  );
}
