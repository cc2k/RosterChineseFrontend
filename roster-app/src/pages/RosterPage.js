import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import initialUsers from '../data/users.json';
import '../css/RosterPage.css';
import { getWeekDates, getMondays, initialFreeShifts } from '../components/DateSelector';



function WeekSelector({ selectedMonth, setSelectedMonth, selectedWeek, setSelectedWeek, weekOptions }) {
  return (
    <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <label>
        Month:&nbsp;
        <input
  type="month"
  value={selectedMonth}
  onChange={e => {
    setSelectedMonth(e.target.value);
    // Jump to first week of selected month
    const [year, month] = e.target.value.split('-').map(Number);
    const idx = weekOptions.findIndex(week => week[0].date.startsWith(`${year}-${String(month).padStart(2, '0')}`));
    if (idx !== -1) setSelectedWeek(idx);
  }}
/>
      </label>
      <label>
        Week:&nbsp;
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(Number(e.target.value))}
        >
          {weekOptions.map((week, idx) => {
            // ISO week number calculation
            function getISOWeek(dateStr) {
              const date = new Date(dateStr);
              date.setHours(0, 0, 0, 0);
              date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
              const week1 = new Date(date.getFullYear(), 0, 4);
              return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
            }
            function formatDMY(dateStr) {
              const d = new Date(dateStr);
              const dd = String(d.getDate()).padStart(2, '0');
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const yyyy = d.getFullYear();
              return `${dd}-${mm}-${yyyy}`;
            }
            const weekNr = getISOWeek(week[0].date);
            const monday = formatDMY(week[0].date);
            const sunday = formatDMY(week[6].date);
            return (
              <option key={idx} value={idx}>
                Week {weekNr}: Monday {monday} - Sunday {sunday}
              </option>
            );
          })}
        </select>
      </label>
    </div>
  );
}


function DaysBar({ weekDays, users, freeShifts, currentUser, onDayClick, onPrevWeek, onNextWeek, prevDisabled, nextDisabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '40px 0' }}>
      <button
        onClick={onPrevWeek}
        disabled={prevDisabled}
        style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: prevDisabled ? 'not-allowed' : 'pointer', color: prevDisabled ? '#ccc' : '#333', marginRight: '10px' }}
        aria-label="Previous Week"
      >
        &#8592;
      </button>
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
            className="weekday-square"
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
      <button
        onClick={onNextWeek}
        disabled={nextDisabled}
        style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: nextDisabled ? 'not-allowed' : 'pointer', color: nextDisabled ? '#ccc' : '#333', marginLeft: '10px' }}
        aria-label="Next Week"
      >
        &#8594;
      </button>
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

export default function RosterPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  // ...existing code...

  // Simulate current user (replace with your auth logic)
  const currentUser = "test"; // TODO: Replace with real auth

  // Week selector state
 const startDate = new Date(2025, 6, 1); // July 1, 2025
 const endDate = new Date(2026, 11, 31); // December 31, 2026
 const allMondays = getAllMondaysInRange(startDate, endDate);
function getAllMondaysInRange(start, end) {
  const mondays = [];
  let d = new Date(start);
  d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7)); // Move to first Monday
  while (d <= end) {
    mondays.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return mondays;
}
     const [freeShifts, setFreeShifts] = useState([]);
     const [selectedDay, setSelectedDay] = useState(null);
     const [selectedFreeShift, setSelectedFreeShift] = useState(null);
const weekOptions = allMondays.map(monday => getWeekDates(monday));
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
// Find the week containing today
const initialWeekIdx = weekOptions.findIndex(week => week.some(day => day.date === todayStr));
const [selectedWeek, setSelectedWeek] = useState(initialWeekIdx !== -1 ? initialWeekIdx : 0);
const weekDays = weekOptions[selectedWeek] || [];
const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch users and shifts from backend
  useEffect(() => {
    // Fetch users and shifts, then combine
    Promise.all([
      fetch('http://localhost:4000/api/users').then(res => res.json()),
      fetch('http://localhost:4000/api/shifts').then(res => res.json())
    ]).then(([usersData, shiftsData]) => {
      // For each user, add datesWorking from shifts
      const usersWithShifts = usersData.map(u => ({
        ...u,
        datesWorking: shiftsData
          .filter(s => s.user_id === u.id && s.free === 0)
          .map(s => ({ date: s.date, position: s.position }))
      }));
      setUsers(usersWithShifts);
      setFreeShifts(shiftsData.filter(s => s.free === 1));
    }).catch(() => {
      setUsers([]);
      setFreeShifts([]);
    });
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  const handleFreeShiftClick = (day, shift) => {
    setSelectedFreeShift({ day, shift });
  };

  const handleTakeShift = async (day, shift) => {
    // Find current user in users list
    const user = users.find(u => u.username === currentUser);
    if (!user) {
      alert('User not found.');
      setSelectedFreeShift(null);
      return;
    }
    // Check if already working that day
    // Get all shifts for this user
    const userShifts = users
      .filter(u => u.username === currentUser)
      .flatMap(u => u.datesWorking || []);
    if (userShifts.some(d => d.date === day.date)) {
      alert(`You are already working on ${day.label} (${day.date}). You cannot take another shift that day.`);
      setSelectedFreeShift(null);
      return;
    }
    // Find the shift id from freeShifts
    const shiftObj = freeShifts.find(s => s.date === day.date && s.position === shift.position);
    if (!shiftObj) {
      alert('Shift not found.');
      setSelectedFreeShift(null);
      return;
    }
    // Call API to take shift
    try {
      await fetch(`http://localhost:4000/api/shifts/${shiftObj.id}/take`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      // Refetch users and shifts, then combine
      Promise.all([
        fetch('http://localhost:4000/api/users').then(res => res.json()),
        fetch('http://localhost:4000/api/shifts').then(res => res.json())
      ]).then(([usersData, shiftsData]) => {
        const usersWithShifts = usersData.map(u => ({
          ...u,
          datesWorking: shiftsData
            .filter(s => s.user_id === u.id && s.free === 0)
            .map(s => ({ date: s.date, position: s.position }))
        }));
        setUsers(usersWithShifts);
        setFreeShifts(shiftsData.filter(s => s.free === 1));
      });
    } catch (err) {
      alert('Error taking shift.');
    }
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
        onPrevWeek={() => setSelectedWeek(selectedWeek - 1)}
        onNextWeek={() => setSelectedWeek(selectedWeek + 1)}
        prevDisabled={selectedWeek === 0}
        nextDisabled={selectedWeek === weekOptions.length - 1}
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
