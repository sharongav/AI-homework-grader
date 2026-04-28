export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search users..."
            className="rounded-md border bg-background px-3 py-2 text-sm"
          />
          <select className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="GRADER">Grader</option>
            <option value="TEACHING_ASSISTANT">TA</option>
            <option value="PROFESSOR">Professor</option>
            <option value="HEAD_OF_COURSE">Head of Course</option>
            <option value="SCHOOL_MANAGER">School Manager</option>
            <option value="UNIVERSITY_ADMIN">University Admin</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-6 py-3 font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Email</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Roles</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">2FA</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                No users found. Users will appear after the database is seeded.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
