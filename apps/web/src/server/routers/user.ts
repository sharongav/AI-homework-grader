import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';

export const userRouter = createTRPCRouter({
  /** Get the current user's profile. */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId! },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        timezone: true,
        systemRole: true,
        twoFaEnabled: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    return user;
  }),

  /** Update own profile. */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200).optional(),
        locale: z.enum(['en', 'he', 'ar']).optional(),
        timezone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await prisma.user.update({
        where: { id: ctx.userId! },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.locale && { locale: input.locale }),
          ...(input.timezone && { timezone: input.timezone }),
        },
        select: { id: true, name: true, locale: true, timezone: true },
      });
      return updated;
    }),

  /** Admin: list all users with pagination and filters. */
  list: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(ctx.universityId && { universityId: ctx.universityId }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { email: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
        ...(input.role && { systemRole: input.role as 'STUDENT' | 'UNIV_ADMIN' | 'SUPER_ADMIN' }),
      };

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            systemRole: true,
            createdAt: true,
            twoFaEnabled: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.user.count({ where }),
      ]);

      return { items, total };
    }),

  /** Admin: assign a role to a user in a specific context. */
  assignRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['GRADER', 'TA', 'PROFESSOR', 'HEAD_OF_COURSE', 'SCHOOL_MANAGER']),
        scopeType: z.enum(['COURSE', 'SCHOOL']),
        scopeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const assignment = await prisma.roleAssignment.create({
        data: {
          userId: input.userId,
          role: input.role,
          scopeType: input.scopeType,
          scopeId: input.scopeId,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'ROLE_ASSIGNED',
          targetType: 'User',
          targetId: input.userId,
          metadata: { role: input.role, scopeType: input.scopeType, scopeId: input.scopeId },
        },
      });

      return assignment;
    }),

  /** Admin: remove a role assignment. */
  removeRole: adminProcedure
    .input(z.object({ roleAssignmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.roleAssignment.findUnique({
        where: { id: input.roleAssignmentId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Role assignment not found' });
      }

      await prisma.roleAssignment.delete({ where: { id: input.roleAssignmentId } });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'ROLE_REMOVED',
          targetType: 'User',
          targetId: existing.userId,
          metadata: { role: existing.role, roleAssignmentId: input.roleAssignmentId },
        },
      });

      return { success: true };
    }),

  /** Get current user's role assignments across all scopes. */
  listRoleAssignments: protectedProcedure.query(async ({ ctx }) => {
    return prisma.roleAssignment.findMany({
      where: { userId: ctx.userId! },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /** Update user's timezone preference. */
  updateTimezone: protectedProcedure
    .input(z.object({ timezone: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: { id: ctx.userId! },
        data: { timezone: input.timezone },
        select: { id: true, timezone: true },
      });
    }),
});
