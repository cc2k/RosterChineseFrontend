import React from 'react';

export default function FreeShiftPopup({ day, shift, onClose, onTakeShift }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 2999
        }}
        onClick={onClose}
      ></div>
      <div
        style={{
          position: 'fixed',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -40%)',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '30px',
          zIndex: 3000,
          minWidth: '300px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3>Take Shift</h3>
        <p>
          Do you want to work on <strong>{day.label} ({day.date})</strong> as <strong>{shift.position}</strong>?
        </p>
        <button
          style={{ marginRight: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
          onClick={() => onTakeShift(day, shift)}
        >
          Yes, I want this shift
        </button>
        <button onClick={onClose} style={{ background: '#f0f0f0', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </>
  );
}
