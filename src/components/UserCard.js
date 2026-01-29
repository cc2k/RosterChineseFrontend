import React from 'react';
import '../css/UserPage.css';
import '../css/UserCard.css';

export default function UserCard({ user, roles, onEdit, onDelete, onShowShifts }) {
  // Show 'admin' for superadmins if assigned, but never show 'superadmin' unless viewer is superadmin
  let displayRoles = user.roles;
  // Debug logging for roles
  console.log('[UserCard] user:', user.username, 'user.roles:', user.roles, 'displayRoles:', displayRoles);
  if (Array.isArray(user.roles)) {
    if (user.roles.includes('superadmin')) {
      if (roles && roles.includes('superadmin')) {
        // If viewer is superadmin, show all roles
        displayRoles = user.roles;
      } else {
        // If viewer is NOT superadmin, only show 'admin' if present, and all other non-superadmin roles
        displayRoles = user.roles.filter(role => role !== 'superadmin');
        // If no roles left, show 'user' as fallback
        if (displayRoles.length === 0) displayRoles = ['user'];
      }
    } else {
      // Hide 'superadmin' unless viewer is superadmin
      displayRoles = user.roles.filter(role => role !== 'superadmin' || (roles && roles.includes('superadmin')));
    }
  }
  return (
    <div className="user-card">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="user-card-header">
          <h3>{user.name || user.username}</h3>
          <span style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {Array.isArray(displayRoles)
              ? displayRoles.map(role => (
                  <span key={role} className="user-role-pill">{role}</span>
                ))
              : displayRoles || ''}
          </span>
        </div>
        <div className="user-card-body">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.telephone && <p><strong>Telephone:</strong> {user.telephone}</p>}
        </div>
      </div>
      <div className="user-card-actions">
        <button onClick={() => onShowShifts(user)} title="Edit Shifts">Shifts</button>
        {(roles.includes('admin') || roles.includes('superadmin')) && (
          <>
            <button onClick={() => onEdit(user)} title="Edit">Edit</button>
            <button className="delete-btn" onClick={() => onDelete(user)} title="Delete">Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
