import React, { useState } from 'react';

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