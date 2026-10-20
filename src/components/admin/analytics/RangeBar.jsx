import React from 'react';
import { RefreshCw } from 'lucide-react';
import { RANGES } from './range';

const RangeBar = ({ range, onChange, onRefresh }) => (
  <div className="analytics-range-bar">
    <div className="analytics-date-filter">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          className={`filter-btn ${range === r.value ? 'active' : ''}`}
          onClick={() => onChange(r.value)}
        >
          {r.label}
        </button>
      ))}
    </div>
    <button type="button" className="analytics-refresh-btn" onClick={onRefresh}>
      <RefreshCw size={16} /> Refresh
    </button>
  </div>
);

export default RangeBar;
