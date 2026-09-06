import React from 'react';
import './EventBreakdown.css';

const EventBreakdown = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="admin-card event-breakdown-card">
        <h3>Event Breakdown</h3>
        <div className="event-breakdown-loading loading-pulse"></div>
      </div>
    );
  }

  const maxCount = data?.length > 0 ? Math.max(...data.map(d => d.count)) : 0;

  return (
    <div className="admin-card event-breakdown-card">
      <h3>Event Breakdown</h3>
      
      {data && data.length > 0 ? (
        <div className="breakdown-list">
          {data.map((item, idx) => {
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            return (
              <div key={idx} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-label">{item.label}</span>
                  <span className="breakdown-value">{item.count.toLocaleString()}</span>
                </div>
                <div className="breakdown-track">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="analytics-empty-inline">No event data available yet.</div>
      )}
    </div>
  );
};

export default EventBreakdown;
