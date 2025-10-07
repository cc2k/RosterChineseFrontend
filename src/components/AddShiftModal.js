import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../utils/roleUtils';

export default function AddShiftModal({ onClose, onAdd, roles }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [roleId, setRoleId] = useState('');
  const [recurrenceDays, setRecurrenceDays] = useState([]); // Array of selected days
  const [recurrenceType, setRecurrenceType] = useState('none'); // 'none' or 'weekly'
  const [error, setError] = useState(null);
  const { roles: userRoles } = useAuth();

  if (!hasRequiredRole(userRoles, 'admin')) {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h3>Access Denied</h3>
          <p>You do not have permission to create shifts.</p>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !startTime || !endTime || !roleId) {
      setError('All fields are required.');
      return;
    }
    setError(null);
    await onAdd({
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      role_id: roleId,
      recurrence: recurrenceType,
      recurrence_days: recurrenceDays
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Create New Shift</h3>
  <form onSubmit={handleSubmit} className="add-shift-form">
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          <label>End Date:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          <label>Start Time:</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          <label>End Time:</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
          <label>Role:</label>
          <select value={roleId} onChange={e => setRoleId(e.target.value)} required>
            <option value="">Select role...</option>
            {roles
              .filter(role => role.is_assignable)
              .map(role => (
                <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
              ))}
          </select>
          <label>Recurrence:</label>
          <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value)}>
            <option value="none">No recurrence</option>
            <option value="weekly">These days every week</option>
          </select>
          <div className="add-shift-days-box">
            <div className="add-shift-days-label">Select days:</div>
            <div className="add-shift-days-list">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <label key={day} className="add-shift-day-label">
                  <input
                    type="checkbox"
                    checked={recurrenceDays.includes(day)}
                    onChange={e => {
                      if (e.target.checked) {
                        setRecurrenceDays(prev => {
                          const updated = [...prev, day];
                          if (recurrenceType !== 'weekly') setRecurrenceType('weekly');
                          return updated;
                        });
                      } else {
                        setRecurrenceDays(prev => prev.filter(d => d !== day));
                      }
                    }}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
          <div className="add-shift-btn-row">
            <button type="submit">Create</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
