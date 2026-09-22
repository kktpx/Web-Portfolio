import React from 'react';
import AnalyticsSkeleton from './AnalyticsSkeleton';

const MetricCard = ({ title, value, icon: Icon, loading }) => {
  if (loading) {
    return (
      <div className="analytics-card metric-card">
        <AnalyticsSkeleton type="metric" />
      </div>
    );
  }
  return (
    <div className="analytics-card metric-card">
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        {Icon && <Icon size={20} className="metric-icon" />}
      </div>
      <div className="metric-value">{value}</div>
    </div>
  );
};
export default MetricCard;