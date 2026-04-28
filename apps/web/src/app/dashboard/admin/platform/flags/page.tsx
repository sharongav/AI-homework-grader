'use client';

/**
 * Feature Flags UI per Phase 11d.
 * Toggle features per tenant, per school, or globally.
 * Hard Rules are never behind a flag.
 */
export default function FeatureFlagsPage() {
  const flags = [
    { key: 'autoRelease', label: 'Auto-Release Grades', scope: 'global', enabled: false },
    { key: 'followUpChat', label: 'Student Follow-Up Chat', scope: 'global', enabled: true },
    { key: 'rubricSuggestion', label: 'AI Rubric Suggestions', scope: 'global', enabled: true },
    { key: 'plagiarismCheck', label: 'Plagiarism Similarity', scope: 'global', enabled: false },
    { key: 'webSimilarity', label: 'Web Search Similarity', scope: 'global', enabled: false },
    { key: 'analyticsExport', label: 'Analytics PDF/CSV Export', scope: 'global', enabled: true },
    { key: 'ltiIntegration', label: 'LTI 1.3 Integration', scope: 'global', enabled: false },
    { key: 'calendarFeed', label: 'ICS Calendar Feed', scope: 'global', enabled: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feature Flags</h1>
      <p className="text-muted-foreground">
        Flags control UI visibility and pipeline enablement. Hard Rules are never behind a flag.
      </p>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Feature</th>
              <th className="text-left p-3 font-medium">Scope</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag: any) => (
              <tr key={flag.key} className="border-b">
                <td className="p-3">{flag.label}</td>
                <td className="p-3 text-muted-foreground">{flag.scope}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      flag.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-primary hover:underline text-xs" disabled>
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
