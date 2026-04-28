'use client';

/**
 * Super Admin Overview page per Phase 11d.
 */
export default function PlatformOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Universities', value: '—' },
          { label: 'Total Submissions Today', value: '—' },
          { label: 'Active Grading Jobs', value: '—' },
          { label: 'Platform Spend (MTD)', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-2 text-sm">
            <li>• Tenant Explorer — browse any university&apos;s data</li>
            <li>• Model Routing — change grading model snapshot</li>
            <li>• Feature Flags — toggle features per tenant</li>
            <li>• Emergency Controls — pause grading, force-fail, rollback</li>
          </ul>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="font-semibold mb-4">System Health</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Grading Queue: <span className="text-foreground">—</span></li>
            <li>Worker Status: <span className="text-foreground">—</span></li>
            <li>API Latency (p50): <span className="text-foreground">—</span></li>
            <li>Failure Rate: <span className="text-foreground">—</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
