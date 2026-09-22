import React from 'react';
import { RefreshCw, Activity, Database } from 'lucide-react';

const AnalyticsHeader = ({ realtimeActive, onRefresh, loading }) => {
  return (
    <div className="analytics-header">
      <div className="analytics-title-group">
        <h4 className="analytics-subtitle">PORTFOLIO BEHAVIOR & CONVERSION ANALYTICS</h4>
        <h1 className="analytics-title">Portfolio Analytics</h1>
        <p className="analytics-desc">Unified audience, engagement, project interest, resume conversions and anonymous visitor journeys.</p>
      </div>
      <div className="analytics-header-actions">
        <div className="analytics-badges">
          <span className={`analytics-badge ${realtimeActive ? 'analytics-badge--live' : ''}`}>
            <Activity size={14} /> Live Sync
          </span>
          <span className="analytics-badge analytics-badge--db">
            <Database size={14} /> Supabase Analytics
          </span>
        </div>
        <button className="admin-btn admin-btn-secondary" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>
    </div>
  );
};
export default AnalyticsHeader;