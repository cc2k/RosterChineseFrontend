import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContext';
import AccessDenied from './AccessDenied';

export default function AdminRoute({ children }) {
  const { isLoggedIn, roles } = useAuth();
  const toast = useToast();
  const [showDenied, setShowDenied] = React.useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!isLoggedIn) return;
    if (!roles || !roles.includes('admin')) {
      if (toast) toast.showToast('Access denied: Admins only');
      setShowDenied(true);
    } else {
      setShowDenied(false);
    }
  }, [toast]);
  if (!isLoggedIn) {
    window.location.href = '/login';
    return null;
  }
  if (showDenied) {
    return <AccessDenied message="Access denied. Admins only." />;
  }
  return children;
}
