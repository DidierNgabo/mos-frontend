export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OUTREACH_ADMIN: 'OUTREACH_ADMIN',
  NURSE: 'NURSE',
  DOCTOR: 'DOCTOR',
  DATA_CLERK: 'DATA_CLERK',
  PHARMACIST: 'PHARMACIST',
  EVANGELIST: 'EVANGELIST',
} as const;

export type RoleType = keyof typeof ROLES;

/**
 * Check if the user has at least one of the required roles.
 * @param userRoles - Array of roles the user has.
 * @param allowedRoles - Array of roles allowed to access a resource.
 * @returns boolean
 */
export const hasRequiredRole = (
  userRoles: string[] | undefined,
  allowedRoles: string[],
): boolean => {
  if (!userRoles || userRoles.length === 0) return false;

  // SUPER_ADMIN can see everything
  if (userRoles.includes(ROLES.SUPER_ADMIN)) return true;

  return userRoles.some((role) => allowedRoles.includes(role));
};
