import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../utils/roleUtils';

export default function UserDeletePopup({ user, onClose, onDelete }) {
  const { roles } = useAuth();
  if (!hasRequiredRole(roles, 'admin')) {
    return (
      <div className="user-popup-overlay" onClick={onClose}>
        <div className="user-popup" onClick={e => e.stopPropagation()}>
          <h3>Access Denied</h3>
          <p>You do not have permission to delete users.</p>
          <button className="user-popup-btn user-popup-btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  return (
    <div className="user-popup-overlay" onClick={onClose}>
      <div className="user-popup" onClick={e => e.stopPropagation()}>
        <h3>Delete User</h3>
        <p>Are you sure you want to delete <strong>{user.username}</strong>?</p>
  <button className="user-popup-btn user-popup-btn-delete" onClick={() => onDelete(user.user_id)}>Delete</button>
  <button className="user-popup-btn user-popup-btn-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
