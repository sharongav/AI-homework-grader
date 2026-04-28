'use client';

import { useState } from 'react';

type Assignment = {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  status: 'DRAFT' | 'PUBLISHED';
  submissionCount: number;
  maxResubmissions: number;
  releasePolicy: 'AUTO' | 'HOLD_FOR_APPROVAL';
};

const mockAssignments: Assignment[] = [];

export default function AssignmentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = mockAssignments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage assignments across your courses.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Create Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
          <div className="mb-4 text-4xl">📝</div>
          <h3 className="mb-2 text-lg font-semibold">No assignments</h3>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Assignments will appear here once you create a course and add assignments to it.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create your first assignment
          </button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Submissions</th>
                <th className="p-4 font-medium">Release Policy</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">{a.title}</td>
                  <td className="p-4 text-sm text-muted-foreground">{a.courseTitle}</td>
                  <td className="p-4 text-sm">{new Date(a.dueDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      a.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{a.submissionCount}</td>
                  <td className="p-4 text-sm">{a.releasePolicy === 'AUTO' ? 'Auto-release' : 'Hold for approval'}</td>
                  <td className="p-4">
                    <button className="text-sm text-primary hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create assignment modal placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Create Assignment</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false); }}>
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Assignment title" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm" rows={3} placeholder="Assignment description and instructions" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Due Date</label>
                  <input type="datetime-local" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Max Resubmissions</label>
                  <input type="number" min={0} max={10} defaultValue={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Release Policy</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="HOLD_FOR_APPROVAL">Hold for Approval</option>
                    <option value="AUTO">Auto-release</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Max File Size (MB)</label>
                  <input type="number" min={1} max={50} defaultValue={10} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Accepted File Types</label>
                <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder=".pdf, .docx, .py, .java" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
