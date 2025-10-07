
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../utils/roleUtils';
import '../css/ShiftsPage.css';

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  // Pad month and day to 2 digits
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function EditShiftModal({ shift, roles, onClose, onSave }) {
  const [shiftDate, setShiftDate] = useState(formatDateForInput(shift.shift_date));
  const [startTime, setStartTime] = useState(shift.start_time || '');
  const [endTime, setEndTime] = useState(shift.end_time || '');
  const [roleId, setRoleId] = useState(shift.role_id || '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const { user, roles: userRoles } = useAuth();

  if (!hasRequiredRole(userRoles, 'admin')) {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h3>Access Denied</h3>
          <p>You do not have permission to edit shifts.</p>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shiftDate || !startTime || !endTime || !roleId || !reason) {
      setError('All fields and reason are required.');
      return;
    }
    setError(null);
    await onSave({
      shift_id: shift.shift_id,
      shift_date: shiftDate,
      start_time: startTime,
      end_time: endTime,
      role_id: roleId,
      reason,
      editor_user_id: user?.user_id
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Edit Shift</h3>
  <form onSubmit={handleSubmit} className="edit-shift-form">
          <label>Date:</label>
          <input type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} required />
          <label>Start Time:</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          <label>End Time:</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
          <label>Role:</label>
          <select value={roleId} onChange={e => setRoleId(e.target.value)} required>
            <option value="">Select role...</option>
            {roles.map(role => (
              <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
            ))}
          </select>
          <label>Reason for update:</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={2} className="edit-shift-textarea" />
          {error && <div className="error-text">{error}</div>}
          <div className="edit-shift-btn-row">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
