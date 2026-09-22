import React, { useState } from 'react';
import AnalyticsSkeleton from './AnalyticsSkeleton';
import AnalyticsEmptyState from './AnalyticsEmptyState';
import VisitorJourneyModal from './VisitorJourneyModal';
import { Route } from 'lucide-react';

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const VisitorJourneys = ({ data, loading, error }) => {
  const [selectedSession, setSelectedSession] = useState(null);

  if (error) return <AnalyticsEmptyState icon={Route} message="Failed to load visitor journeys." />;
  if (loading) return <div className="analytics-card"><AnalyticsSkeleton type="chart" /></div>;

  return (
    <div className="analytics-card">
      <h3 className="card-title">Recent Visitor Journeys</h3>
      {(!data || data.length === 0) ? (
        <AnalyticsEmptyState icon={Route} message="No journeys found." />
      ) : (
        <div className="analytics-journeys-grid">
          {data.map((row) => {
            const durationMs = new Date(row.ended_at).getTime() - new Date(row.started_at).getTime();
            const durationSec = Math.floor(durationMs / 1000);
            const mins = Math.floor(durationSec / 60);
            const secs = durationSec % 60;
            const durationText = mins > 0 ? `${mins}m ${secs}s` : (secs > 0 ? `${secs}s` : '< 1s');
            
            return (
              <div className="journey-card" key={row.session_key}>
                <div className="journey-header">
                  <div>
                    <span className="device-badge">{row.device_type}</span>
                    <span className="country-badge" style={{ marginLeft: '0.5rem', fontSize: '1.2rem' }} title={row.country_code || 'Unknown'}>
                      {getFlagEmoji(row.country_code)}
                    </span>
                  </div>
                  <span className="time-ago">{new Date(row.started_at).toLocaleTimeString()}</span>
                </div>
                <div className="journey-body">
                  <p><strong>Source:</strong> {row.utm_source || row.referrer || 'Direct'}</p>
                  <p><strong>Actions:</strong> {row.action_count}</p>
                  <p><strong>Duration:</strong> {durationText}</p>
                </div>
                <div className="journey-footer">
                  <button className="admin-btn admin-btn-secondary btn-sm" onClick={() => setSelectedSession(row.session_key)}>
                    View Trail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedSession && <VisitorJourneyModal sessionKey={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  );
};
export default VisitorJourneys;