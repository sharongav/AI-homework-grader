'use client';

/**
 * Super Admin Audit Log Viewer per Phase 11d.
 * Full-text search with meta-audit (access to this page is itself logged).
 */
export default function PlatformAuditLogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Audit Log</h1>
      <p className="text-sm text-muted-foreground">
        Full-text search across every tenant. Your access to this viewer is logged (meta-audit).
      </p>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search audit log..."
          className="flex-1 min-w-[200px] rounded border px-3 py-2 text-sm"
        />
        <select className="rounded border px-3 py-2 text-sm">
          <option value="">All Actions</option>
          <option value="SIGN_IN">Sign In</option>
          <option value="GRADE_OVERRIDE">Grade Override</option>
          <option value="GRADE_RELEASE">Grade Release</option>
          <option value="ROLE_ASSIGN">Role Assignment</option>
          <option value="SETTINGS_CHANGE">Settings Change</option>
          <option value="IMPERSONATION">Impersonation</option>
          <option value="EMERGENCY">Emergency Action</option>
        </select>
        <input
          type="date"
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          type="date"
          className="rounded border px-3 py-2 text-sm"
        />
        <button className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">
          Search
        </button>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Timestamp</th>
              <th className="text-left p-3 font-medium">Actor</th>
              <th className="text-left p-3 font-medium">Action</th>
              <th className="text-left p-3 font-medium">Target</th>
              <th className="text-left p-3 font-medium">Tenant</th>
              <th className="text-left p-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                Connect database to load audit entries.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
