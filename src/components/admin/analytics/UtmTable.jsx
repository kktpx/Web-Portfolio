import React from 'react';
import { getUtm } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import WidgetShell from './WidgetShell';
import { formatNum, formatPct } from './format';

const UtmTable = ({ from, to, refreshKey }) => {
  const { data, loading, error } = useAnalytics(() => getUtm(from, to), [from, to, refreshKey]);
  const rows = Array.isArray(data) ? data : [];

  return (
    <WidgetShell
      title="Campaign and UTM Performance"
      subtitle="Traffic by source and campaign"
      loading={loading}
      error={error}
      empty={rows.length === 0}
      emptyText="No tagged campaign traffic yet. Add UTM parameters to links you share:"
      emptyHint="?utm_source=linkedin&utm_campaign=profile"
    >
      <div className="an-table-wrap">
        <table className="an-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Campaign</th>
              <th className="num">Visits</th>
              <th className="num">Interactions</th>
              <th className="num">Conversions</th>
              <th className="num">Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.source}-${r.campaign}-${i}`}>
                <td>{r.source || 'direct'}</td>
                <td>{r.campaign || '-'}</td>
                <td className="num">{formatNum(r.visits)}</td>
                <td className="num">{formatNum(r.interactions)}</td>
                <td className="num">{formatNum(r.conversions)}</td>
                <td className="num">{formatPct(r.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetShell>
  );
};

export default UtmTable;
