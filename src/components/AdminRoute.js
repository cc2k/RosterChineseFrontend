import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContext';
import AccessDenied from './AccessDenied';

export default function AdminRoute({ children }) {
  const { isLoggedIn, roles } = useAuth();
  const toast = useToast();
  const [showDenied, setShowDenied] = React.useState(false);
  // Hierarchical role logic: superadmin > admin > test > user
  const roleHierarchy = ['user', 'test', 'admin', 'superadmin'];
  const requiredRole = 'admin';
  // Find highest role of current user
  const userHighestRole = roles && roles.length > 0
    ? roleHierarchy.reduce((highest, role) => roles.includes(role) && roleHierarchy.indexOf(role) > roleHierarchy.indexOf(highest) ? role : highest, roles[0])
    : null;
  React.useEffect(() => {
    if (!isLoggedIn) return;
    if (!userHighestRole || roleHierarchy.indexOf(userHighestRole) < roleHierarchy.indexOf(requiredRole)) {
      if (toast) toast.showToast('Access denied: Admins only');
      setShowDenied(true);
    } else {
      setShowDenied(false);
    }
  }, [toast, isLoggedIn, userHighestRole]);
  if (!isLoggedIn) {
    window.location.href = '/login';
    return null;
  }
  if (showDenied) {
    return <AccessDenied message="Access denied. Admins only." />;
  }
  return children;
}
