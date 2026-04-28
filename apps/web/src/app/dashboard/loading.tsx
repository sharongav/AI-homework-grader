export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-accent" />
          <div className="h-4 w-32 rounded bg-accent" />
        </div>
        <div className="h-10 w-28 rounded bg-accent" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <div className="h-4 w-24 rounded bg-accent" />
            <div className="mt-3 h-8 w-16 rounded bg-accent" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="h-5 w-32 rounded bg-accent" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
            <div className="h-4 w-32 rounded bg-accent" />
            <div className="h-4 w-24 rounded bg-accent" />
            <div className="h-4 w-16 rounded bg-accent" />
            <div className="h-4 w-20 rounded bg-accent" />
          </div>
        ))}
      </div>
    </div>
  );
}
