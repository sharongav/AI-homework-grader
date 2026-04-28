export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, preferences, and security settings.
        </p>
      </div>

      {/* Profile section */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              className="mt-1 w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="your.email@university.edu"
              disabled
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Email cannot be changed. Contact your administrator.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium">Language</label>
            <select className="mt-1 w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm">
              <option value="en">English</option>
              <option value="he">עברית (Hebrew)</option>
              <option value="ar">العربية (Arabic)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security section */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Security</h2>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
              Set Up 2FA
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Minimum 12 characters required.
              </p>
            </div>
            <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Save Changes
        </button>
      </div>
    </div>
  );
}
