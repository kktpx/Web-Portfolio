import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AnalyticsSkeleton from './AnalyticsSkeleton';
import AnalyticsEmptyState from './AnalyticsEmptyState';
import { Activity } from 'lucide-react';

const ActivityTimeline = ({ data, loading, error }) => {
  if (error) return <AnalyticsEmptyState icon={Activity} message="Failed to load timeline data." />;
  if (loading) return <div className="analytics-card"><AnalyticsSkeleton type="chart" /></div>;
  if (!data || data.length === 0) return <AnalyticsEmptyState icon={Activity} message="No activity in this period." />;

  const formattedData = data.map(d => ({
    ...d,
    dateStr: new Date(d.period).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="analytics-card timeline-card">
      <h3 className="card-title">Activity Timeline</h3>
      <div className="chart-container" style={{ height: 300, width: '100%', marginTop: '1.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="dateStr" stroke="#a0a0a0" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a0a0a0" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="page_views" name="Page Views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPv)" />
            <Area type="monotone" dataKey="interactions" name="Interactions" stroke="#10b981" fillOpacity={1} fill="url(#colorInt)" />
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default ActivityTimeline;