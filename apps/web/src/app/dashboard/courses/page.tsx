export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your courses, materials, and assignments.
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Create Course
        </button>
      </div>

      {/* Empty state */}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
        <div className="mb-4 text-4xl">📚</div>
        <h3 className="mb-2 text-lg font-semibold">No courses yet</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Create your first course to start uploading materials and creating assignments.
        </p>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Create Course
        </button>
      </div>
    </div>
  );
}
