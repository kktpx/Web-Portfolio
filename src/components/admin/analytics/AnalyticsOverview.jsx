import React from 'react';
import MetricCard from './MetricCard';
import { Users, MousePointerClick, FileText, LayoutTemplate, ExternalLink, Activity, Hash, Clock } from 'lucide-react';
import AnalyticsEmptyState from './AnalyticsEmptyState';

const AnalyticsOverview = ({ data, loading, error }) => {
  if (error) return <AnalyticsEmptyState icon={Activity} message="Failed to load overview data." />;
  
  const durationMins = Math.floor((data?.avg_duration_seconds || 0) / 60);
  const durationSecs = Math.floor((data?.avg_duration_seconds || 0) % 60);
  const avgDurationText = durationMins > 0 ? `${durationMins}m ${durationSecs}s` : `${durationSecs}s`;

  return (
    <div className="analytics-kpi-grid">
      <MetricCard title="Total Visitors" value={data?.total_visitors || 0} icon={Users} loading={loading} />
      <MetricCard title="Avg. Duration" value={avgDurationText} icon={Clock} loading={loading} />
      <MetricCard title="Total Interactions" value={data?.total_interactions || 0} icon={MousePointerClick} loading={loading} />
      <MetricCard title="Resume Downloads" value={data?.resume_downloads || 0} icon={FileText} loading={loading} />
      
      <MetricCard title="Project Opens" value={data?.project_opens || 0} icon={LayoutTemplate} loading={loading} />
      <MetricCard title="Outbound Clicks" value={data?.outbound_clicks || 0} icon={ExternalLink} loading={loading} />
      <MetricCard title="Visitor Sessions" value={data?.total_sessions || 0} icon={Hash} loading={loading} />
      <MetricCard title="Avg. Actions/Session" value={data?.avg_actions_per_session || 0} icon={Activity} loading={loading} />
    </div>
  );
};
export default AnalyticsOverview;