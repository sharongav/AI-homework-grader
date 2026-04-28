import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';

export const gradeRouter = createTRPCRouter({
  /** Get grade for a submission. Per Hard Rule 9: students see approved only. */
  getBySubmission: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
        select: { studentId: true },
      });

      if (!submission) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
      }

      const isStudent = submission.studentId === ctx.userId;
      const isStaff = ctx.effectiveRoles.some((r) =>
        ['GRADER', 'TA', 'PROFESSOR', 'HEAD_OF_COURSE', 'SCHOOL_MANAGER', 'UNIV_ADMIN', 'SUPER_ADMIN'].includes(r),
      );

      const grade = await prisma.grade.findFirst({
        where: {
          submissionId: input.submissionId,
          ...(isStudent && !isStaff ? { releasedToStudentAt: { not: null } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          rubricVersion: true,
        },
      });

      return grade;
    }),

  /** Staff: approve an AI-generated draft grade. */
  approve: staffProcedure
    .input(
      z.object({
        gradeId: z.string(),
        adjustedScore: z.number().min(0).optional(),
        staffComment: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const grade = await prisma.grade.findUnique({ where: { id: input.gradeId } });
      if (!grade) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Grade not found' });
      }
      if (grade.releasedToStudentAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Grade already released — immutable (Hard Rule 14)' });
      }

      const updated = await prisma.grade.update({
        where: { id: input.gradeId },
        data: {
          isDraft: false,
          approvedById: ctx.userId!,
          approvedAt: new Date(),
          ...(input.adjustedScore !== undefined && { score: input.adjustedScore }),
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'GRADE_APPROVED',
          targetType: 'Grade',
          targetId: input.gradeId,
          metadata: { adjustedScore: input.adjustedScore, staffComment: input.staffComment },
        },
      });

      return updated;
    }),

  /** Staff: override an AI grade. Hard Rule 7: human override always. Hard Rule 14: creates new Grade. */
  override: staffProcedure
    .input(
      z.object({
        submissionId: z.string(),
        score: z.number().min(0),
        criterionScores: z.record(z.string(), z.number()),
        feedback: z.string(),
        reason: z.string().min(1, 'Override reason is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentGrade = await prisma.grade.findFirst({
        where: { submissionId: input.submissionId },
        orderBy: { createdAt: 'desc' },
      });

      if (!currentGrade) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No existing grade found' });
      }

      // Create new Grade that supersedes the old one (Hard Rule 14)
      const newGrade = await prisma.grade.create({
        data: {
          submissionId: input.submissionId,
          score: input.score,
          maxScore: currentGrade.maxScore,
          rubricBreakdown: input.criterionScores,
          aiConfidence: 1.0, // Human override = full confidence
          perCriterionConfidence: {},
          isDraft: false,
          approvedById: ctx.userId!,
          approvedAt: new Date(),
          supersedesGradeId: currentGrade.id,
          overrideReason: input.reason,
          createdById: ctx.userId!,
          rubricVersionId: currentGrade.rubricVersionId,
          promptVersion: currentGrade.promptVersion,
          modelSnapshot: currentGrade.modelSnapshot,
        },
      });

      // Update submission status
      await prisma.submission.update({
        where: { id: input.submissionId },
        data: { status: 'DRAFT_READY' },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'GRADE_OVERRIDDEN',
          targetType: 'Grade',
          targetId: newGrade.id,
          metadata: {
            previousGradeId: currentGrade.id,
            reason: input.reason,
            oldScore: currentGrade.score.toString(),
            newScore: input.score.toString(),
          },
        },
      });

      return { gradeId: newGrade.id };
    }),

  /** Release a grade to the student. Hard Rule 14: immutable after release. */
  release: staffProcedure
    .input(z.object({ gradeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const grade = await prisma.grade.findUnique({ where: { id: input.gradeId } });
      if (!grade) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Grade not found' });
      }
      if (grade.releasedToStudentAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Grade already released' });
      }

      const released = await prisma.grade.update({
        where: { id: input.gradeId },
        data: {
          releasedToStudentAt: new Date(),
          isDraft: false,
        },
      });

      await prisma.submission.update({
        where: { id: grade.submissionId },
        data: { status: 'RELEASED' },
      });

      // TODO: Send notification to student

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'GRADE_RELEASED',
          targetType: 'Grade',
          targetId: input.gradeId,
        },
      });

      return released;
    }),

  /** Batch release multiple grades. Safety: blocked if any confidence below threshold. */
  batchRelease: staffProcedure
    .input(z.object({ gradeIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const grades = await prisma.grade.findMany({
        where: { id: { in: input.gradeIds }, releasedToStudentAt: null },
        include: { submission: { include: { assignment: true } } },
      });

      // Block bulk release on low-confidence grades
      const lowConfidence = grades.filter(
        (g) => g.aiConfidence < (g.submission.assignment.autoReleaseConfidenceThreshold ?? 0.9),
      );
      if (lowConfidence.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `${lowConfidence.length} grade(s) are below the confidence threshold and cannot be bulk released`,
        });
      }

      const now = new Date();
      let released = 0;
      for (const grade of grades) {
        await prisma.grade.update({
          where: { id: grade.id },
          data: { releasedToStudentAt: now, isDraft: false },
        });
        await prisma.submission.update({
          where: { id: grade.submissionId },
          data: { status: 'RELEASED' },
        });
        released++;
      }

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'GRADES_BATCH_RELEASED',
          targetType: 'Grade',
          targetId: input.gradeIds[0] ?? '',
          metadata: { count: released, gradeIds: input.gradeIds },
        },
      });

      return { released };
    }),

  /** Staff: review queue — submissions awaiting human review. */
  reviewQueue: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
        sortBy: z.enum(['confidence_asc', 'submitted_at_asc', 'submitted_at_desc']).default('confidence_asc'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        assignment: { courseId: input.courseId },
        status: {
          in: [...['HELD_FOR_APPROVAL', 'FLAGGED_FOR_REVIEW', 'NEEDS_MANUAL_GRADE', 'FAILED']] as any,
        },
      };

      const [items, total] = await Promise.all([
        prisma.submission.findMany({
          where,
          include: {
            student: { select: { id: true, name: true, email: true } },
            assignment: { select: { title: true } },
            grades: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { submittedAt: input.sortBy === 'submitted_at_desc' ? 'desc' : 'asc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.submission.count({ where }),
      ]);

      return { items, total };
    }),

  /** Get grade with full feedback, annotations, and retrieval snapshot. */
  getGradeWithFeedback: protectedProcedure
    .input(z.object({ gradeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const grade = await prisma.grade.findUnique({
        where: { id: input.gradeId },
        include: {
          submission: {
            include: {
              feedback: true,
              annotations: { orderBy: { createdAt: 'asc' } },
              student: { select: { id: true, name: true, email: true } },
              assignment: { select: { id: true, title: true, courseId: true } },
            },
          },
          rubricVersion: true,
          retrievalSnapshot: true,
          createdBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
        },
      });

      if (!grade) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Grade not found' });
      }

      // Hard Rule 9: students see released grades only
      const isStudent = grade.submission.studentId === ctx.userId;
      const isStaff = ctx.effectiveRoles.some((r) =>
        ['GRADER', 'TA', 'PROFESSOR', 'HEAD_OF_COURSE', 'SCHOOL_MANAGER', 'UNIV_ADMIN', 'SUPER_ADMIN'].includes(r),
      );

      if (isStudent && !isStaff && !grade.releasedToStudentAt) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Grade not yet released' });
      }

      // Strip reviewer-only data from student view
      if (isStudent && !isStaff) {
        return {
          ...grade,
          aiConfidence: undefined,
          perCriterionConfidence: undefined,
          retrievalSnapshot: undefined,
          submission: {
            ...grade.submission,
            feedback: grade.submission.feedback
              ? {
                  ...grade.submission.feedback,
                  rawModelOutput: undefined,
                }
              : null,
          },
        };
      }

      return grade;
    }),
});
