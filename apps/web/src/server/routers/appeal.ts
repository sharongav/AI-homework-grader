import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';

export const appealRouter = createTRPCRouter({
  /** Student: file an appeal on a released grade. */
  create: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        reason: z.string().min(10).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
      });
      if (!submission) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
      }
      if (submission.studentId !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot appeal another student\'s submission' });
      }

      // Check grade is released
      const releasedGrade = await prisma.grade.findFirst({
        where: { submissionId: input.submissionId, releasedToStudentAt: { not: null } },
      });
      if (!releasedGrade) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No released grade to appeal' });
      }

      const appeal = await prisma.appeal.create({
        data: {
          submissionId: input.submissionId,
          studentId: ctx.userId!,
          reason: input.reason,
          status: 'OPEN',
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'APPEAL_FILED',
          targetType: 'Appeal',
          targetId: appeal.id,
          metadata: { submissionId: input.submissionId },
        },
      });

      return { appealId: appeal.id };
    }),

  /** Staff: list pending appeals for a course. */
  listByCourse: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        submission: { assignment: { courseId: input.courseId } },
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        prisma.appeal.findMany({
          where,
          include: {
            student: { select: { id: true, name: true, email: true } },
            submission: { include: { assignment: { select: { title: true } } } },
            assignedTo: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * 20,
          take: 20,
        }),
        prisma.appeal.count({ where }),
      ]);

      return { items, total };
    }),

  /** Staff: resolve an appeal. */
  resolve: staffProcedure
    .input(
      z.object({
        appealId: z.string(),
        resolution: z.enum(['RESOLVED', 'REJECTED']),
        note: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const appeal = await prisma.appeal.findUnique({ where: { id: input.appealId } });
      if (!appeal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appeal not found' });
      }

      const updated = await prisma.appeal.update({
        where: { id: input.appealId },
        data: {
          status: input.resolution,
          resolutionNote: input.note,
          assignedToId: ctx.userId!,
          resolvedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'APPEAL_RESOLVED',
          targetType: 'Appeal',
          targetId: input.appealId,
          metadata: { resolution: input.resolution, note: input.note },
        },
      });

      return updated;
    }),

  /** Get a single appeal by ID. */
  get: protectedProcedure
    .input(z.object({ appealId: z.string() }))
    .query(async ({ ctx, input }) => {
      const appeal = await prisma.appeal.findUnique({
        where: { id: input.appealId },
        include: {
          student: { select: { id: true, name: true, email: true } },
          submission: {
            include: {
              assignment: { select: { id: true, title: true, courseId: true } },
              grades: {
                where: { releasedToStudentAt: { not: null } },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
              feedback: true,
            },
          },
          assignedTo: { select: { id: true, name: true } },
        },
      });
      if (!appeal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appeal not found' });
      }

      // Students can only see their own appeals
      const isStaff = ctx.effectiveRoles.some((r: string) =>
        ['GRADER', 'TA', 'PROFESSOR', 'HEAD_OF_COURSE', 'SCHOOL_MANAGER', 'UNIV_ADMIN', 'SUPER_ADMIN'].includes(r),
      );
      if (appeal.studentId !== ctx.userId && !isStaff) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      return appeal;
    }),

  /** Staff: assign a reviewer to an appeal. */
  assignReviewer: staffProcedure
    .input(
      z.object({
        appealId: z.string(),
        reviewerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const appeal = await prisma.appeal.findUnique({ where: { id: input.appealId } });
      if (!appeal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appeal not found' });
      }

      const reviewer = await prisma.user.findUnique({ where: { id: input.reviewerId } });
      if (!reviewer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reviewer not found' });
      }

      const updated = await prisma.appeal.update({
        where: { id: input.appealId },
        data: {
          assignedToId: input.reviewerId,
          status: 'UNDER_REVIEW',
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'APPEAL_REVIEWER_ASSIGNED',
          targetType: 'Appeal',
          targetId: input.appealId,
          metadata: { reviewerId: input.reviewerId },
        },
      });

      return updated;
    }),
});
