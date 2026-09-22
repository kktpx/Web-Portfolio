import React from 'react';

const AnalyticsEmptyState = ({ icon: Icon, message }) => {
  return (
    <div className="analytics-empty-state">
      {Icon && <Icon size={32} className="empty-icon" />}
      <p>{message}</p>
    </div>
  );
};
export default AnalyticsEmptyState;