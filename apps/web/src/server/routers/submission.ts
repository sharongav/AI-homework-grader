import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createHash } from 'crypto';
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';
import { sanitizeStudentContent } from '@homework-platform/grading';

export const submissionRouter = createTRPCRouter({
  /** Submit homework for an assignment. Per Hard Rule 1: AI=draft only. */
  submit: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        files: z.array(
          z.object({
            name: z.string(),
            mimeType: z.string(),
            sizeBytes: z.number().int().positive(),
            storageKey: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Sanitize filenames (§9.1 Layer 3)
      const sanitizedFiles = input.files.map((f) => ({
        ...f,
        name: sanitizeStudentContent(f.name),
      }));

      const assignment = await prisma.assignment.findUnique({
        where: { id: input.assignmentId },
        include: { course: { include: { school: { include: { university: { include: { systemPolicy: true } } } } } } },
      });

      if (!assignment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Assignment not found' });
      }

      if (!assignment.publishedAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Assignment is not published' });
      }

      // Check enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          courseId_studentId: {
            courseId: assignment.courseId,
            studentId: ctx.userId!,
          },
        },
      });
      if (!enrollment || enrollment.status !== 'ACTIVE') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not enrolled in this course' });
      }

      // Check resubmission limits
      const existingCount = await prisma.submission.count({
        where: {
          assignmentId: input.assignmentId,
          studentId: ctx.userId!,
        },
      });

      if (existingCount > assignment.maxResubmissions) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Maximum submission attempts exceeded',
        });
      }

      // File size check against SystemPolicy
      const maxMb = assignment.course.school.university.systemPolicy?.maxFileSizeMb ?? 25;
      for (const file of sanitizedFiles) {
        if (file.sizeBytes > maxMb * 1024 * 1024) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `File "${file.name}" exceeds the ${maxMb}MB limit`,
          });
        }
      }

      const attemptNumber = existingCount + 1;
      const idempotencyKey = createHash('sha256')
        .update(`${input.assignmentId}|${ctx.userId}|${attemptNumber}`)
        .digest('hex');

      const submission = await prisma.submission.create({
        data: {
          assignmentId: input.assignmentId,
          studentId: ctx.userId!,
          storageKeys: sanitizedFiles.map((f) => f.storageKey),
          attemptNumber,
          idempotencyKey,
          status: 'PENDING',
        },
      });

      // TODO: Enqueue grading job to BullMQ queue

      return { submissionId: submission.id };
    }),

  /** List submissions for the current student in a course. */
  listMine: protectedProcedure
    .input(z.object({ assignmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.submission.findMany({
        where: {
          assignmentId: input.assignmentId,
          studentId: ctx.userId!,
        },
        include: {
          grades: {
            where: { releasedToStudentAt: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { attemptNumber: 'desc' },
      });
    }),

  /** Staff: list all submissions for an assignment. */
  listAll: staffProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        status: z.enum(['PENDING', 'GRADING', 'DRAFT_READY', 'HELD_FOR_APPROVAL', 'RELEASED', 'FAILED', 'NEEDS_MANUAL_GRADE', 'FLAGGED_FOR_REVIEW']).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        assignmentId: input.assignmentId,
        ...(input.status && { status: input.status }),
      };

      const [items, total] = await Promise.all([
        prisma.submission.findMany({
          where,
          include: {
            student: { select: { id: true, name: true, email: true } },
            grades: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { submittedAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.submission.count({ where }),
      ]);

      return { items, total };
    }),

  /** Get a single submission with its grade and feedback. */
  getById: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
        include: {
          assignment: true,
          student: { select: { id: true, name: true, email: true } },
          grades: { orderBy: { createdAt: 'desc' } },
          feedback: true,
          annotations: true,
          followupThreads: true,
        },
      });

      if (!submission) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
      }

      // Hard Rule 9: students see approved/released feedback only
      const isStudent = submission.studentId === ctx.userId;
      const isStaff = ctx.effectiveRoles.some((r) =>
        ['GRADER', 'TA', 'PROFESSOR', 'HEAD_OF_COURSE', 'SCHOOL_MANAGER', 'UNIV_ADMIN', 'SUPER_ADMIN'].includes(r),
      );

      if (isStudent && !isStaff) {
        // Filter to only released grades
        return {
          ...submission,
          grades: submission.grades.filter((g) => g.releasedToStudentAt !== null),
        };
      }

      return submission;
    }),

  /** Upload a file (returns a presigned upload URL). */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        sizeBytes: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Generate presigned URL for MinIO/S3/R2
      const storageKey = `submissions/${input.assignmentId}/${ctx.userId}/${Date.now()}-${sanitizeStudentContent(input.fileName)}`;
      return { uploadUrl: `/api/upload/${storageKey}`, storageKey };
    }),

  /** Get submission history for a student on an assignment. */
  getHistory: protectedProcedure
    .input(z.object({ assignmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.submission.findMany({
        where: {
          assignmentId: input.assignmentId,
          studentId: ctx.userId!,
        },
        include: {
          grades: {
            where: { releasedToStudentAt: { not: null } },
            select: {
              id: true,
              score: true,
              maxScore: true,
              aiConfidence: true,
              releasedToStudentAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { attemptNumber: 'asc' },
      });
    }),

  /** Get the current status of a submission (for polling). */
  getSubmissionStatus: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
        select: {
          id: true,
          status: true,
          statusReason: true,
          flagReasons: true,
          submittedAt: true,
          updatedAt: true,
        },
      });
      if (!submission) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
      }
      return submission;
    }),
});
