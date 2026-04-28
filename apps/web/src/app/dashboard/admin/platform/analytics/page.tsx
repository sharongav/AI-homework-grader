'use client';

/**
 * Cross-tenant analytics per Phase 11d.
 */
export default function PlatformAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cross-Tenant Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Submissions/Day', value: '—' },
          { label: 'Model Calls (MTD)', value: '—' },
          { label: 'Total Cost (MTD)', value: '—' },
          { label: 'Latency p50', value: '—' },
          { label: 'Latency p95', value: '—' },
          { label: 'Latency p99', value: '—' },
          { label: 'Failure Rate', value: '—' },
          { label: 'Chat Volume', value: '—' },
          { label: 'Rubric Accept Rate', value: '—' },
        ].map((stat: any) => (
          <div key={stat.label} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold mb-3">Top 10 Courses by Spend</h2>
          <p className="text-sm text-muted-foreground">Connect database to load data.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold mb-3">Top 10 Universities by Spend</h2>
          <p className="text-sm text-muted-foreground">Connect database to load data.</p>
        </div>
      </div>
    </div>
  );
}
