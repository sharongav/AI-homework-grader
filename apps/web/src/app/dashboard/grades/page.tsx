'use client';

import { useState } from 'react';
import Link from 'next/link';

type GradeEntry = {
  id: string;
  submissionId: string;
  assignmentTitle: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  status: 'RELEASED' | 'PENDING' | 'DRAFT_READY';
  gradedAt: string;
  confidence: number;
};

const mockGrades: GradeEntry[] = [];

export default function GradesPage() {
  const [courseFilter, setCourseFilter] = useState('all');

  const filtered = mockGrades.filter((g: GradeEntry) => {
    if (courseFilter !== 'all' && g.courseTitle !== courseFilter) return false;
    return true;
  });

  const courses = [...new Set(mockGrades.map((g: GradeEntry) => g.courseTitle))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
        <p className="mt-1 text-muted-foreground">
          View your grades and detailed feedback on submissions.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Average Score</div>
          <div className="mt-1 text-2xl font-bold">
            {filtered.length > 0
              ? `${Math.round(filtered.reduce((sum: number, g: GradeEntry) => sum + (g.score / g.maxScore) * 100, 0) / filtered.length)}%`
              : '—'}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Graded</div>
          <div className="mt-1 text-2xl font-bold">
            {filtered.filter((g: GradeEntry) => g.status === 'RELEASED').length}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="mt-1 text-2xl font-bold">
            {filtered.filter((g: GradeEntry) => g.status === 'PENDING').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      {courses.length > 0 && (
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Courses</option>
          {courses.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {/* Grades list */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
          <div className="mb-4 text-4xl">🎓</div>
          <h3 className="mb-2 text-lg font-semibold">No grades yet</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Grades will appear here once your submissions have been graded and released by your instructor.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Assignment</th>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g: GradeEntry) => (
                <tr key={g.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">{g.assignmentTitle}</td>
                  <td className="p-4 text-sm text-muted-foreground">{g.courseTitle}</td>
                  <td className="p-4">
                    <span className="font-semibold">{g.score}</span>
                    <span className="text-muted-foreground">/{g.maxScore}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({Math.round((g.score / g.maxScore) * 100)}%)
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      g.status === 'RELEASED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {g.status === 'RELEASED' ? 'Released' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{new Date(g.gradedAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {g.status === 'RELEASED' && (
                      <Link href={`/dashboard/submissions/${g.submissionId}`} className="text-sm text-primary hover:underline">
                        View Feedback
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
