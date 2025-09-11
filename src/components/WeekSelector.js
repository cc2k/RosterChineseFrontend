import React, { useRef } from 'react';
import MonthPicker from './MonthPicker';

function WeekSelector({ selectedMonth, setSelectedMonth, selectedWeek, setSelectedWeek, weekOptions, calendarRange, setCalendarRange }) {
  const pendingMonthRef = useRef(null);
  const monthInputRef = useRef(null);

  function handleMonthChange(e) {
    setSelectedMonth(e.target.value);
    const [year, month] = e.target.value.split('-').map(Number);
    if (year < calendarRange.start.getFullYear() || (year === calendarRange.start.getFullYear() && month < (calendarRange.start.getMonth() + 1))) {
      setCalendarRange(r => ({
        start: new Date(year - 2, 0, 1),
        end: r.end
      }));
      pendingMonthRef.current = { year, month };
      return;
    }
    if (year > calendarRange.end.getFullYear() || (year === calendarRange.end.getFullYear() && month > (calendarRange.end.getMonth() + 1))) {
      setCalendarRange(r => ({
        start: r.start,
        end: new Date(year + 2, 11, 31)
      }));
      pendingMonthRef.current = { year, month };
      return;
    }
    const idx = weekOptions.findIndex(week => week[0].date.startsWith(`${year}-${String(month).padStart(2, '0')}`));
    if (idx !== -1 && idx !== selectedWeek) setSelectedWeek(idx);
  }

  // formatMonthName now handled by MonthPicker

  React.useEffect(() => {
    if (pendingMonthRef.current) {
      const { year, month } = pendingMonthRef.current;
      if (
        year >= calendarRange.start.getFullYear() && year <= calendarRange.end.getFullYear() &&
        weekOptions.some(week => week[0].date.startsWith(`${year}-${String(month).padStart(2, '0')}`))
      ) {
        const idx = weekOptions.findIndex(week => week[0].date.startsWith(`${year}-${String(month).padStart(2, '0')}`));
        if (idx !== -1 && idx !== selectedWeek) setSelectedWeek(idx);
        pendingMonthRef.current = null;
      }
    }
  }, [calendarRange, weekOptions, setSelectedWeek, selectedWeek]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      height: '48px',
      boxSizing: 'border-box',
    }}>
      <label style={{ display: 'flex', alignItems: 'center', userSelect: 'none', gap: 8, height: '100%' }}>
        Month:&nbsp;
        <MonthPicker value={selectedMonth} onChange={handleMonthChange} style={{ height: '100%' }} />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        Week:&nbsp;
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(Number(e.target.value))}
          style={{ height: '32px', display: 'flex', alignItems: 'center' }}
        >
          {weekOptions.map((week, idx) => {
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

export default WeekSelector;

