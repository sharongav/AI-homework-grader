import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, adminProcedure, superAdminProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';

export const adminRouter = createTRPCRouter({
  /** University Admin: manage schools. */
  listSchools: adminProcedure.query(async ({ ctx }) => {
    return prisma.school.findMany({
      where: { university: { id: ctx.universityId! } },
      include: { _count: { select: { courses: true } } },
      orderBy: { name: 'asc' },
    });
  }),

  createSchool: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        code: z.string().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const school = await prisma.school.create({
        data: {
          universityId: ctx.universityId!,
          name: input.name,
          code: input.code,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'SCHOOL_CREATED',
          targetType: 'School',
          targetId: school.id,
          metadata: { name: input.name, code: input.code },
        },
      });

      return school;
    }),

  /** University Admin: get system policy. */
  getSystemPolicy: adminProcedure.query(async ({ ctx }) => {
    return prisma.systemPolicy.findFirst({
      where: { universityId: ctx.universityId! },
    });
  }),

  updateSystemPolicy: adminProcedure
    .input(
      z.object({
        maxResubmissionsPerAssignment: z.number().int().min(0).max(20).optional(),
        maxFileSizeMb: z.number().int().min(1).max(500).optional(),
        perCourseMonthlySpendingCapUsd: z.number().min(0).optional(),
        defaultLocale: z.enum(['en', 'he', 'ar']).optional(),
        defaultAutoReleaseConfidenceThreshold: z.number().min(0).max(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.systemPolicy.findFirst({
        where: { universityId: ctx.universityId! },
      });

      const policy = existing
        ? await prisma.systemPolicy.update({
            where: { id: existing.id },
            data: {
              ...(input.maxResubmissionsPerAssignment !== undefined && { maxResubmissionsPerAssignment: input.maxResubmissionsPerAssignment }),
              ...(input.maxFileSizeMb !== undefined && { maxFileSizeMb: input.maxFileSizeMb }),
              ...(input.defaultLocale !== undefined && { defaultLocale: input.defaultLocale }),
            },
          })
        : await prisma.systemPolicy.create({
            data: {
              universityId: ctx.universityId!,
              maxResubmissionsPerAssignment: input.maxResubmissionsPerAssignment ?? 5,
              maxFileSizeMb: input.maxFileSizeMb ?? 25,
              defaultLocale: input.defaultLocale ?? 'en',
            },
          });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'SYSTEM_POLICY_UPDATED',
          targetType: 'SystemPolicy',
          targetId: policy.id,
          metadata: input,
        },
      });

      return policy;
    }),

  /** University Admin: audit logs. */
  auditLogs: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
        actorId: z.string().optional(),
        action: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.actorId && { actorId: input.actorId }),
        ...(input.action && { action: input.action }),
        ...(input.startDate || input.endDate
          ? {
              createdAt: {
                ...(input.startDate && { gte: new Date(input.startDate) }),
                ...(input.endDate && { lte: new Date(input.endDate) }),
              },
            }
          : {}),
      };

      const [items, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: { actor: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.auditLog.count({ where }),
      ]);

      return { items, total };
    }),

  /** Super Admin: cross-tenant dashboard. */
  platformOverview: superAdminProcedure.query(async ({ ctx }) => {
    const [universities, totalUsers, totalSubmissions] = await Promise.all([
      prisma.university.findMany({ include: { _count: { select: { schools: true } } } }),
      prisma.user.count(),
      prisma.submission.count(),
    ]);

    return {
      universities,
      totalUsers,
      totalSubmissions,
      totalCostUsd: 0, // TODO: aggregate from UsageRecord
    };
  }),

  /** Super Admin: impersonate a user. */
  impersonate: superAdminProcedure
    .input(z.object({ userId: z.string(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const targetUser = await prisma.user.findUnique({ where: { id: input.userId } });
      if (!targetUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'IMPERSONATION_STARTED',
          targetType: 'User',
          targetId: input.userId,
          metadata: { reason: input.reason },
        },
      });

      return { sessionToken: '', targetUser: { id: targetUser.id, name: targetUser.name, email: targetUser.email } };
    }),

  /** Super Admin: feature flags. */
  getFeatureFlags: superAdminProcedure.query(async ({ ctx }) => {
    const config = await prisma.platformConfig.findFirst();
    return config?.featureFlagsJson ?? {};
  }),

  updateFeatureFlag: superAdminProcedure
    .input(
      z.object({
        flag: z.string(),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = await prisma.platformConfig.findFirst();
      if (!config) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Platform config not found' });
      }

      const flags = (config.featureFlagsJson ?? {}) as Record<string, boolean>;
      flags[input.flag] = input.enabled;

      await prisma.platformConfig.update({
        where: { id: config.id },
        data: { featureFlagsJson: flags, updatedById: ctx.userId! },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'FEATURE_FLAG_UPDATED',
          targetType: 'PlatformConfig',
          targetId: config.id,
          metadata: { flag: input.flag, enabled: input.enabled },
        },
      });

      return flags;
    }),

  /** Super Admin: update model routing. */
  updateModelConfig: superAdminProcedure
    .input(
      z.object({
        gradingModelFamily: z.string().optional(),
        gradingModelSnapshot: z.string().optional(),
        followUpChatModelFamily: z.string().optional(),
        followUpChatModelSnapshot: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = await prisma.platformConfig.findFirst();
      if (!config) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Platform config not found' });
      }

      const before = {
        gradingModelFamily: config.gradingModelFamily,
        gradingModelSnapshot: config.gradingModelSnapshot,
      };

      const updated = await prisma.platformConfig.update({
        where: { id: config.id },
        data: {
          ...(input.gradingModelFamily && { gradingModelFamily: input.gradingModelFamily }),
          ...(input.gradingModelSnapshot && { gradingModelSnapshot: input.gradingModelSnapshot }),
          updatedById: ctx.userId!,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'MODEL_CONFIG_UPDATED',
          targetType: 'PlatformConfig',
          targetId: config.id,
          metadata: { before, after: input },
        },
      });

      return updated;
    }),

  /** University Admin: list users with roles. */
  getUsers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(['STUDENT', 'UNIV_ADMIN', 'SUPER_ADMIN']).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        universityId: ctx.universityId!,
        ...(input.role && { systemRole: input.role }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { email: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            systemRole: true,
            twoFaEnabled: true,
            createdAt: true,
            roleAssignments: {
              select: { role: true, scopeType: true, scopeId: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.user.count({ where }),
      ]);

      return { items, total };
    }),
});
