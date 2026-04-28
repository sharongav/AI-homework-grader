import { z } from 'zod';
import { createTRPCRouter, staffProcedure, adminProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';

export const analyticsRouter = createTRPCRouter({
  /** Course-level analytics (Professor, Head of Course). */
  courseOverview: staffProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [totalStudents, totalSubmissions, pendingReviews] = await Promise.all([
        prisma.enrollment.count({ where: { courseId: input.courseId, status: 'ACTIVE' } }),
        prisma.submission.count({ where: { assignment: { courseId: input.courseId } } }),
        prisma.submission.count({
          where: {
            assignment: { courseId: input.courseId },
            status: { in: ['HELD_FOR_APPROVAL', 'FLAGGED_FOR_REVIEW', 'NEEDS_MANUAL_GRADE'] },
          },
        }),
      ]);

      // Get grade distribution
      const grades = await prisma.grade.findMany({
        where: { submission: { assignment: { courseId: input.courseId } }, releasedToStudentAt: { not: null } },
        select: { score: true, maxScore: true },
      });

      const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
      let totalScore = 0;
      for (const g of grades) {
        const pct = Number(g.score) / Number(g.maxScore) * 100;
        totalScore += pct;
        if (pct >= 90) distribution.A!++;
        else if (pct >= 80) distribution.B!++;
        else if (pct >= 70) distribution.C!++;
        else if (pct >= 60) distribution.D!++;
        else distribution.F!++;
      }

      return {
        totalStudents,
        totalSubmissions,
        averageScore: grades.length > 0 ? Math.round(totalScore / grades.length) : 0,
        gradeDistribution: distribution,
        averageGradingTime: 0,
        pendingReviews,
      };
    }),

  /** School-level analytics (School Manager). */
  schoolOverview: staffProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [totalCourses, courses] = await Promise.all([
        prisma.course.count({ where: { schoolId: input.schoolId } }),
        prisma.course.findMany({
          where: { schoolId: input.schoolId },
          select: { id: true },
        }),
      ]);

      const courseIds = courses.map((c: { id: string }) => c.id);
      const [totalStudents, totalSubmissions] = await Promise.all([
        prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: 'ACTIVE' } }),
        prisma.submission.count({ where: { assignment: { courseId: { in: courseIds } } } }),
      ]);

      return { totalCourses, totalStudents, totalSubmissions };
    }),

  /** University-wide analytics (Univ Admin, Super Admin). */
  universityOverview: adminProcedure.query(async ({ ctx }) => {
    const [totalSchools, totalCourses, totalStudents, totalSubmissions] = await Promise.all([
      prisma.school.count({ where: { universityId: ctx.universityId! } }),
      prisma.course.count({ where: { school: { universityId: ctx.universityId! } } }),
      prisma.enrollment.count({
        where: { course: { school: { universityId: ctx.universityId! } }, status: 'ACTIVE' },
      }),
      prisma.submission.count({
        where: { assignment: { course: { school: { universityId: ctx.universityId! } } } },
      }),
    ]);

    return {
      totalSchools,
      totalCourses,
      totalStudents,
      totalSubmissions,
      totalCostUsd: 0, // TODO: aggregate from UsageRecord
    };
  }),

  /** Billing analytics per course. */
  courseBilling: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        month: z.string().regex(/^\d{4}-\d{2}$/),
      }),
    )
    .query(async ({ ctx, input }) => {
      const billing = await prisma.courseBilling.findFirst({
        where: {
          courseId: input.courseId,
          periodMonth: input.month,
        },
      });

      if (!billing) {
        return {
          totalCostUsd: 0,
          breakdown: {},
        };
      }

      return {
        totalCostUsd: Number(billing.totalCostUsd),
        breakdown: billing.breakdownJson as Record<string, number>,
      };
    }),

  /** Concept mastery heatmap: students × concepts. */
  getConceptMastery: staffProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      // Get concepts for this course
      const concepts = await prisma.concept.findMany({
        where: { courseId: input.courseId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });

      // Get enrolled students
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: input.courseId, status: 'ACTIVE' },
        include: { student: { select: { id: true, name: true } } },
      });

      // Get released feedback with concept analysis
      const feedbacks = await prisma.feedback.findMany({
        where: {
          submission: { assignment: { courseId: input.courseId }, status: 'RELEASED' },
        },
        include: {
          submission: { select: { studentId: true } },
        },
      });

      // Build mastery matrix from concept analysis in feedback
      const masteryMap: Record<string, Record<string, string>> = {};
      for (const fb of feedbacks) {
        const studentId = fb.submission.studentId;
        if (!masteryMap[studentId]) masteryMap[studentId] = {};
        const analysis = fb.conceptAnalysis as Array<{ conceptId: string; status: string }> | null;
        if (Array.isArray(analysis)) {
          for (const entry of analysis) {
            masteryMap[studentId]![entry.conceptId] = entry.status;
          }
        }
      }

      return {
        concepts,
        students: enrollments.map((e: { student: { id: string; name: string | null } }) => ({
          id: e.student.id,
          name: e.student.name,
          mastery: masteryMap[e.student.id] ?? {},
        })),
      };
    }),

  /** At-risk student list with suggested interventions. */
  getAtRiskStudents: staffProcedure
    .input(z.object({ courseId: z.string(), threshold: z.number().min(0).max(100).default(60) }))
    .query(async ({ input }) => {
      // Get students with released grades below threshold
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: input.courseId, status: 'ACTIVE' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              submissions: {
                where: { assignment: { courseId: input.courseId }, status: 'RELEASED' },
                include: {
                  grades: {
                    where: { releasedToStudentAt: { not: null } },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { score: true, maxScore: true },
                  },
                },
              },
            },
          },
        },
      });

      const atRisk: Array<{
        studentId: string;
        name: string;
        email: string;
        averageScore: number;
        submissionCount: number;
        suggestion: string;
      }> = [];

      for (const enrollment of enrollments) {
        const student = enrollment.student;
        const grades = student.submissions.flatMap((s: { grades: Array<{ score: unknown; maxScore: unknown }> }) => s.grades);
        if (grades.length === 0) continue;

        const avgPct =
          grades.reduce((sum: number, g: { score: unknown; maxScore: unknown }) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0) /
          grades.length;

        if (avgPct < input.threshold) {
          atRisk.push({
            studentId: student.id,
            name: student.name,
            email: student.email,
            averageScore: Math.round(avgPct),
            submissionCount: student.submissions.length,
            suggestion:
              avgPct < 40
                ? 'Schedule individual meeting — student may need significant additional support'
                : 'Recommend office hours and review sessions for weak concept areas',
          });
        }
      }

      return atRisk.sort((a: any, b: any) => a.averageScore - b.averageScore);
    }),
});
