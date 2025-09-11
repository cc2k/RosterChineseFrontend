import React from 'react';

export default function DayPopup({ day, users, freeShifts, onClose, onFreeShiftClick }) {
  // Find users working for the selected day
  const working = [];
  users.forEach(u => {
    if (u.datesWorking) {
      u.datesWorking.forEach(d => {
        if (d.date === day.date) {
          working.push({ username: u.username, position: d.position });
        }
      });
    }
  });
  // Find free shifts for the selected day
  const dayFreeShifts = freeShifts.filter(shift => shift.date === day.date);
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 1999
        }}
        onClick={onClose}
      ></div>
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '30px',
          zIndex: 2000,
          minWidth: '300px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3>{day.label} ({day.date})</h3>
        <p><strong>Working:</strong></p>
        <ul>
          {working.length > 0 ? working.map((u, idx) => (
            <li key={idx}>{u.username} <span style={{color:'#888'}}>({u.position})</span></li>
          )) : <li>No one working</li>}
        </ul>
        <p><strong>Free Shifts:</strong></p>
        <ul>
          {dayFreeShifts.length > 0 ? dayFreeShifts.map((shift, idx) => (
            <li key={idx}>
              <button
                style={{
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
                onClick={() => onFreeShiftClick(day, shift)}
              >
                {shift.position}
              </button>
            </li>
          )) : <li>No free shifts</li>}
        </ul>
        <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
      </div>
    </>
  );
}
