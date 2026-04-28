import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';
import { sanitizeStudentContent } from '@homework-platform/grading';

export const chatRouter = createTRPCRouter({
  /** Send a follow-up message on released feedback per §8.8. */
  sendMessage: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        gradeId: z.string(),
        message: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership — students can only chat on their own submissions
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
        include: { assignment: true },
      });
      if (!submission) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
      }
      if (submission.studentId !== ctx.userId) {
        await prisma.auditLog.create({
          data: {
            actorId: ctx.userId!,
            action: 'UNAUTHORIZED_CHAT_ATTEMPT',
            targetType: 'Submission',
            targetId: input.submissionId,
          },
        });
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot chat on another student\'s submission' });
      }

      // Check grade is released
      const grade = await prisma.grade.findUnique({ where: { id: input.gradeId } });
      if (!grade || !grade.releasedToStudentAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Grade not yet released' });
      }

      // Find or create thread
      let thread = await prisma.feedbackFollowupThread.findFirst({
        where: { submissionId: input.submissionId },
        include: { _count: { select: { messages: true } } },
      });

      if (!thread) {
        thread = await prisma.feedbackFollowupThread.create({
          data: {
            submissionId: input.submissionId,
            studentId: ctx.userId!,
          },
          include: { _count: { select: { messages: true } } },
        });
      }

      // Rate limit check (default 20 messages)
      const maxMessages = 20; // TODO: make configurable per Head of Course
      if (thread._count.messages >= maxMessages) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Message limit reached. Please contact your professor in office hours.',
        });
      }

      // Sanitize student message (§9.1 Layer 3)
      const sanitizedMessage = sanitizeStudentContent(input.message);

      // Save student message
      await prisma.feedbackFollowupMessage.create({
        data: {
          threadId: thread.id,
          role: 'STUDENT',
          body: sanitizedMessage,
        },
      });

      // TODO: Call frontier model with context (submission, rubric, grade, feedback, citations, retrieval snapshot)
      // For now, return placeholder
      const aiResponse = 'Follow-up chat AI integration pending. Your question has been recorded.';

      await prisma.feedbackFollowupMessage.create({
        data: {
          threadId: thread.id,
          role: 'AI',
          body: aiResponse,
        },
      });

      return {
        messageId: thread.id,
        response: aiResponse,
        citations: [] as Array<{ chunkId: string; excerpt: string; sectionPath: string }>,
        remainingMessages: maxMessages - thread._count.messages - 2,
      };
    }),

  /** Get chat history for a submission. */
  getHistory: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const thread = await prisma.feedbackFollowupThread.findFirst({
        where: { submissionId: input.submissionId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      return {
        messages: thread?.messages ?? [],
        totalMessages: thread?.messages.length ?? 0,
        maxMessages: 20,
      };
    }),

  /** Staff: view flagged threads that need instructor attention. */
  flaggedThreads: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [items, total] = await Promise.all([
        prisma.feedbackFollowupThread.findMany({
          where: {
            status: 'FLAGGED_TO_INSTRUCTOR',
            submission: { assignment: { courseId: input.courseId } },
          },
          include: {
            student: { select: { id: true, name: true, email: true } },
            submission: { include: { assignment: { select: { title: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { openedAt: 'desc' },
          skip: (input.page - 1) * 20,
          take: 20,
        }),
        prisma.feedbackFollowupThread.count({
          where: {
            status: 'FLAGGED_TO_INSTRUCTOR',
            submission: { assignment: { courseId: input.courseId } },
          },
        }),
      ]);

      return { items, total };
    }),

  /** Open a thread on a released submission. */
  openThread: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
        select: { studentId: true, status: true },
      });
      if (!submission) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
      }
      if (submission.studentId !== ctx.userId) {
        await prisma.auditLog.create({
          data: {
            actorId: ctx.userId!,
            action: 'UNAUTHORIZED_THREAD_OPEN_ATTEMPT',
            targetType: 'Submission',
            targetId: input.submissionId,
          },
        });
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot open thread on another student\'s submission' });
      }
      if (submission.status !== 'RELEASED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Grade must be released before opening a thread' });
      }

      // Check if thread already exists
      const existing = await prisma.feedbackFollowupThread.findFirst({
        where: { submissionId: input.submissionId },
      });
      if (existing) return existing;

      return prisma.feedbackFollowupThread.create({
        data: {
          submissionId: input.submissionId,
          studentId: ctx.userId!,
        },
      });
    }),

  /** List messages in a thread with pagination. */
  listMessages: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const thread = await prisma.feedbackFollowupThread.findUnique({
        where: { id: input.threadId },
        select: { studentId: true },
      });
      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' });
      }

      // Students can only see their own threads; staff can see any
      const isStaff = ctx.effectiveRoles.some((r: string) =>
        ['GRADER', 'TA', 'PROFESSOR', 'HEAD_OF_COURSE', 'SCHOOL_MANAGER', 'UNIV_ADMIN', 'SUPER_ADMIN'].includes(r),
      );
      if (thread.studentId !== ctx.userId && !isStaff) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      const [items, total] = await Promise.all([
        prisma.feedbackFollowupMessage.findMany({
          where: { threadId: input.threadId },
          orderBy: { createdAt: 'asc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.feedbackFollowupMessage.count({ where: { threadId: input.threadId } }),
      ]);

      return { items, total, maxMessages: 20 };
    }),
});
