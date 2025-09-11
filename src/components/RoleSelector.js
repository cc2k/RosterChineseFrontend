import React, { useState, useEffect, useRef } from 'react';

export default function RoleSelector({ selectedRoles, setSelectedRoles }) {
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/roles')
      .then(res => res.json())
      .then(data => setRoles(data));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleChange = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const selectedNames = roles
    .filter(role => selectedRoles.includes(role.role_id))
    .map(role => role.role_name)
    .join(', ');

  return (
  <div style={{ position: 'relative', width: 220, textAlign: 'left', padding: 0, margin: 0 }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width: '100%', textAlign: 'left', padding: '4px 6px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', margin: 0 }}
      >
        <span style={{ flex: 1, textAlign: 'left', color: selectedNames ? '#222' : '#888', display: 'block', margin: 0, padding: 0 }}>
          {selectedNames || 'Select roles'}
        </span>
        <span style={{ marginLeft: 8, textAlign: 'left', margin: 0, padding: 0 }}>&#9662;</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#fff', border: '1px solid #ccc', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10, marginTop: 2, maxHeight: 200, overflowY: 'auto', padding: 0, textAlign: 'left' }}>
          {roles.map(role => (
            <label key={role.role_id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              padding: '4px 8px',
              textAlign: 'left',
              width: '100%',
              justifyContent: 'flex-start',
              margin: '0 0 4px 0',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#fafbfc',
              boxSizing: 'border-box',
              cursor: 'pointer',
              transition: 'border 0.2s'
            }}>
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.role_id)}
                onChange={() => handleChange(role.role_id)}
                style={{ margin: 0, marginRight: 5, marginBottom: 2, textAlign: 'left', accentColor: '#1976d2', padding: 0, width: 16, height: 16 }}
              />
              <span style={{ textAlign: 'left', minWidth: 0, flex: 1, display: 'inline-block', margin: 0, padding: 0, lineHeight: '16px' }}>{role.role_name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
