/**
 * Root tRPC router — aggregates all sub-routers.
 * Per §5.4: tRPC handles all internal client-server calls.
 */

import { createTRPCRouter } from './trpc';
import { courseRouter } from './routers/course';
import { assignmentRouter } from './routers/assignment';
import { submissionRouter } from './routers/submission';
import { gradeRouter } from './routers/grade';
import { materialRouter } from './routers/material';
import { userRouter } from './routers/user';
import { analyticsRouter } from './routers/analytics';
import { adminRouter } from './routers/admin';
import { chatRouter } from './routers/chat';
import { appealRouter } from './routers/appeal';

export const appRouter = createTRPCRouter({
  course: courseRouter,
  assignment: assignmentRouter,
  submission: submissionRouter,
  grade: gradeRouter,
  material: materialRouter,
  user: userRouter,
  analytics: analyticsRouter,
  admin: adminRouter,
  chat: chatRouter,
  appeal: appealRouter,
});

export type AppRouter = typeof appRouter;
