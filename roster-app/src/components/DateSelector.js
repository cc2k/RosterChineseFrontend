import React, { useState } from 'react';

// Helper to get week dates (Mon-Sun) for a given Monday
export function getWeekDates(monday) {
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

// Helper to get all Mondays in a month
export function getMondays(year, month) {
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

// Initial free shifts for testing (2025 and 2026)
export const initialFreeShifts = [
  { "date": "2025-01-02", "position": "restaurant" },
  { "date": "2025-01-09", "position": "driver" },
  { "date": "2025-01-16", "position": "kitchen" },
  { "date": "2025-02-06", "position": "take-out" },
  { "date": "2025-02-13", "position": "restaurant" },
  { "date": "2025-02-20", "position": "driver" },
  { "date": "2025-03-06", "position": "kitchen" },
  { "date": "2025-03-13", "position": "take-out" },
  { "date": "2025-03-20", "position": "restaurant" },
  { "date": "2025-04-03", "position": "driver" },
  { "date": "2025-04-10", "position": "kitchen" },
  { "date": "2025-04-17", "position": "take-out" },
  { "date": "2025-05-01", "position": "restaurant" },
  { "date": "2025-05-08", "position": "driver" },
  { "date": "2025-05-15", "position": "kitchen" },
  { "date": "2025-06-05", "position": "take-out" },
  { "date": "2025-06-12", "position": "restaurant" },
  { "date": "2025-06-19", "position": "driver" },
  { "date": "2025-07-03", "position": "kitchen" },
  { "date": "2025-07-10", "position": "take-out" },
  { "date": "2025-07-17", "position": "restaurant" },
  { "date": "2025-08-07", "position": "driver" },
  { "date": "2025-08-14", "position": "kitchen" },
  { "date": "2025-08-21", "position": "take-out" },
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

function DateSelector() {
  const [selectedDates, setSelectedDates] = useState([]);

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDates([...selectedDates, date]);
  };

  return (
    <div>
      <h3>Select Dates</h3>
      <input type="date" onChange={handleDateChange} />
      <ul>
        {selectedDates.map((date, index) => (
          <li key={index}>{date}</li>
        ))}
      </ul>
    </div>
  );
}

export default DateSelector;