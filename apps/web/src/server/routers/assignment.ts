import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';

export const assignmentRouter = createTRPCRouter({
  /** List assignments for a course. */
  listByCourse: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const isStaff = ctx.effectiveRoles.some((r: string) =>
        ['GRADER', 'TA', 'PROFESSOR', 'HEAD_OF_COURSE', 'SCHOOL_MANAGER', 'UNIV_ADMIN', 'SUPER_ADMIN'].includes(r),
      );

      return prisma.assignment.findMany({
        where: {
          courseId: input.courseId,
          // Students only see published assignments
          ...(!isStaff && { publishedAt: { not: null } }),
        },
        include: {
          rubric: { select: { id: true, title: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { dueAt: 'asc' },
      });
    }),

  /** Get a single assignment by ID. */
  getById: protectedProcedure
    .input(z.object({ assignmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const assignment = await prisma.assignment.findUnique({
        where: { id: input.assignmentId },
        include: {
          rubric: {
            include: {
              versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
            },
          },
          prerequisites: true,
          _count: { select: { submissions: true } },
        },
      });
      if (!assignment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Assignment not found' });
      }
      return assignment;
    }),

  /** Create an assignment. */
  create: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string().min(1).max(300),
        description: z.string().optional(),
        dueDate: z.string().datetime(),
        maxResubmissions: z.number().int().min(0).optional(),
        autoRelease: z.boolean().default(false),
        autoReleaseThreshold: z.number().min(0.7).max(1).default(0.9),
        allowedFileTypes: z.array(z.string()).default(['pdf', 'docx', 'txt', 'py', 'java', 'zip']),
        prerequisiteConceptIds: z.array(z.string()).default([]),
        prerequisiteMaterialIds: z.array(z.string()).default([]),
        latePolicy: z
          .object({
            type: z.enum(['NONE', 'PERCENTAGE_PER_DAY', 'FLAT_DEDUCTION']),
            value: z.number().min(0).max(100).default(0),
            gracePeriodMinutes: z.number().int().min(0).default(0),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check SystemPolicy caps for resubmissions
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
        include: { school: { include: { university: { include: { systemPolicy: true } } } } },
      });
      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      const maxResub = input.maxResubmissions ?? course.resubmissionDefault;
      const cap = course.school.university.systemPolicy?.maxResubmissionsPerAssignment;
      if (cap !== undefined && maxResub > cap) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Max resubmissions (${maxResub}) exceeds system policy cap of ${cap}`,
        });
      }

      const assignment = await prisma.assignment.create({
        data: {
          courseId: input.courseId,
          title: input.title,
          instructions: input.description || '',
          dueAt: new Date(input.dueDate),
          maxResubmissions: maxResub,
          autoReleaseEnabled: input.autoRelease,
          autoReleaseConfidenceThreshold: input.autoReleaseThreshold,
          allowedFileTypes: input.allowedFileTypes,
          latePolicyJson: input.latePolicy || {},
          expectedConceptIds: input.prerequisiteConceptIds,
        },
      });

      // Create prerequisite entries
      for (const conceptId of input.prerequisiteConceptIds) {
        await prisma.assignmentPrerequisite.create({
          data: {
            assignmentId: assignment.id,
            refType: 'CONCEPT',
            refId: conceptId,
          },
        });
      }
      for (const materialId of input.prerequisiteMaterialIds) {
        await prisma.assignmentPrerequisite.create({
          data: {
            assignmentId: assignment.id,
            refType: 'MATERIAL',
            refId: materialId,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'ASSIGNMENT_CREATED',
          targetType: 'Assignment',
          targetId: assignment.id,
          metadata: { title: input.title },
        },
      });

      return assignment;
    }),

  /** Update assignment settings. */
  update: staffProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        title: z.string().min(1).max(300).optional(),
        description: z.string().optional(),
        dueDate: z.string().datetime().optional(),
        autoRelease: z.boolean().optional(),
        autoReleaseThreshold: z.number().min(0.7).max(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, ...data } = input;
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { _count: { select: { submissions: true } } },
      });
      if (!assignment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Assignment not found' });
      }

      const updated = await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { instructions: data.description }),
          ...(data.dueDate && { dueAt: new Date(data.dueDate) }),
          ...(data.autoRelease !== undefined && { autoReleaseEnabled: data.autoRelease }),
          ...(data.autoReleaseThreshold !== undefined && { autoReleaseConfidenceThreshold: data.autoReleaseThreshold }),
        },
      });

      // Audit: warn if students have already submitted
      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'ASSIGNMENT_UPDATED',
          targetType: 'Assignment',
          targetId: assignmentId,
          metadata: {
            ...data,
            hasExistingSubmissions: assignment._count.submissions > 0,
          },
        },
      });

      return updated;
    }),

  /** Publish assignment to students. Two-step: save draft → publish. */
  publish: staffProcedure
    .input(z.object({ assignmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const assignment = await prisma.assignment.findUnique({ where: { id: input.assignmentId } });
      if (!assignment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Assignment not found' });
      }
      if (assignment.publishedAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Assignment already published' });
      }

      const published = await prisma.assignment.update({
        where: { id: input.assignmentId },
        data: { publishedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'ASSIGNMENT_PUBLISHED',
          targetType: 'Assignment',
          targetId: input.assignmentId,
        },
      });

      return published;
    }),

  /** Attach/update rubric for this assignment. */
  setRubric: staffProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        rubricId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if grades exist — if so, editing rubric creates a new version
      const existingGrades = await prisma.grade.count({
        where: { submission: { assignmentId: input.assignmentId } },
      });

      const updated = await prisma.assignment.update({
        where: { id: input.assignmentId },
        data: { rubricId: input.rubricId },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'RUBRIC_ATTACHED',
          targetType: 'Assignment',
          targetId: input.assignmentId,
          metadata: {
            rubricId: input.rubricId,
            existingGradesExist: existingGrades > 0,
          },
        },
      });

      return updated;
    }),

  /** Request AI-suggested rubric criteria per §8.7. Hard Rule 3: nothing auto-applied. */
  suggestRubricCriteria: staffProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Call OpenAI frontier model with assignment instructions + prerequisites + concept map
      // For now return empty suggestions — will be implemented when OpenAI integration is active
      return {
        suggestions: [] as Array<{
          criterion: string;
          maxPoints: number;
          description: string;
          rationale: string;
          citations: Array<{ chunkId: string; excerpt: string }>;
        }>,
      };
    }),

  /** Get prerequisites for an assignment (materials, chunks, concepts). */
  getPrerequisites: protectedProcedure
    .input(z.object({ assignmentId: z.string() }))
    .query(async ({ input }) => {
      return prisma.assignmentPrerequisite.findMany({
        where: { assignmentId: input.assignmentId },
        include: {
          material: { select: { id: true, title: true, kind: true, weekTag: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    }),

  /** Set prerequisites for an assignment (replace all). */
  setPrerequisites: staffProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        prerequisites: z.array(
          z.object({
            refType: z.enum(['MATERIAL', 'MATERIAL_CHUNK', 'CONCEPT']),
            refId: z.string(),
            note: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Delete existing prerequisites and replace
      await prisma.assignmentPrerequisite.deleteMany({
        where: { assignmentId: input.assignmentId },
      });

      const created = await prisma.assignmentPrerequisite.createMany({
        data: input.prerequisites.map((p: any) => ({
          assignmentId: input.assignmentId,
          refType: p.refType,
          refId: p.refId,
          note: p.note,
        })),
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'PREREQUISITES_UPDATED',
          targetType: 'Assignment',
          targetId: input.assignmentId,
          metadata: { count: input.prerequisites.length },
        },
      });

      return { count: created.count };
    }),
});
