


import React from 'react';
import '../css/RosterPage.css';
import ShiftCard from './ShiftCard';
import { SHIFT_COLOR_DEFINITIONS } from './shiftColors';


export default function DaysBar({ weekDays, users, freeShifts, currentUser, onDayClick, onPrevWeek, onNextWeek, prevDisabled, nextDisabled, shiftColors }) {
  // Helper for colored or plain style
  const getStyle = (type) => {
    // Only enable colors for 'on', 'true', '1' (as string, case-insensitive)
    let enabled = false;
    if (typeof shiftColors === 'string') {
      const val = shiftColors.trim().toLowerCase();
      enabled = val === 'on' || val === 'true' || val === '1';
    } else if (typeof shiftColors === 'number') {
      enabled = shiftColors === 1;
    } else if (shiftColors === true) {
      enabled = true;
    }
    if (!enabled) return {};
    const def = SHIFT_COLOR_DEFINITIONS.find(d => d.key === type);
    if (!def) return {};
    return { background: def.background, color: def.color, borderRadius: '6px', padding: '4px 8px', margin: '4px 0', fontSize: '1.1rem' };
  };

  return (
    <>
      <div className="week-arrows-top">
        <button
          className="week-arrow left"
          onClick={onPrevWeek}
          disabled={prevDisabled}
          aria-label="Previous Week"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="20,8 12,16 20,24" stroke="#007bff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ marginLeft: 6, fontSize: '1.1rem', color: '#007bff', verticalAlign: 'middle' }}>Prev</span>
        </button>
        <button
          className="week-arrow right"
          onClick={onNextWeek}
          disabled={nextDisabled}
          aria-label="Next Week"
        >
          <span style={{ marginRight: 6, fontSize: '1.1rem', color: '#007bff', verticalAlign: 'middle' }}>Next</span>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="12,8 20,16 12,24" stroke="#007bff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="days-bar">
        {weekDays.map(day => {
          const takenShifts = [];
          let userShift = null;
          let userFree = false;
          users.forEach(u => {
            if (u.datesWorking) {
              u.datesWorking.forEach(d => {
                if (d.date && d.date.slice(0, 10) === day.date) {
                  if (u.username === currentUser) {
                    userShift = d.position;
                  } else {
                    takenShifts.push({ username: u.username, position: d.position });
                  }
                }
              });
            }
            if (u.username === currentUser && u.datesFree) {
              u.datesFree.forEach(free => {
                if (free.date === day.date) {
                  userFree = true;
                }
              });
            }
          });
          const openShifts = freeShifts.filter(shift => shift.date === day.date);
          return (
            <div
              key={day.date}
              className="weekday-square"
              onClick={() => onDayClick(day)}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                {day.label}<br /><span style={{ fontSize: '1rem', fontWeight: 'normal' }}>{day.date}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {userFree && (
                  <ShiftCard style={getStyle('free')}>You want to be free</ShiftCard>
                )}
                {userShift && (
                  <ShiftCard style={getStyle('user')}>{userShift} (You)</ShiftCard>
                )}
                {takenShifts.map((shift, idx) => (
                  <ShiftCard key={idx} style={getStyle('taken')}>
                    {shift.position} ({shift.username})
                  </ShiftCard>
                ))}
                {openShifts.map((shift, idx) => (
                  <ShiftCard key={idx} style={getStyle('open')}>
                    {shift.position} (Open)
                  </ShiftCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
// (removed duplicate and misplaced code)
