export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Admin sub-nav */}
      <div className="mb-6 border-b">
        <nav className="flex gap-4 overflow-x-auto">
          <AdminTab href="/dashboard/admin" label="Overview" />
          <AdminTab href="/dashboard/admin/schools" label="Schools" />
          <AdminTab href="/dashboard/admin/users" label="Users" />
          <AdminTab href="/dashboard/admin/policies" label="System Policies" />
          <AdminTab href="/dashboard/admin/billing" label="Billing" />
          <AdminTab href="/dashboard/admin/audit-log" label="Audit Log" />
        </nav>
      </div>
      {children}
    </div>
  );
}

function AdminTab({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="whitespace-nowrap border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground"
    >
      {label}
    </a>
  );
}
