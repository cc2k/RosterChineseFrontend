import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../utils/roleUtils';

export default function RoleSelector({ selectedRoles, setSelectedRoles }) {
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { roles: userRoles } = useAuth();

  useEffect(() => {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      fetch(`${apiUrl}/api/roles`)
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

  if (!hasRequiredRole(userRoles, 'admin')) {
    return (
      <div className="role-selector-no-permission">
        You do not have permission to select roles.
      </div>
    );
  }

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
    <div className="role-selector-dropdown" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="role-selector-btn"
      >
        <span className={`role-selector-selected ${selectedNames ? '' : 'role-selector-placeholder'}`}>
          {selectedNames || 'Select roles'}
        </span>
        <span className="role-selector-arrow">&#9662;</span>
      </button>
      {open && (
        <div className="role-selector-list">
          {roles
            .filter(role => role.role_name !== 'superadmin' || (userRoles && userRoles.includes('superadmin')))
            .map(role => (
              <label key={role.role_id} className="role-selector-label">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.role_id)}
                  onChange={() => handleChange(role.role_id)}
                  className="role-selector-checkbox"
                />
                <span className="role-selector-name">{role.role_name}</span>
              </label>
            ))}
        </div>
      )}
    </div>
  );
}
