'use client';

/**
 * Emergency Controls per Phase 11d.
 * Pause grading, force-fail, rollback prompt, revoke API key.
 */
export default function EmergencyControlsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-destructive">Emergency Controls</h1>
      <p className="text-muted-foreground">
        All actions are immediately effective and audit-logged.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-destructive/30 p-6">
          <h2 className="font-semibold text-destructive">Pause All Grading</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Queue drains. New submissions go to PENDING and wait.
            Resume manually when the issue is resolved.
          </p>
          <button
            className="mt-4 rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
            disabled
          >
            Pause Grading
          </button>
        </div>

        <div className="rounded-lg border border-destructive/30 p-6">
          <h2 className="font-semibold text-destructive">Force-Fail Stuck Submission</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Move a stuck submission from GRADING to FAILED with an operator note.
          </p>
          <input
            type="text"
            placeholder="Submission ID"
            className="mt-3 w-full rounded border px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Operator note (required)"
            className="mt-2 w-full rounded border px-3 py-2 text-sm"
          />
          <button
            className="mt-3 rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
            disabled
          >
            Force Fail
          </button>
        </div>

        <div className="rounded-lg border border-destructive/30 p-6">
          <h2 className="font-semibold text-destructive">Rollback Prompt Version</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Revert to the previous deployed prompt version.
          </p>
          <button
            className="mt-4 rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
            disabled
          >
            Rollback Prompt
          </button>
        </div>

        <div className="rounded-lg border border-destructive/30 p-6">
          <h2 className="font-semibold text-destructive">Revoke API Key</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Revoke a compromised API key platform-wide. All workers stop making calls
            until a new key is configured.
          </p>
          <button
            className="mt-4 rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
            disabled
          >
            Revoke Key
          </button>
        </div>
      </div>
    </div>
  );
}
