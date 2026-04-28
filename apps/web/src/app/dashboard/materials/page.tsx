export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Materials</h1>
          <p className="mt-1 text-muted-foreground">
            Upload and manage course materials for AI-powered grading.
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Upload Material
        </button>
      </div>

      {/* Empty state */}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
        <div className="mb-4 text-4xl">📂</div>
        <h3 className="mb-2 text-lg font-semibold">No materials uploaded</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Upload lecture notes, slides, textbook chapters, or code samples. These materials
          define the scope of what the AI uses for grading — ensuring students are only
          evaluated on what has been taught.
        </p>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Upload Material
        </button>
      </div>
    </div>
  );
}
