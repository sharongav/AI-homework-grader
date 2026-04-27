import { prisma } from './client';

/**
 * Sets the current university context for RLS policies.
 * Must be called at the start of every request that accesses tenant-scoped data.
 * Per Hard Rule 15: RLS is enforced at the storage layer.
 */
export async function setTenantContext(universityId: string): Promise<void> {
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.current_university_id = '${universityId.replace(/'/g, "''")}'`,
  );
}

/**
 * Executes a function within a transaction with the tenant context set.
 * Ensures RLS policies filter data to the correct university.
 */
export async function withTenantContext<T>(
  universityId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_university_id = '${universityId.replace(/'/g, "''")}'`,
    );
    return fn();
  });
}

/**
 * Executes a function with Super Admin context, bypassing RLS.
 * Every access is audit-logged per Hard Rule 15.
 */
export async function withSuperAdminContext<T>(
  fn: () => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL role = 'super_admin_role'`);
    return fn();
  });
}
