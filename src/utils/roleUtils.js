// Utility for hierarchical role checks
export function hasRequiredRole(roles, requiredRole) {
  const roleHierarchy = ['user', 'test', 'admin', 'superadmin'];
  if (!roles || roles.length === 0) return false;
  const userHighestRole = roleHierarchy.reduce(
    (highest, role) =>
      roles.includes(role) && roleHierarchy.indexOf(role) > roleHierarchy.indexOf(highest)
        ? role
        : highest,
    roles[0]
  );
  return roleHierarchy.indexOf(userHighestRole) >= roleHierarchy.indexOf(requiredRole);
}
