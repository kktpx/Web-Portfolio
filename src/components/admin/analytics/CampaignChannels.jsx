import React from 'react';
import AnalyticsSkeleton from './AnalyticsSkeleton';
import AnalyticsEmptyState from './AnalyticsEmptyState';
import { Megaphone } from 'lucide-react';

const CampaignChannels = ({ data, loading, error }) => {
  if (error) return <AnalyticsEmptyState icon={Megaphone} message="Failed to load UTM campaigns." />;
  if (loading) return <div className="analytics-card"><AnalyticsSkeleton type="table" /></div>;

  return (
    <div className="analytics-card table-card">
      <h3 className="card-title">Inbound Campaign Channels (UTM)</h3>
      {(!data || data.length === 0) ? (
        <AnalyticsEmptyState icon={Megaphone} message="No UTM campaigns detected yet." />
      ) : (
        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Channel Source</th>
                <th>Campaign Name</th>
                <th>Sessions</th>
                <th>Interactions</th>
                <th>Conversions</th>
                <th>Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const rate = row.sessions > 0 ? Math.round((row.conversions / row.sessions) * 100) : 0;
                return (
                  <tr key={i}>
                    <td>{row.channel_source}</td>
                    <td>{row.campaign_name || '-'}</td>
                    <td>{row.sessions}</td>
                    <td>{row.interactions}</td>
                    <td>{row.conversions}</td>
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
export default CampaignChannels;