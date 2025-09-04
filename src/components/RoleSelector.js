import React, { useState, useEffect } from 'react';

export default function RoleSelector({ selectedRoles, setSelectedRoles }) {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/roles')
      .then(res => res.json())
      .then(data => setRoles(data));
  }, []);

  const handleChange = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {roles.map(role => (
        <label key={role.role_id} style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={selectedRoles.includes(role.role_id)}
            onChange={() => handleChange(role.role_id)}
          />
          {role.role_name}
        </label>
      ))}
    </div>
  );
}
