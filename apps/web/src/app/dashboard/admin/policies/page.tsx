export default function PoliciesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">System Policies</h2>
      <p className="text-muted-foreground">
        These settings apply university-wide. Course-level settings can be lower
        but never exceed these caps.
      </p>

      <div className="max-w-2xl space-y-6">
        {/* Max resubmissions */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <label className="block font-medium">
            Max Resubmissions Per Assignment
          </label>
          <p className="mb-3 text-sm text-muted-foreground">
            The maximum number of resubmissions a professor can allow per assignment.
          </p>
          <input
            type="number"
            min={0}
            max={20}
            defaultValue={3}
            className="w-24 rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Max file size */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <label className="block font-medium">Max File Size (MB)</label>
          <p className="mb-3 text-sm text-muted-foreground">
            Maximum upload size per file for student submissions.
          </p>
          <input
            type="number"
            min={1}
            max={500}
            defaultValue={25}
            className="w-24 rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Monthly spending cap */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <label className="block font-medium">
            Per-Course Monthly Spending Cap (USD)
          </label>
          <p className="mb-3 text-sm text-muted-foreground">
            Maximum AI API spend per course per month. Set to 0 for unlimited.
          </p>
          <input
            type="number"
            min={0}
            step={10}
            defaultValue={500}
            className="w-32 rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Default locale */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <label className="block font-medium">Default Locale</label>
          <p className="mb-3 text-sm text-muted-foreground">
            Default language for new courses.
          </p>
          <select
            defaultValue="en"
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="he">עברית (Hebrew)</option>
            <option value="ar">العربية (Arabic)</option>
          </select>
        </div>

        {/* Auto-release threshold */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <label className="block font-medium">
            Default Auto-Release Confidence Threshold
          </label>
          <p className="mb-3 text-sm text-muted-foreground">
            Minimum AI confidence score (0–1) for auto-release. Assignments below
            this threshold require manual review.
          </p>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            defaultValue={0.95}
            className="w-24 rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Save Policies
          </button>
        </div>
      </div>
    </div>
  );
}
