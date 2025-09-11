import React from 'react';

export default function AccessDenied({ message = 'Access denied. You do not have permission to view this page.' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '40vh', color: '#d32f2f', fontWeight: 500, fontSize: '1.3rem',
    }}>
      <span style={{ fontSize: 48, marginBottom: 16 }}>⛔</span>
      <div>{message}</div>
    </div>
  );
}
