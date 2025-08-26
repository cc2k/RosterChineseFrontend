import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import initialUsers from '../data/users.json';
import '../css/RosterPage.css';

// Helper to get all Mondays in a month
function getMondays(year, month) {
  const mondays = [];
  const date = new Date(year, month, 1);
  // Find first Monday
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  while (date.getMonth() === month) {
    mondays.push(new Date(date));
    date.setDate(date.getDate() + 7);
  }
  return mondays;
}

// Helper to get week dates (Mon-Sun) for a given Monday
function getWeekDates(monday) {
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toISOString().slice(0, 10)
    });
  }
  return week;
}

// Initial free shifts for testing (2025 and 2026)
const initialFreeShifts = [
  // 2025
  { "date": "2025-01-02", "position": "restaurant" }, { "date": "2025-01-09", "position": "driver" }, { "date": "2025-01-16", "position": "kitchen" },
  { "date": "2025-02-06", "position": "take-out" }, { "date": "2025-02-13", "position": "restaurant" }, { "date": "2025-02-20", "position": "driver" },
  { "date": "2025-03-06", "position": "kitchen" }, { "date": "2025-03-13", "position": "take-out" }, { "date": "2025-03-20", "position": "restaurant" },
  { "date": "2025-04-03", "position": "driver" }, { "date": "2025-04-10", "position": "kitchen" }, { "date": "2025-04-17", "position": "take-out" },
  { "date": "2025-05-01", "position": "restaurant" }, { "date": "2025-05-08", "position": "driver" }, { "date": "2025-05-15", "position": "kitchen" },
  { "date": "2025-06-05", "position": "take-out" }, { "date": "2025-06-12", "position": "restaurant" }, { "date": "2025-06-19", "position": "driver" },
  { "date": "2025-07-03", "position": "kitchen" }, { "date": "2025-07-10", "position": "take-out" }, { "date": "2025-07-17", "position": "restaurant" },
  { "date": "2025-08-07", "position": "driver" }, { "date": "2025-08-14", "position": "kitchen" }, { "date": "2025-08-21", "position": "take-out" },
  { "date": "2025-09-04", "position": "restaurant" }, { "date": "2025-09-11", "position": "driver" }, { "date": "2025-09-18", "position": "kitchen" },
  { "date": "2025-10-02", "position": "take-out" }, { "date": "2025-10-09", "position": "restaurant" }, { "date": "2025-10-16", "position": "driver" },
  { "date": "2025-11-06", "position": "kitchen" }, { "date": "2025-11-13", "position": "take-out" }, { "date": "2025-11-20", "position": "restaurant" },
  { "date": "2025-12-04", "position": "driver" }, { "date": "2025-12-11", "position": "kitchen" }, { "date": "2025-12-18", "position": "take-out" },
  { "date": "2025-01-23", "position": "restaurant" }, { "date": "2025-02-27", "position": "driver" }, { "date": "2025-03-27", "position": "kitchen" },
  { "date": "2025-04-24", "position": "take-out" }, { "date": "2025-05-22", "position": "restaurant" }, { "date": "2025-06-26", "position": "driver" },
  { "date": "2025-07-24", "position": "kitchen" }, { "date": "2025-08-28", "position": "take-out" }, { "date": "2025-09-25", "position": "restaurant" },
  { "date": "2025-10-23", "position": "driver" }, { "date": "2025-11-27", "position": "kitchen" }, { "date": "2025-12-25", "position": "take-out" },
  { "date": "2025-01-30", "position": "restaurant" }, { "date": "2025-02-20", "position": "driver" }, { "date": "2025-03-20", "position": "kitchen" },
  { "date": "2025-04-17", "position": "take-out" }, { "date": "2025-05-15", "position": "restaurant" }, { "date": "2025-06-19", "position": "driver" },
  { "date": "2025-07-17", "position": "kitchen" }, { "date": "2025-08-21", "position": "take-out" }, { "date": "2025-09-18", "position": "restaurant" },
  { "date": "2025-10-16", "position": "driver" }, { "date": "2025-11-20", "position": "kitchen" }, { "date": "2025-12-18", "position": "take-out" },
  // 2026 (same pattern as 2025)
  { "date": "2026-01-02", "position": "restaurant" }, { "date": "2026-01-09", "position": "driver" }, { "date": "2026-01-16", "position": "kitchen" },
  { "date": "2026-02-06", "position": "take-out" }, { "date": "2026-02-13", "position": "restaurant" }, { "date": "2026-02-20", "position": "driver" },
  { "date": "2026-03-06", "position": "kitchen" }, { "date": "2026-03-13", "position": "take-out" }, { "date": "2026-03-20", "position": "restaurant" },
  { "date": "2026-04-03", "position": "driver" }, { "date": "2026-04-10", "position": "kitchen" }, { "date": "2026-04-17", "position": "take-out" },
  { "date": "2026-05-01", "position": "restaurant" }, { "date": "2026-05-08", "position": "driver" }, { "date": "2026-05-15", "position": "kitchen" },
  { "date": "2026-06-05", "position": "take-out" }, { "date": "2026-06-12", "position": "restaurant" }, { "date": "2026-06-19", "position": "driver" },
  { "date": "2026-07-03", "position": "kitchen" }, { "date": "2026-07-10", "position": "take-out" }, { "date": "2026-07-17", "position": "restaurant" },
  { "date": "2026-08-07", "position": "driver" }, { "date": "2026-08-14", "position": "kitchen" }, { "date": "2026-08-21", "position": "take-out" },
  { "date": "2026-09-04", "position": "restaurant" }, { "date": "2026-09-11", "position": "driver" }, { "date": "2026-09-18", "position": "kitchen" },
  { "date": "2026-10-02", "position": "take-out" }, { "date": "2026-10-09", "position": "restaurant" }, { "date": "2026-10-16", "position": "driver" },
  { "date": "2026-11-06", "position": "kitchen" }, { "date": "2026-11-13", "position": "take-out" }, { "date": "2026-11-20", "position": "restaurant" },
  { "date": "2026-12-04", "position": "driver" }, { "date": "2026-12-11", "position": "kitchen" }, { "date": "2026-12-18", "position": "take-out" },
  { "date": "2026-01-23", "position": "restaurant" }, { "date": "2026-02-27", "position": "driver" }, { "date": "2026-03-27", "position": "kitchen" },
  { "date": "2026-04-24", "position": "take-out" }, { "date": "2026-05-22", "position": "restaurant" }, { "date": "2026-06-26", "position": "driver" },
  { "date": "2026-07-24", "position": "kitchen" }, { "date": "2026-08-28", "position": "take-out" }, { "date": "2026-09-25", "position": "restaurant" },
  { "date": "2026-10-23", "position": "driver" }, { "date": "2026-11-27", "position": "kitchen" }, { "date": "2026-12-25", "position": "take-out" },
  { "date": "2026-01-30", "position": "restaurant" }, { "date": "2026-02-20", "position": "driver" }, { "date": "2026-03-20", "position": "kitchen" },
  { "date": "2026-04-17", "position": "take-out" }, { "date": "2026-05-15", "position": "restaurant" }, { "date": "2026-06-19", "position": "driver" },
  { "date": "2026-07-17", "position": "kitchen" }, { "date": "2026-08-21", "position": "take-out" }, { "date": "2026-09-18", "position": "restaurant" },
  { "date": "2026-10-16", "position": "driver" }, { "date": "2026-11-20", "position": "kitchen" }, { "date": "2026-12-18", "position": "take-out" }
];

function WeekSelector({ selectedMonth, setSelectedMonth, selectedWeek, setSelectedWeek, weekOptions }) {
  return (
    <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <label>
        Month:&nbsp;
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        />
      </label>
      <label>
        Week:&nbsp;
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(Number(e.target.value))}
        >
          {weekOptions.map((week, idx) => (
            <option key={idx} value={idx}>
              Week {idx + 1}: {week.map(d => d.date.slice(5)).join(' - ')}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function DaysBar({ weekDays, users, freeShifts, currentUser, onDayClick }) {
  return (
    <div style={{ display: 'flex', gap: '10px', margin: '40px 0' }}>
      {weekDays.map(day => {
        const takenShifts = [];
        let userShift = null;
        let userFree = false;
        users.forEach(u => {
          if (u.datesWorking) {
            u.datesWorking.forEach(d => {
              if (d.date === day.date) {
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
            style={{
              flex: 1,
              background: '#e0e0e0',
              padding: '30px 10px',
              textAlign: 'center',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '2rem',
              minHeight: '120px',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}
            onClick={() => onDayClick(day)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              {day.label}<br /><span style={{ fontSize: '1rem', fontWeight: 'normal' }}>{day.date}</span>
            </div>
            {/* User's free day (blue) */}
            {userFree && (
              <div
                style={{
                  background: '#2196f3',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  margin: '4px 0',
                  fontSize: '1.1rem'
                }}
              >
                You want to be free
              </div>
            )}
            {/* User's shift (green) */}
            {userShift && (
              <div
                style={{
                  background: '#4caf50',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  margin: '4px 0',
                  fontSize: '1.1rem'
                }}
              >
                {userShift} (You)
              </div>
            )}
            {/* Taken shifts (yellow) */}
            {takenShifts.map((shift, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffd600',
                  color: '#333',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  margin: '4px 0',
                  fontSize: '1.1rem'
                }}
              >
                {shift.position} ({shift.username})
              </div>
            ))}
            {/* Open shifts (red) */}
            {openShifts.map((shift, idx) => (
              <div
                key={idx}
                style={{
                  background: '#e53935',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  margin: '4px 0',
                  fontSize: '1.1rem'
                }}
              >
                {shift.position} (Open)
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function DayPopup({ day, users, freeShifts, onClose, onFreeShiftClick }) {
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
      />
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

function FreeShiftPopup({ day, shift, onClose, onTakeShift }) {
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
      />
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

export default function RosterPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState(initialUsers);
  const [freeShifts, setFreeShifts] = useState(initialFreeShifts);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedFreeShift, setSelectedFreeShift] = useState(null);

  // Simulate current user (replace with your auth logic)
  const currentUser = "test";

  // Week selector state
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Calculate week options for the selected month
  const mondays = getMondays(
    Number(selectedMonth.split('-')[0]),
    Number(selectedMonth.split('-')[1]) - 1
  );
  const weekOptions = mondays.map(monday => getWeekDates(monday));
  const weekDays = weekOptions[selectedWeek] || [];

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  const handleFreeShiftClick = (day, shift) => {
    setSelectedFreeShift({ day, shift });
  };

  const handleTakeShift = (day, shift) => {
    // Check if current user is already working that day
    const user = users.find(u => u.username === currentUser);
    const alreadyWorking = user && user.datesWorking.some(d => d.date === day.date);

    if (alreadyWorking) {
      alert(`You are already working on ${day.label} (${day.date}). You cannot take another shift that day.`);
      setSelectedFreeShift(null);
      return;
    }

    setUsers(prevUsers => {
      let foundCurrentUser = false;
      const updatedUsers = prevUsers.map(user => {
        // Add the shift to the current user's datesWorking
        if (user.username === currentUser) {
          foundCurrentUser = true;
          return {
            ...user,
            datesWorking: [
              ...(user.datesWorking || []),
              { date: day.date, position: shift.position }
            ]
          };
        }
        return user;
      });

      // If current user not found, add them
      if (!foundCurrentUser) {
        updatedUsers.push({
          id: prevUsers.length + 1,
          username: currentUser,
          password: "",
          datesFree: [],
          datesWorking: [{ date: day.date, position: shift.position }]
        });
      }

      return updatedUsers;
    });

    // Remove the free shift from the freeShifts array
    setFreeShifts(prevShifts =>
      prevShifts.filter(
        s => !(s.date === day.date && s.position === shift.position)
      )
    );

    setSelectedFreeShift(null);
    setSelectedDay(null);
  };

  return (
    <div className="roster-container">
      <h2 className="roster-title">Roster Page</h2>
      <WeekSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        weekOptions={weekOptions}
      />
      <DaysBar
        weekDays={weekDays}
        users={users}
        freeShifts={freeShifts}
        currentUser={currentUser}
        onDayClick={setSelectedDay}
      />
      {selectedDay &&
        <DayPopup
          day={selectedDay}
          users={users}
          freeShifts={freeShifts}
          onClose={() => setSelectedDay(null)}
          onFreeShiftClick={handleFreeShiftClick}
        />
      }
      {selectedFreeShift &&
        <FreeShiftPopup
          day={selectedFreeShift.day}
          shift={selectedFreeShift.shift}
          onClose={() => setSelectedFreeShift(null)}
          onTakeShift={handleTakeShift}
        />
      }
    </div>
  );
}