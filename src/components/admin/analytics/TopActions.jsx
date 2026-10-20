import React from 'react';
import { getTopActions } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import WidgetShell from './WidgetShell';
import { formatNum, formatPct } from './format';

const TopActions = ({ from, to, refreshKey }) => {
  const { data, loading, error } = useAnalytics(() => getTopActions(from, to), [from, to, refreshKey]);
  const rows = Array.isArray(data) ? data : [];
  const width = (f) => `${Math.min(100, Math.max(0, Math.round((Number.isFinite(f) ? f : 0) * 100)))}%`;

  return (
    <WidgetShell
      title="Most Popular Actions"
      subtitle="Top interactions by share"
      loading={loading}
      error={error}
      empty={rows.length === 0}
      emptyText="No interactions in this period."
    >
      <ol className="an-rank an-rank-numbered">
        {rows.map((r, i) => (
          <li key={`${r.kind}-${r.label}-${i}`}>
            <div className="an-rank-row">
              <span><span className="an-rank-no">{i + 1}</span>{r.label || r.kind || 'Unknown'}</span>
              <span>{formatNum(r.count)} <span className="an-muted">({formatPct(r.share)})</span></span>
            </div>
            <div className="an-bar"><span style={{ width: width(r.share) }} /></div>
          </li>
        ))}
      </ol>
    </WidgetShell>
  );
};

export default TopActions;
