import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/root';
import type { TRPCContext } from '@/server/trpc';

function createContext(): TRPCContext {
  // TODO: Phase 2 — extract session from Clerk/NextAuth
  return {
    userId: null,
    universityId: null,
    userRole: null,
    effectiveRoles: [],
  };
}

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });
}

export { handler as GET, handler as POST };
