import Link from "next/link";

export function AdminHeader() {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        View Dashboard
      </Link>
    </div>
  );
}
