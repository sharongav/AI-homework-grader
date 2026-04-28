/**
 * tRPC server initialization.
 * Per §5.4: tRPC for internal client-server calls; REST for LMS integration.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';

export type TRPCContext = {
  userId: string | null;
  universityId: string | null;
  userRole: string | null;
  /** Effective roles in the current course/school context */
  effectiveRoles: string[];
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Authenticated procedure — requires a valid session.
 * Per Hard Rule: wire authorization into every tRPC procedure.
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

/**
 * Staff-only procedure — requires staff role (Grader, TA, Professor, Head of Course, School Manager, University Admin, Super Admin).
 */
export const staffProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const staffRoles = [
    'GRADER',
    'TEACHING_ASSISTANT',
    'PROFESSOR',
    'HEAD_OF_COURSE',
    'SCHOOL_MANAGER',
    'UNIVERSITY_ADMIN',
    'SUPER_ADMIN',
  ];

  const isStaff = ctx.effectiveRoles.some((r) => staffRoles.includes(r));
  if (!isStaff) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Staff access required',
    });
  }
  return next({ ctx });
});

/**
 * Admin procedure — requires University Admin or Super Admin.
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const adminRoles = ['UNIVERSITY_ADMIN', 'SUPER_ADMIN'];
  const isAdmin = ctx.effectiveRoles.some((r) => adminRoles.includes(r));
  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next({ ctx });
});

/**
 * Super Admin only procedure.
 */
export const superAdminProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.effectiveRoles.includes('SUPER_ADMIN')) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Super Admin access required',
      });
    }
    return next({ ctx });
  },
);
