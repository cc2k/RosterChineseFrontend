
import React from 'react';

export default function ShiftCard({ children, style = {} }) {
  return (
    <div className="shift-card" style={style}>
      {children}
    </div>
  );
}
