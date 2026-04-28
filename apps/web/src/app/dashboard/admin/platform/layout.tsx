'use client';

import Link from 'next/link';

/**
 * Super Admin Platform Layout per Phase 11d.
 * Route guarding: requireSuperAdmin middleware 403s non-SUPER_ADMIN users.
 */

const platformNav = [
  { label: 'Overview', href: '/dashboard/admin/platform' },
  { label: 'Tenant Explorer', href: '/dashboard/admin/platform/tenants' },
  { label: 'Analytics', href: '/dashboard/admin/platform/analytics' },
  { label: 'Model Routing', href: '/dashboard/admin/platform/models' },
  { label: 'Feature Flags', href: '/dashboard/admin/platform/flags' },
  { label: 'Emergency', href: '/dashboard/admin/platform/emergency' },
  { label: 'Audit Log', href: '/dashboard/admin/platform/audit' },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b bg-destructive/5">
        <div className="px-6 py-2 text-sm font-medium text-destructive">
          Super Admin Console — All actions are logged
        </div>
      </div>
      <nav className="border-b px-6">
        <div className="flex gap-4 overflow-x-auto">
          {platformNav.map((item: any) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-foreground whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="p-6">{children}</div>
    </div>
  );
}
