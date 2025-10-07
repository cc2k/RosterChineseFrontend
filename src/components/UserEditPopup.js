import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../utils/roleUtils';
import RoleSelector from './RoleSelector';

export default function UserEditPopup({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    username: user.username ?? '',
    email: user.email ?? '',
    roles: user.roles || [],
  });
  const { roles, refetchUser } = useAuth();

  if (!hasRequiredRole(roles, 'admin')) {
    return (
      <div className="user-popup-overlay" onClick={onClose}>
        <div className="user-popup" onClick={e => e.stopPropagation()}>
          <h3>Access Denied</h3>
          <p>You do not have permission to edit users.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setSelectedRoles = (roles) => {
    setForm({ ...form, roles });
  };

  const handleSave = async () => {
    await onSave({ ...user, ...form });
    if (refetchUser) {
      refetchUser();
    }
  };

  return (
    <div className="user-popup-overlay" onClick={onClose}>
      <div className="user-popup" onClick={e => e.stopPropagation()}>
        <h3>Edit User</h3>
        <label>Username:<br/>
          <input name="username" value={form.username ?? ''} onChange={handleChange} />
        </label>
        <br/>
        <label>Email:<br/>
          <input name="email" value={form.email ?? ''} onChange={handleChange} />
        </label>
        <br/>
        <label>Roles:<br/>
          <RoleSelector selectedRoles={form.roles} setSelectedRoles={setSelectedRoles} />
        </label>
        <br/>
        <div className="user-edit-btn-row">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
