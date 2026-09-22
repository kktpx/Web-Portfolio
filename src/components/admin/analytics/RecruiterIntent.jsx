import React from 'react';
import AnalyticsSkeleton from './AnalyticsSkeleton';
import AnalyticsEmptyState from './AnalyticsEmptyState';
import { FileText } from 'lucide-react';

const RecruiterIntent = ({ data, loading, error }) => {
  if (error) return <AnalyticsEmptyState icon={FileText} message="Failed to load resume stats." />;
  if (loading) return <div className="analytics-card"><AnalyticsSkeleton type="table" /></div>;

  return (
    <div className="analytics-card table-card">
      <h3 className="card-title">Recruiter Intent (Resume)</h3>
      <div className="resume-stats">
        <div className="resume-stat">
          <span className="resume-label">Total Downloads</span>
          <span className="resume-value">{data?.resume_downloads || 0}</span>
        </div>
      </div>
      <p style={{color: 'var(--analytics-text-muted)', fontSize: '0.9rem', marginTop: '1rem'}}>
        (Detailed language breakdown requires specialized aggregation, showing total for now)
      </p>
    </div>
  );
};
export default RecruiterIntent;