export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-muted-foreground">
          Here is an overview of your courses and recent activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Courses" value="—" description="Enrolled courses" />
        <StatCard title="Pending Assignments" value="—" description="Due soon" />
        <StatCard title="Recent Grades" value="—" description="Released this week" />
        <StatCard title="Review Queue" value="—" description="Awaiting review" />
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            No recent activity. Submit your first assignment to get started.
          </p>
        </div>
      </div>

      {/* Upcoming assignments */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Upcoming Assignments</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            No upcoming assignments.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
