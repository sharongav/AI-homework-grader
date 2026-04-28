'use client';

import { useState, use } from 'react';

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = use(params);
  const [activeTab, setActiveTab] = useState<'overview' | 'rubric' | 'prerequisites' | 'settings'>('overview');
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showDryRunModal, setShowDryRunModal] = useState(false);

  // Mock data — replace with tRPC queries
  const assignment = {
    id: assignmentId,
    title: 'Problem Set 3: Lagrangian Mechanics',
    instructions: 'Solve the following problems using the Lagrangian formulation...',
    dueAt: '2025-03-15T23:59:00Z',
    publishedAt: null as string | null,
    autoReleaseEnabled: false,
    autoReleaseConfidenceThreshold: 0.9,
    maxResubmissions: 2,
    allowedFileTypes: ['pdf', 'docx', 'txt'],
    assignmentType: 'MATH',
    availableFromWeek: 6,
    submissionCount: 0,
  };

  const rubricCriteria = [
    { id: '1', name: 'Problem Setup', weight: 20, levels: ['Exemplary', 'Proficient', 'Developing', 'Beginning'] },
    { id: '2', name: 'Mathematical Rigor', weight: 30, levels: ['Exemplary', 'Proficient', 'Developing', 'Beginning'] },
    { id: '3', name: 'Solution Correctness', weight: 35, levels: ['Exemplary', 'Proficient', 'Developing', 'Beginning'] },
    { id: '4', name: 'Presentation', weight: 15, levels: ['Exemplary', 'Proficient', 'Developing', 'Beginning'] },
  ];

  const prerequisites = [
    { id: '1', refType: 'MATERIAL' as const, refId: 'm1', title: 'Lecture 4: Lagrangian Mechanics', kind: 'PDF' },
    { id: '2', refType: 'MATERIAL' as const, refId: 'm2', title: 'Lecture 5: Constrained Systems', kind: 'PDF' },
    { id: '3', refType: 'CONCEPT' as const, refId: 'c1', title: 'Euler-Lagrange Equation', kind: null },
  ];

  // Cost preview calculation (§9.11)
  const estimatedCostPerSubmission = 0.42; // USD
  const classSize = 45;
  const totalEstimatedCost = estimatedCostPerSubmission * classSize;
  const remainingBudget = 200;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'rubric', label: 'Rubric' },
    { key: 'prerequisites', label: 'Prerequisites' },
    { key: 'settings', label: 'Settings' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{assignment.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Due: {new Date(assignment.dueAt).toLocaleString()} ·{' '}
            {assignment.publishedAt ? (
              <span className="text-green-600">Published</span>
            ) : (
              <span className="text-yellow-600">Draft</span>
            )}
            {' · '}{assignment.submissionCount} submissions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDryRunModal(true)}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
          >
            Dry-Run Grade
          </button>
          {!assignment.publishedAt && (
            <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
              Publish to Students
            </button>
          )}
        </div>
      </div>

      {/* Cost Preview (§9.11) */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Estimated Cost Preview</h3>
        <div className="mt-2 flex items-center gap-6">
          <div>
            <span className="text-lg font-semibold">${estimatedCostPerSubmission.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground"> / submission</span>
          </div>
          <div>
            <span className="text-lg font-semibold">${totalEstimatedCost.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground"> total ({classSize} students)</span>
          </div>
          <div>
            {totalEstimatedCost > remainingBudget ? (
              <span className="rounded bg-red-100 px-2 py-1 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                ⚠ Exceeds remaining budget (${remainingBudget})
              </span>
            ) : (
              <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Within budget (${remainingBudget} remaining)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
              {assignment.instructions}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Assignment Type</h3>
              <p className="mt-1 text-lg font-semibold">{assignment.assignmentType}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Allowed File Types</h3>
              <p className="mt-1 text-sm">{assignment.allowedFileTypes.join(', ')}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Available From Week</h3>
              <p className="mt-1 text-lg font-semibold">{assignment.availableFromWeek}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rubric' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rubric Criteria</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSuggestModal(true)}
                className="rounded-md border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary/10"
              >
                ✨ Suggest Criteria
              </button>
              <button className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">
                + Add Criterion
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {rubricCriteria.map((criterion) => (
              <div key={criterion.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{criterion.name}</h3>
                    <span className="rounded bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                      {criterion.weight}%
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded p-1 text-sm text-muted-foreground hover:bg-accent">Edit</button>
                    <button className="rounded p-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {criterion.levels.map((level) => (
                    <span
                      key={level}
                      className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Editing the rubric after grades have been issued creates a new version.
            Existing grades remain pinned to their original rubric version.
          </p>
        </div>
      )}

      {activeTab === 'prerequisites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Assignment Prerequisites</h2>
              <p className="text-sm text-muted-foreground">
                Materials and concepts students should already know. The grading retriever uses these to scope context.
              </p>
            </div>
            <button className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">
              + Add Prerequisite
            </button>
          </div>

          <div className="space-y-2">
            {prerequisites.map((prereq) => (
              <div
                key={prereq.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      prereq.refType === 'MATERIAL'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}
                  >
                    {prereq.refType}
                  </span>
                  <span className="text-sm font-medium">{prereq.title}</span>
                </div>
                <button className="text-sm text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
          </div>

          {prerequisites.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>No prerequisites defined.</p>
              <p className="text-xs mt-1">
                The retriever will fall back to weekTag ≤ {assignment.availableFromWeek}.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Auto-Release Toggle */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-Release Grades</h3>
                <p className="text-sm text-muted-foreground">
                  When the AI finishes grading, release the grade and notes to the student automatically.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={assignment.autoReleaseEnabled}
                  className="peer sr-only"
                  readOnly
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full dark:bg-gray-700" />
              </label>
            </div>

            {assignment.autoReleaseEnabled && (
              <div className="mt-4 border-t border-border pt-4">
                <label className="block text-sm font-medium text-muted-foreground">
                  Confidence Threshold
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0.7"
                    max="1"
                    step="0.01"
                    value={assignment.autoReleaseConfidenceThreshold}
                    className="w-48"
                    readOnly
                  />
                  <span className="text-sm font-mono">
                    {assignment.autoReleaseConfidenceThreshold}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Both the auto-release switch AND the confidence threshold must pass for a grade to auto-release.
                </p>
              </div>
            )}
          </div>

          {/* Resubmissions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-medium">Resubmission Limit</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Maximum number of times a student can resubmit.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={assignment.maxResubmissions}
                min={0}
                max={5}
                className="w-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
                readOnly
              />
              <span className="text-xs text-muted-foreground">
                System policy cap: 5
              </span>
            </div>
          </div>

          {/* Student Preview */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-medium">Student Preview</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Preview what students will see when this assignment is published.
            </p>
            <button className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">
              Preview as Student
            </button>
          </div>
        </div>
      )}

      {/* AI Suggest Criteria Modal (§8.7) */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">AI-Suggested Rubric Criteria</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The AI analyzes your assignment instructions, prerequisite materials, and concept map
              to suggest rubric criteria. You accept, edit, or discard each one individually.
            </p>
            <div className="mt-4 rounded border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Click &quot;Generate Suggestions&quot; to get AI-proposed criteria.</p>
              <button className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Generate Suggestions
              </button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowSuggestModal(false)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dry-Run Modal (§9.10) */}
      {showDryRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Dry-Run Grading</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a sample submission to test the grading pipeline with your current rubric and
              prerequisites. Results are visible only to you and billed to the dry-run budget.
            </p>
            <div className="mt-4 rounded border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Drag and drop a sample submission file here</p>
              <p className="text-xs mt-1">or click to browse</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Results are purged after 30 days. Not visible to students. Billed to __dryrun__ bucket.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowDryRunModal(false)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Run Dry-Run Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
