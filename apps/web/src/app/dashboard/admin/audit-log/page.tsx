export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter by user..."
            className="rounded-md border bg-background px-3 py-2 text-sm"
          />
          <select className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All Actions</option>
            <option value="SIGN_IN">Sign In</option>
            <option value="SIGN_OUT">Sign Out</option>
            <option value="TWO_FA_CHALLENGE">2FA Challenge</option>
            <option value="PERMISSION_DENIED">Permission Denied</option>
            <option value="GRADE_APPROVED">Grade Approved</option>
            <option value="GRADE_OVERRIDDEN">Grade Overridden</option>
            <option value="GRADE_RELEASED">Grade Released</option>
            <option value="ROLE_ASSIGNED">Role Assigned</option>
            <option value="ROLE_REMOVED">Role Removed</option>
            <option value="SETTINGS_CHANGED">Settings Changed</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-6 py-3 font-medium text-muted-foreground">Timestamp</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">User</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Action</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Target</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                No audit log entries yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
