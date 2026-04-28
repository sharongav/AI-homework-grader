import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';

export const courseRouter = createTRPCRouter({
  /** List courses visible to the current user based on role. */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.effectiveRoles.includes('SUPER_ADMIN')) {
      return prisma.course.findMany({
        include: { school: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    const isStaff = ctx.effectiveRoles.some((r) =>
      ['PROFESSOR', 'HEAD_OF_COURSE', 'TA', 'GRADER', 'SCHOOL_MANAGER', 'UNIV_ADMIN'].includes(r),
    );

    if (isStaff) {
      const roleAssignments = await prisma.roleAssignment.findMany({
        where: { userId: ctx.userId!, scopeType: 'COURSE' },
        select: { scopeId: true },
      });
      const courseIds = roleAssignments.map((ra: { scopeId: string }) => ra.scopeId);
      return prisma.course.findMany({
        where: { id: { in: courseIds } },
        include: { school: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Students see enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: ctx.userId!, status: 'ACTIVE' },
      select: { courseId: true },
    });
    return prisma.course.findMany({
      where: { id: { in: enrollments.map((e: { courseId: string }) => e.courseId) } },
      include: { school: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /** Get a single course by ID. */
  getById: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
        include: {
          school: true,
          assignments: { orderBy: { createdAt: 'desc' } },
          enrollments: { where: { status: 'ACTIVE' }, select: { id: true } },
        },
      });
      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }
      return course;
    }),

  /** Create a new course. */
  create: staffProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        code: z.string().min(1).max(50),
        term: z.string().min(1),
        schoolId: z.string(),
        timezone: z.string().default('UTC'),
        locale: z.string().default('en'),
        releasePolicy: z.enum(['HOLD_FOR_APPROVAL', 'AUTO']).default('HOLD_FOR_APPROVAL'),
        maxResubmissions: z.number().int().min(0).max(10).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const school = await prisma.school.findUnique({
        where: { id: input.schoolId },
        include: { university: { include: { systemPolicy: true } } },
      });
      if (!school) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'School not found' });
      }

      const cap = school.university.systemPolicy?.maxResubmissionsPerAssignment;
      if (cap !== undefined && input.maxResubmissions > cap) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Max resubmissions cannot exceed system policy cap of ${cap}`,
        });
      }

      const course = await prisma.course.create({
        data: {
          title: input.name,
          code: input.code,
          term: input.term,
          schoolId: input.schoolId,
          timezone: input.timezone,
          releaseDefault: input.releasePolicy,
          resubmissionDefault: input.maxResubmissions,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'COURSE_CREATED',
          targetType: 'Course',
          targetId: course.id,
          metadata: { name: input.name, code: input.code },
        },
      });

      return course;
    }),

  /** Update course settings — respects SystemPolicy caps. */
  update: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        name: z.string().min(1).max(200).optional(),
        releasePolicy: z.enum(['HOLD_FOR_APPROVAL', 'AUTO']).optional(),
        maxResubmissions: z.number().int().min(0).max(10).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId, ...data } = input;
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { school: { include: { university: { include: { systemPolicy: true } } } } },
      });
      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      if (data.maxResubmissions !== undefined) {
        const cap = course.school.university.systemPolicy?.maxResubmissionsPerAssignment;
        if (cap !== undefined && data.maxResubmissions > cap) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Max resubmissions cannot exceed cap of ${cap}`,
          });
        }
      }

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
          ...(data.name && { title: data.name }),
          ...(data.releasePolicy && { releaseDefault: data.releasePolicy }),
          ...(data.maxResubmissions !== undefined && { resubmissionDefault: data.maxResubmissions }),
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'COURSE_UPDATED',
          targetType: 'Course',
          targetId: courseId,
          metadata: data,
        },
      });

      return updated;
    }),

  /** Upload CSV roster for bulk student enrollment. */
  uploadRoster: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        csvContent: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lines = input.csvContent.split('\n').filter((l) => l.trim());
      const errors: string[] = [];
      let imported = 0;

      const startIdx = lines[0]?.toLowerCase().includes('email') ? 1 : 0;
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
        include: { school: true },
      });
      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i]!.split(',').map((p) => p.trim());
        const email = parts[0];
        const name = parts[1] || '';

        if (!email || !email.includes('@')) {
          errors.push(`Row ${i + 1}: Invalid email "${email}"`);
          continue;
        }

        try {
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: name || email.split('@')[0]!,
                passwordHash: '',
                universityId: course.school.universityId,
              },
            });
          }

          await prisma.enrollment.upsert({
            where: {
              courseId_studentId: {
                courseId: input.courseId,
                studentId: user.id,
              },
            },
            update: { status: 'ACTIVE' },
            create: {
              courseId: input.courseId,
              studentId: user.id,
              status: 'ACTIVE',
            },
          });
          imported++;
        } catch {
          errors.push(`Row ${i + 1}: Failed to process "${email}"`);
        }
      }

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'ROSTER_UPLOADED',
          targetType: 'Course',
          targetId: input.courseId,
          metadata: { imported, errorCount: errors.length },
        },
      });

      return { imported, errors };
    }),

  /** Delete a course (soft or hard). Staff only. */
  delete: staffProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
      });
      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      // Check if any submissions exist for this course's assignments
      const submissionCount = await prisma.submission.count({
        where: { assignment: { courseId: input.courseId } },
      });
      if (submissionCount > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete a course with existing submissions',
        });
      }

      await prisma.course.delete({ where: { id: input.courseId } });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'COURSE_DELETED',
          targetType: 'Course',
          targetId: input.courseId,
          metadata: { title: course.title, code: course.code },
        },
      });

      return { success: true };
    }),

  /** Get course settings including inherited SystemPolicy caps. */
  getSettings: staffProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
        include: {
          school: {
            include: {
              university: {
                include: { systemPolicy: true, retentionPolicy: true },
              },
            },
          },
        },
      });
      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      const systemPolicy = course.school.university.systemPolicy;
      return {
        course: {
          id: course.id,
          title: course.title,
          code: course.code,
          term: course.term,
          timezone: course.timezone,
          releaseDefault: course.releaseDefault,
          resubmissionDefault: course.resubmissionDefault,
          monthlyBudgetUsd: course.monthlyBudgetUsd,
        },
        systemPolicyCaps: {
          maxResubmissionsPerAssignment: systemPolicy?.maxResubmissionsPerAssignment ?? 5,
          maxFileSizeMb: systemPolicy?.maxFileSizeMb ?? 50,
          maxMonthlySpendPerCourseUsd: systemPolicy?.maxMonthlySpendPerCourseUsd ?? null,
          defaultAutoReleaseConfidenceThreshold:
            systemPolicy?.defaultAutoReleaseConfidenceThreshold ?? 0.9,
        },
      };
    }),
});
