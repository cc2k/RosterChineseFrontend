import React from 'react';

export default function ShiftCard({ children, style = {} }) {
  return (
    <div
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderRadius: 8,
        padding: '8px 12px',
        margin: '6px 0',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        minHeight: 36,
        ...style
      }}
    >
      {children}
    </div>
  );
}
