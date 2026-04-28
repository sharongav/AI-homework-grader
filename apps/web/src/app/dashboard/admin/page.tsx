export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Administration</h2>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Schools</p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Monthly Spend</p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href="/dashboard/admin/schools"
          className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-muted/50"
        >
          <h3 className="font-semibold">Manage Schools</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create schools, assign School Managers.
          </p>
        </a>
        <a
          href="/dashboard/admin/users"
          className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-muted/50"
        >
          <h3 className="font-semibold">Manage Users</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            View all users, assign roles, manage access.
          </p>
        </a>
        <a
          href="/dashboard/admin/policies"
          className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-muted/50"
        >
          <h3 className="font-semibold">System Policies</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Set max resubmissions, file size limits, spending caps.
          </p>
        </a>
        <a
          href="/dashboard/admin/audit-log"
          className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-muted/50"
        >
          <h3 className="font-semibold">Audit Log</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            View all system events, sign-ins, permission changes.
          </p>
        </a>
      </div>
    </div>
  );
}
