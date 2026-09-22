import React from 'react';

const AnalyticsSkeleton = ({ type }) => {
  if (type === 'metric') {
    return (
      <div className="skeleton-wrapper">
        <div className="analytics-skeleton" style={{ height: '20px', width: '60%', marginBottom: '1rem' }} />
        <div className="analytics-skeleton" style={{ height: '36px', width: '40%' }} />
      </div>
    );
  }
  if (type === 'table') {
    return (
      <div className="skeleton-wrapper">
        <div className="analytics-skeleton" style={{ height: '24px', width: '30%', marginBottom: '1.5rem' }} />
        <div className="analytics-skeleton" style={{ height: '40px', width: '100%', marginBottom: '0.5rem' }} />
        <div className="analytics-skeleton" style={{ height: '40px', width: '100%', marginBottom: '0.5rem' }} />
        <div className="analytics-skeleton" style={{ height: '40px', width: '100%' }} />
      </div>
    );
  }
  return (
    <div className="skeleton-wrapper">
      <div className="analytics-skeleton" style={{ height: '300px', width: '100%' }} />
    </div>
  );
};
export default AnalyticsSkeleton;