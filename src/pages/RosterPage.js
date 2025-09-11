import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import '../css/RosterPage.css';
import { getWeekDates } from '../components/DateSelector';
import WeekSelector from '../components/WeekSelector';
import DaysBar from '../components/DaysBar';
import DayPopup from '../components/DayPopup';
import FreeShiftPopup from '../components/FreeShiftPopup';
import { useUserSettings } from '../context/UserSettingsContext';
import { SHIFT_COLOR_DEFINITIONS } from '../components/shiftColors';
import { useToast } from '../components/ToastContext';

function ShiftColorLegendPopup({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 40,
      background: '#fff',
      border: '1px solid #ccc',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      padding: 16,
      zIndex: 2000,
      minWidth: 220
    }}>
      <strong>Shift Color Legend</strong>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0' }}>
        {SHIFT_COLOR_DEFINITIONS.map(def => (
          <li key={def.key} style={{ marginBottom: 6 }}>
            <span style={{ display: 'inline-block', width: 16, height: 16, background: def.background, color: def.color, borderRadius: 3, marginRight: 8, border: '1px solid #ccc', verticalAlign: 'middle' }}></span>
            {def.description}
          </li>
        ))}
      </ul>
      <button style={{ marginTop: 12, float: 'right' }} onClick={onClose}>Close</button>
    </div>
  );
}
// Main RosterPage component
function RosterPage() {
  const { isLoggedIn, user } = useAuth();
  const { settings: userSettings } = useUserSettings();
  const [legendOpen, setLegendOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [freeShifts, setFreeShifts] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedFreeShift, setSelectedFreeShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = user ? user.username : null;

  // Week/Month state
  const today = new Date();
  const [calendarRange, setCalendarRange] = useState({
    start: new Date(today.getFullYear() - 2, 0, 1),
    end: new Date(today.getFullYear() + 2, 11, 31)
  });
  function getAllMondaysInRange(start, end) {
    const mondays = [];
    let d = new Date(start);
    d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7));
    while (d <= end) {
      mondays.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    return mondays;
  }
  const allMondays = getAllMondaysInRange(calendarRange.start, calendarRange.end);
  const weekOptions = allMondays.map(monday => getWeekDates(monday));
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const initialWeekIdx = weekOptions.findIndex(week => week.some(day => day.date === todayStr));
  const [selectedWeek, setSelectedWeek] = useState(initialWeekIdx !== -1 ? initialWeekIdx : 0);
  const weekDays = weekOptions[selectedWeek] || [];
  const initialMonday = weekOptions[selectedWeek]?.[0]?.date || todayStr;
  const initialMonth = (() => {
    const d = new Date(initialMonday);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const monthPickerChangeRef = useRef(false);

  // Sync month when week changes
  useEffect(() => {
    if (monthPickerChangeRef.current) {
      monthPickerChangeRef.current = false;
      return;
    }
    const mondayDate = weekOptions[selectedWeek]?.[0]?.date;
    if (mondayDate) {
      const d = new Date(mondayDate);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (selectedMonth !== monthStr) {
        setSelectedMonth(monthStr);
      }
    }
  }, [selectedWeek, weekOptions, selectedMonth]);

  // Robust week navigation
  const prevCalendarRange = useRef(calendarRange);
  const pendingMondayRef = useRef(null);
  const handlePrevWeek = () => {
    if (selectedWeek === 0) {
      pendingMondayRef.current = weekOptions[selectedWeek][0].date;
    }
    setSelectedWeek(selectedWeek - 1);
  };
  const handleNextWeek = () => {
    if (selectedWeek === weekOptions.length - 1) {
      pendingMondayRef.current = weekOptions[selectedWeek][0].date;
    }
    setSelectedWeek(selectedWeek + 1);
  };
  useEffect(() => {
    const prevStart = prevCalendarRange.current.start;
    const prevEnd = prevCalendarRange.current.end;
    if (calendarRange.start < prevStart || calendarRange.end > prevEnd) {
      const mondayDate = pendingMondayRef.current;
      if (mondayDate) {
        const idx = weekOptions.findIndex(week => week[0].date === mondayDate);
        if (idx !== -1) setSelectedWeek(idx);
        pendingMondayRef.current = null;
      }
    }
    prevCalendarRange.current = calendarRange;
  }, [calendarRange, weekOptions]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    const API_URL = process.env.REACT_APP_API_URL;
    Promise.all([
      fetch(`${API_URL}/api/users`).then(res => res.json()),
      fetch(`${API_URL}/api/shift_assignments`).then(res => res.json()),
      fetch(`${API_URL}/api/user_unavailability`).then(res => res.json()),
      fetch(`${API_URL}/api/roles`).then(res => res.json()),
      fetch(`${API_URL}/api/free_shifts`).then(res => res.json())
    ]).then(([usersData, assignmentsData, unavailData, rolesData, freeShiftsData]) => {
      const roleIdToName = Object.fromEntries(rolesData.map(r => [r.role_id, r.role_name]));
      const allShifts = [...freeShiftsData, ...assignmentsData.map(a => ({ shift_id: a.shift_id, shift_date: a.shift_date, role_id: a.role_id }))];
      const usersWithShifts = usersData.map(u => ({
        ...u,
        datesWorking: assignmentsData.filter(a => a.user_id === u.user_id).map(a => {
          const shift = allShifts.find(s => s.shift_id === a.shift_id);
          return shift ? { date: shift.shift_date ? shift.shift_date.slice(0,10) : null, position: roleIdToName[shift.role_id] } : null;
        }).filter(Boolean),
        datesFree: unavailData.filter(ua => ua.user_id === u.user_id).map(ua => ({ date: ua.unavailable_date, reason: ua.reason }))
      }));
      setUsers(usersWithShifts);
      setFreeShifts(freeShiftsData.map(s => ({ id: s.shift_id, date: s.shift_date ? s.shift_date.slice(0,10) : null, position: roleIdToName[s.role_id] })));
      setLoading(false);
    }).catch(() => {
      setUsers([]);
      setFreeShifts([]);
      setLoading(false);
    });
  }, [user]);

  if (!isLoggedIn) return null;
  if (loading) {
    return <div style={{textAlign:'center',marginTop:'2rem',fontSize:'1.2rem'}}>Loading roster data...</div>;
  }

  const handleFreeShiftClick = (day, shift) => setSelectedFreeShift({ day, shift });

  const handleTakeShift = async (day, shift) => {
    const user = users.find(u => u.username === currentUser);
    if (!user) {
      if (toast) toast.showToast('User not found.');
      setSelectedFreeShift(null);
      return;
    }
    const userShifts = users.filter(u => u.username === currentUser).flatMap(u => u.datesWorking || []);
    if (userShifts.some(d => d.date === day.date)) {
      if (toast) toast.showToast(`You are already working on ${day.label} (${day.date}). You cannot take another shift that day.`);
      setSelectedFreeShift(null);
      return;
    }
    const shiftObj = freeShifts.find(s => s.date === day.date && s.position === shift.position);
    if (!shiftObj) {
      if (toast) toast.showToast('Shift not found.');
      setSelectedFreeShift(null);
      return;
    }
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      await fetch(`${API_URL}/api/shift_assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift_id: shiftObj.id, user_id: user.user_id })
      });
      Promise.all([
        fetch(`${API_URL}/api/users`).then(res => res.json()),
        fetch(`${API_URL}/api/shift_assignments`).then(res => res.json()),
        fetch(`${API_URL}/api/user_unavailability`).then(res => res.json()),
        fetch(`${API_URL}/api/roles`).then(res => res.json()),
        fetch(`${API_URL}/api/free_shifts`).then(res => res.json())
      ]).then(([usersData, assignmentsData, unavailData, rolesData, freeShiftsData]) => {
        const roleIdToName = Object.fromEntries(rolesData.map(r => [r.role_id, r.role_name]));
        const usersWithShifts = usersData.map(u => ({
          ...u,
          datesWorking: assignmentsData.filter(a => a.user_id === u.user_id).map(a => {
            return { date: a.shift_date ? a.shift_date.slice(0,10) : null, position: roleIdToName[a.role_id] };
          }).filter(Boolean),
          datesFree: unavailData.filter(ua => ua.user_id === u.user_id).map(ua => ({ date: ua.unavailable_date, reason: ua.reason }))
        }));
        setUsers(usersWithShifts);
        setFreeShifts(freeShiftsData.map(s => ({ id: s.shift_id, date: s.shift_date ? s.shift_date.slice(0,10) : null, position: roleIdToName[s.role_id] })));
      });
    } catch (err) {
      if (toast) toast.showToast('Error taking shift.');
    }
    setSelectedFreeShift(null);
    setSelectedDay(null);
  };

  // ...existing code...
  return (
    <div className="roster-container">
      <h2 className="roster-title">Roster Page</h2>
  {/* Only one WeekSelector/month selector, with legend icon next to it */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48, // Ensures enough height for vertical centering
    width: '100%',
  }}>
        <WeekSelector
          selectedMonth={selectedMonth}
          setSelectedMonth={month => {
            monthPickerChangeRef.current = true;
            setSelectedMonth(month);
          }}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          weekOptions={weekOptions}
          calendarRange={calendarRange}
          setCalendarRange={setCalendarRange}
        />
        {(userSettings?.shiftColors === 'on' || userSettings?.shiftColors === 'true' || userSettings?.shiftColors === '1') && (
          <span
            style={{
              cursor: 'pointer',
              fontSize: 18,
              color: '#1976d2',
              marginLeft: 6,
              userSelect: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              lineHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              boxSizing: 'border-box'
            }}
            title="Show shift color legend"
            onClick={() => setLegendOpen(true)}
            onMouseEnter={() => setLegendOpen(true)}
            onMouseLeave={() => setLegendOpen(false)}
          >
            ?
          </span>
        )}
      </div>
      <DaysBar
        weekDays={weekDays}
        users={users}
        freeShifts={freeShifts}
        currentUser={currentUser}
        onDayClick={setSelectedDay}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        prevDisabled={selectedWeek === 0}
        nextDisabled={selectedWeek === weekOptions.length - 1}
        shiftColors={userSettings?.shiftColors}
      />
      <ShiftColorLegendPopup open={legendOpen} onClose={() => setLegendOpen(false)} />
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

export default RosterPage;
