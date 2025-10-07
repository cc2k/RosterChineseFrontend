import React from 'react';


function getMonthName(monthStr) {
  if (!monthStr) return '';
  const [, month] = monthStr.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

export default function MonthPicker({ value, onChange, style }) {
  // Ensure value is a valid yyyy-MM string, else use empty string
  const validValue =
    typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)
      ? value
      : '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%', ...style }}>
      <span style={{ display: 'flex', alignItems: 'center', height: '100%' }}>{getMonthName(validValue)}</span>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', height: '100%' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <input
          type="month"
          value={validValue}
          onChange={onChange}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 2
          }}
          aria-label="Month picker"
        />
      </span>
    </div>
  );
}
