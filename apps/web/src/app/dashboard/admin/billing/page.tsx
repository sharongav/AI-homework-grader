export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
      <p className="text-muted-foreground">
        AI API usage costs across all schools and courses.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">This Month</p>
          <p className="mt-2 text-3xl font-bold">$—</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Last Month</p>
          <p className="mt-2 text-3xl font-bold">$—</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
          <p className="mt-2 text-3xl font-bold">$—</p>
        </div>
      </div>

      {/* Per-course breakdown */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">Per-Course Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-6 py-3 font-medium text-muted-foreground">Course</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">School</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Grading Calls</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Embedding Calls</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Total Cost</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Cap</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                No billing data yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
