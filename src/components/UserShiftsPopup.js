import React from 'react';
import UserDefaultSchedule from './UserDefaultSchedule';
import UserShiftsEditor from './UserShiftsEditor';

export default function UserShiftsPopup({ user, onClose }) {
  // Placeholder: you can pass in user shifts/defaultSchedule as needed
  return (
    <div className="user-popup-overlay" onClick={onClose}>
      <div className="user-popup" onClick={e => e.stopPropagation()}>
        <h3>Manage Shifts for {user.username}</h3>
        <UserDefaultSchedule user={user} defaultSchedule={user.defaultSchedule} onChange={() => {}} />
        <UserShiftsEditor user={user} shifts={user.shifts} onChange={() => {}} />
        <div className="user-shifts-btn-row">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
