import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getTimeline } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import WidgetShell from './WidgetShell';
import { shapeTimeline, peakBucket, avgBucket, formatNum } from './format';

const METRICS = [
  { key: 'visitors', label: 'Unique Visitors' },
  { key: 'interactions', label: 'All Interactions' },
  { key: 'project_opens', label: 'Project Opens' },
  { key: 'external_clicks', label: 'External Clicks' },
  { key: 'resume_downloads', label: 'Resume Downloads' },
];
const DAY_MS = 24 * 60 * 60 * 1000;

const ActivityTimeline = ({ from, to, refreshKey }) => {
  const [metric, setMetric] = useState('visitors');
  const { data, loading, error } = useAnalytics(
    () => getTimeline(from, to, metric),
    [from, to, metric, refreshKey]
  );

  const hourly = new Date(to).getTime() - new Date(from).getTime() <= DAY_MS;
  const series = useMemo(() => shapeTimeline(data, hourly), [data, hourly]);
  const peak = peakBucket(series);
  const avg = avgBucket(series);
  const unit = hourly ? 'hour' : 'day';

  const tabs = (
    <div className="an-tabs" role="tablist">
      {METRICS.map((m) => (
        <button
          key={m.key}
          type="button"
          role="tab"
          aria-selected={metric === m.key}
          className={`an-tab ${metric === m.key ? 'active' : ''}`}
          onClick={() => setMetric(m.key)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );

  return (
    <WidgetShell
      title="Activity Timeline"
      subtitle={hourly ? 'Hourly activity' : 'Daily activity'}
      actions={tabs}
      loading={loading}
      error={error}
      empty={series.length === 0 || !peak}
      emptyText="No activity recorded in this period."
    >
      <div className="an-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="anFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffcc00" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#ffcc00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#a0a0a0', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tick={{ fill: '#a0a0a0', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="value" name="Count" stroke="#ffcc00" strokeWidth={2} fill="url(#anFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="an-strip">
        <div><span className="an-stat-label">Peak activity</span><strong>{peak ? `${formatNum(peak.value)} at ${peak.label}` : '—'}</strong></div>
        <div><span className="an-stat-label">Average per {unit}</span><strong>{formatNum(avg, 1)}</strong></div>
      </div>
    </WidgetShell>
  );
};

export default ActivityTimeline;
