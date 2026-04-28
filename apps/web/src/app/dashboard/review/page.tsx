export default function ReviewQueuePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
          <p className="mt-1 text-muted-foreground">
            AI-graded submissions awaiting your review. Sorted by lowest confidence first.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="confidence_asc">Lowest confidence first</option>
            <option value="submitted_at_asc">Oldest first</option>
            <option value="submitted_at_desc">Newest first</option>
          </select>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Approve Selected
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h3 className="mb-2 text-lg font-semibold">All caught up!</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          No submissions are pending review. AI-graded submissions with low confidence
          or flagged items will appear here.
        </p>
      </div>
    </div>
  );
}
