'use client';

import { useState } from 'react';

export default function AnalyticsPage() {
  const [courseId, setCourseId] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  // Placeholder data for grade distribution bars
  const gradeDistribution = [
    { label: 'A (90–100)', count: 0, color: 'bg-green-500' },
    { label: 'B (80–89)', count: 0, color: 'bg-blue-500' },
    { label: 'C (70–79)', count: 0, color: 'bg-yellow-500' },
    { label: 'D (60–69)', count: 0, color: 'bg-orange-500' },
    { label: 'F (<60)', count: 0, color: 'bg-red-500' },
  ];
  const maxCount = Math.max(...gradeDistribution.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Course performance metrics, grade distributions, and usage analytics.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Courses</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Students', value: '—', subtext: 'Enrolled across courses' },
          { label: 'Total Submissions', value: '—', subtext: 'In selected period' },
          { label: 'Average Score', value: '—', subtext: 'Across all graded' },
          { label: 'AI Cost (MTD)', value: '—', subtext: 'OpenAI + embeddings' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Grade Distribution */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Grade Distribution</h3>
          <div className="space-y-3">
            {gradeDistribution.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted-foreground">{d.label}</span>
                <div className="flex-1 rounded-full bg-muted h-6 overflow-hidden">
                  <div
                    className={`h-full ${d.color} rounded-full transition-all`}
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium">{d.count}</span>
              </div>
            ))}
          </div>
          {gradeDistribution.every((d) => d.count === 0) && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No grade data available. Connect database to load data.
            </p>
          )}
        </div>

        {/* Submission Timeline */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Submission Timeline</h3>
          <div className="flex h-48 items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/20" style={{ height: '2px' }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No submission data available yet.
          </p>
        </div>

        {/* AI Performance */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">AI Grading Performance</h3>
          <div className="space-y-4">
            {[
              { label: 'Avg. confidence score', value: '—' },
              { label: 'Auto-released (above threshold)', value: '—' },
              { label: 'Held for review', value: '—' },
              { label: 'Human override rate', value: '—' },
              { label: 'Avg. grading latency', value: '—' },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-medium">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Cost Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Grading calls', value: '$0.00' },
              { label: 'Embedding generation', value: '$0.00' },
              { label: 'Reranking', value: '$0.00' },
              { label: 'Follow-up chat', value: '$0.00' },
              { label: 'Total', value: '$0.00', bold: true },
            ].map((c) => (
              <div key={c.label} className={`flex items-center justify-between text-sm ${c.bold ? 'border-t pt-2 font-semibold' : ''}`}>
                <span className="text-muted-foreground">{c.label}</span>
                <span className={c.bold ? 'font-bold' : 'font-medium'}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
