import React from 'react';
import AnalyticsSkeleton from './AnalyticsSkeleton';
import AnalyticsEmptyState from './AnalyticsEmptyState';
import { LayoutTemplate } from 'lucide-react';

const ProjectEngagement = ({ data, loading, error }) => {
  if (error) return <AnalyticsEmptyState icon={LayoutTemplate} message="Failed to load project stats." />;
  if (loading) return <div className="analytics-card"><AnalyticsSkeleton type="table" /></div>;
  
  return (
    <div className="analytics-card table-card">
      <h3 className="card-title">Project Engagement</h3>
      {(!data || data.length === 0) ? (
        <AnalyticsEmptyState icon={LayoutTemplate} message="No project engagement in this period." />
      ) : (
        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Opens</th>
                <th>Unique Vis.</th>
                <th>GitHub Clicks</th>
                <th>Demo Clicks</th>
                <th>Eng. Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => {
                const totalSessions = 100; // placeholder if total sessions isn't passed, ideally calc from views
                const rate = row.views > 0 ? Math.round((row.unique_visitors / row.views) * 100) : 0;
                return (
                  <tr key={row.project_id}>
                    <td>{row.project_title || 'Unknown Project'}</td>
                    <td>{row.opens}</td>
                    <td>{row.unique_visitors}</td>
                    <td>{row.github_clicks}</td>
                    <td>{row.demo_clicks}</td>
                    <td>{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default ProjectEngagement;