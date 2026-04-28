'use client';

/**
 * Course Billing Dashboard per Phase 11b.
 * Visible to Professor, Head of Course, School Manager, University Admin.
 * Students never see billing data — enforced at API layer with explicit deny.
 */
export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Course Billing</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Month Spend', value: '$—' },
          { label: 'Budget Remaining', value: '$—' },
          { label: 'Projected End-of-Term', value: '$—' },
          { label: 'Budget Used', value: '—%' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold mb-3">Breakdown by Kind</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>LLM Grading: $—</li>
            <li>LLM Verification: $—</li>
            <li>LLM Follow-Up Chat: $—</li>
            <li>Embeddings: $—</li>
            <li>Reranking: $—</li>
            <li>Transcription: $—</li>
            <li>Object Storage: $—</li>
          </ul>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="font-semibold mb-3">Top Cost Submissions</h2>
          <p className="text-sm text-muted-foreground">No data yet.</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="font-semibold mb-3">Breakdown by Assignment</h2>
        <p className="text-sm text-muted-foreground">No assignments with billing data.</p>
      </div>
    </div>
  );
}
