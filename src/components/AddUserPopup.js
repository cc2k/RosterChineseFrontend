import React, { useState } from 'react';
import RoleSelector from './RoleSelector';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../utils/roleUtils';

export default function AddUserPopup({ onClose, onAdd }) {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const { roles } = useAuth();

  if (!hasRequiredRole(roles, 'admin')) {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h3>Access Denied</h3>
          <p>You do not have permission to add users.</p>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate username from first 3 of firstName and first 3 of surname
    const genUsername = (firstName.slice(0,3) + surname.slice(0,3)).toLowerCase();
    if (!firstName || !surname || !email || selectedRoles.length === 0) return;
    onAdd({
      username: genUsername,
      name: firstName + ' ' + surname,
      email,
      telephone,
      roles: selectedRoles
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Add New User</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          <label>Surname:</label>
          <input type="text" value={surname} onChange={e => setSurname(e.target.value)} required />
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Telephone:</label>
          <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} />
          <label>Roles:</label>
          <RoleSelector selectedRoles={selectedRoles} setSelectedRoles={setSelectedRoles} />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button type="submit">Add</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
