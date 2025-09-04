import React, { useState } from 'react';

export default function UserEditPopup({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    roles: user.roles || [],
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          <input name="roles" value={form.roles} onChange={handleChange} />
        </label>
        <br/>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </div>
  );
}
