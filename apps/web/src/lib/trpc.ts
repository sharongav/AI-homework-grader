/**
 * tRPC React client for use in client components.
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/root';
import type { CreateTRPCReact } from '@trpc/react-query';

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();
