import React from 'react';
import AnalyticsSkeleton from './AnalyticsSkeleton';
import AnalyticsEmptyState from './AnalyticsEmptyState';
import { MousePointerClick } from 'lucide-react';

const PopularActions = ({ data, loading, error }) => {
  if (error) return <AnalyticsEmptyState icon={MousePointerClick} message="Failed to load popular actions." />;
  if (loading) return <div className="analytics-card"><AnalyticsSkeleton type="table" /></div>;

  return (
    <div className="analytics-card table-card">
      <h3 className="card-title">Popular Actions</h3>
      {(!data || data.length === 0) ? (
        <AnalyticsEmptyState icon={MousePointerClick} message="No actions found in this period." />
      ) : (
        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Action Label</th>
                <th>Total Count</th>
                <th>Unique Users</th>
                <th>Last Occurred</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td><span className="event-badge">{row.event_type}</span></td>
                  <td>{row.action_label}</td>
                  <td>{row.total_count}</td>
                  <td>{row.unique_users}</td>
                  <td>{new Date(row.last_occurred).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default PopularActions;