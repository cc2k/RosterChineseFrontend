import React, { useState } from 'react';
import RoleSelector from './RoleSelector';

export default function UserEditPopup({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    roles: user.roles || [],
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setSelectedRoles = (roles) => {
    setForm({ ...form, roles });
  };

  const handleSave = () => {
    onSave({ ...user, ...form });
  };

  return (
    <div className="user-popup-overlay" onClick={onClose}>
      <div className="user-popup" onClick={e => e.stopPropagation()}>
        <h3>Edit User</h3>
        <label>Username:<br/>
          <input name="username" value={form.username} onChange={handleChange} />
        </label>
        <br/>
        <label>Email:<br/>
          <input name="email" value={form.email} onChange={handleChange} />
        </label>
        <br/>
        <label>Roles:<br/>
          <RoleSelector selectedRoles={form.roles} setSelectedRoles={setSelectedRoles} />
        </label>
        <br/>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
