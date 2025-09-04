import React from 'react';

export default function UserDeletePopup({ user, onClose, onDelete }) {
  return (
    <div className="user-popup-overlay" onClick={onClose}>
      <div className="user-popup" onClick={e => e.stopPropagation()}>
        <h3>Delete User</h3>
        <p>Are you sure you want to delete <strong>{user.username}</strong>?</p>
        <button onClick={() => onDelete(user.user_id)} style={{ background: '#d32f2f', color: '#fff' }}>Delete</button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </div>
  );
}
