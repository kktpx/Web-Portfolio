import React from 'react';

const DateRangeFilter = ({ value, onChange }) => {
  const options = [
    { label: '1 Day', value: '1d' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="analytics-date-filter">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`date-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
export default DateRangeFilter;