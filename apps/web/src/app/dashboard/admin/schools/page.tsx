'use client';

import { useState } from 'react';

type School = {
  id: string;
  name: string;
  courseCount: number;
  studentCount: number;
  managerName: string | null;
  createdAt: string;
};

const mockSchools: School[] = [];

export default function SchoolsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = mockSchools.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Schools</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create School
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search schools..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm"
      />

      {filtered.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
          <div className="mb-4 text-4xl">🏫</div>
          <h3 className="mb-2 text-lg font-semibold">No schools yet</h3>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Create schools (e.g., School of Engineering, School of Business) and assign School Managers.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create School
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((school) => (
            <div key={school.id} className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{school.name}</h3>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Courses</span>
                  <span className="font-medium text-foreground">{school.courseCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Students</span>
                  <span className="font-medium text-foreground">{school.studentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Manager</span>
                  <span className="font-medium text-foreground">{school.managerName ?? 'Not assigned'}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">Manage</button>
                <button className="flex-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">Courses</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create school modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Create School</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false); }}>
              <div>
                <label className="mb-1 block text-sm font-medium">School Name</label>
                <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g., School of Engineering" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">School Manager (optional)</label>
                <input type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="manager@university.edu" />
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
