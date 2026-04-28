import { ROLE_PERMISSIONS } from './permissions';

export interface PermissionCheck {
  userId: string;
  systemRole: string;
  courseRoles: Array<{ role: string; scopeType: string; scopeId: string }>;
}

/**
 * Check if a user has a specific permission for a given scope.
 * Checks system role first, then course-level role assignments.
 */
export function checkPermission(
  user: PermissionCheck,
  action: string,
  scopeId?: string,
): boolean {
  // Super Admin can do everything
  if (user.systemRole === 'SUPER_ADMIN') {
    return true;
  }

  // Check system role permissions (UNIV_ADMIN)
  const systemPerms = ROLE_PERMISSIONS[user.systemRole];
  if (systemPerms?.has(action)) {
    return true;
  }

  // Check course/school role permissions
  for (const roleAssignment of user.courseRoles) {
    const rolePerms = ROLE_PERMISSIONS[roleAssignment.role];
    if (!rolePerms?.has(action)) continue;

    // If no scope required, any matching role works
    if (!scopeId) return true;

    // Check scope match
    if (roleAssignment.scopeId === scopeId) return true;
  }

  return false;
}

/**
 * Check if user has a specific role in a specific scope.
 */
export function hasRole(
  user: PermissionCheck,
  role: string,
  scopeId?: string,
): boolean {
  if (user.systemRole === role) return true;

  return user.courseRoles.some(
    (ra: any) => ra.role === role && (!scopeId || ra.scopeId === scopeId),
  );
}

/**
 * Get all effective roles for a user, including system role and course roles.
 */
export function getUserEffectiveRoles(user: PermissionCheck): string[] {
  const roles = new Set<string>();
  roles.add(user.systemRole);

  for (const ra of user.courseRoles) {
    roles.add(ra.role);
  }

  return Array.from(roles);
}
