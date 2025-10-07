import React from 'react';

export default function FreeShiftPopup({ day, shift, onClose, onTakeShift }) {
  return (
    <>
      <div className="free-shift-overlay" onClick={onClose}></div>
      <div className="free-shift-popup" onClick={e => e.stopPropagation()}>
        <h3>Take Shift</h3>
        <p>
          Do you want to work on <strong>{day.label} ({day.date})</strong> as <strong>{shift.position}</strong>?
        </p>
        <button className="free-shift-btn free-shift-btn-yes" onClick={() => onTakeShift(day, shift)}>
          Yes, I want this shift
        </button>
        <button className="free-shift-btn free-shift-btn-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </>
  );
}
