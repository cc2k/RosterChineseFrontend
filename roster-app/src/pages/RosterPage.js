import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import initialUsers from '../data/users.json';

const weekDays = [
  { label: 'Mon', date: '2023-11-01' },
  { label: 'Tue', date: '2023-11-02' },
  { label: 'Wed', date: '2023-11-03' },
  { label: 'Thu', date: '2023-11-04' },
  { label: 'Fri', date: '2023-11-05' },
  { label: 'Sat', date: '2023-11-06' },
  { label: 'Sun', date: '2023-11-07' }
];

// Initial free shifts for testing
const initialFreeShifts = [
  { date: '2023-11-01', position: 'driver' },
  { date: '2023-11-02', position: 'kitchen' },
  { date: '2023-11-03', position: 'restaurant' },
  { date: '2023-11-04', position: 'take-out' },
  { date: '2023-11-05', position: 'driver' }
];

function DaysBar({ onDayClick }) {
  return (
    <div style={{ display: 'flex', gap: '10px', margin: '40px 0' }}>
      {weekDays.map(day => (
        <div
          key={day.date}
          style={{
            flex: 1,
            background: '#e0e0e0',
            padding: '20px',
            textAlign: 'center',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => onDayClick(day)}
        >
          {day.label}
        </div>
      ))}
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
  const currentUser = "test_user";

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
    <div style={{ padding: '40px' }}>
      <h2>Roster Page</h2>
      <DaysBar onDayClick={setSelectedDay} />
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