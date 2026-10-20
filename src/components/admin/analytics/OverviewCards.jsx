import React from 'react';
import { Users, UserCheck, MousePointerClick, Download, FolderOpen, ExternalLink, Activity, Gauge } from 'lucide-react';
import { getOverview } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import { formatNum, pctChange } from './format';

const OverviewCards = ({ from, to, refreshKey }) => {
  const { data, loading, error } = useAnalytics(() => getOverview(from, to), [from, to, refreshKey]);

  if (error) return <p className="an-error" role="alert">Could not load overview. Try Refresh.</p>;

  const d = data || {};
  const change = pctChange(d.interactions, d.interactions_prev);
  const val = (v, digits) => (loading ? '—' : formatNum(v, digits));

  const large = [
    { label: 'Total Visitors', value: val(d.visitors), icon: <Users size={18} className="an-stat-icon" /> },
    { label: 'Visitors Today', value: val(d.visitors_today), icon: <UserCheck size={18} className="an-stat-icon" /> },
    { label: 'Total Interactions', value: val(d.interactions), icon: <MousePointerClick size={18} className="an-stat-icon" />, change },
    { label: 'Resume Downloads', value: val(d.resume_downloads), icon: <Download size={18} className="an-stat-icon" /> },
  ];
  const small = [
    { label: 'Project Opens', value: val(d.project_opens), icon: <FolderOpen size={16} className="an-stat-icon" /> },
    { label: 'External Outbound Clicks', value: val(d.external_clicks), icon: <ExternalLink size={16} className="an-stat-icon" /> },
    { label: 'Custom Behavioral Sessions', value: val(d.visits), icon: <Activity size={16} className="an-stat-icon" /> },
    { label: 'Avg Actions per Session', value: val(d.avg_actions_per_visit, 2), icon: <Gauge size={16} className="an-stat-icon" /> },
  ];

  return (
    <div className="an-overview">
      <div className="an-grid-4">
        {large.map(({ label, value, icon, change: ch }) => (
          <div key={label} className={`an-card an-stat-lg ${loading ? 'is-loading' : ''}`}>
            <div className="an-stat-top">
              <span className="an-stat-label">{label}</span>
              {icon}
            </div>
            <div className="an-stat-value">{value}</div>
            {!loading && ch !== undefined && ch !== null && (
              <div className={`an-change ${ch >= 0 ? 'up' : 'down'}`}>
                {ch >= 0 ? '+' : ''}{ch}% vs previous period
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="an-grid-4">
        {small.map(({ label, value, icon }) => (
          <div key={label} className={`an-card an-stat-sm ${loading ? 'is-loading' : ''}`}>
            {icon}
            <div>
              <div className="an-stat-label">{label}</div>
              <div className="an-stat-value-sm">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewCards;
