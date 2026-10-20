import React from 'react';
import { getCountries } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import WidgetShell from './WidgetShell';
import Flag from './Flag';
import { formatNum, formatPct } from './format';
import { countryName } from './journey';

const clampPct = (share) => {
  const p = typeof share === 'number' && Number.isFinite(share) ? share * 100 : 0;
  return Math.min(100, Math.max(0, p));
};

const TopCountries = ({ from, to, refreshKey }) => {
  const { data, loading, error } = useAnalytics(() => getCountries(from, to), [from, to, refreshKey]);
  const rows = Array.isArray(data) ? data : [];

  return (
    <WidgetShell
      title="Top Countries"
      subtitle="Where your visitors are located"
      loading={loading}
      error={error}
      empty={rows.length === 0}
      emptyText="No location data for this period."
    >
      <ul className="an-rank">
        {rows.map((r, i) => (
          <li key={`${r.country}-${i}`}>
            <div className="an-rank-row">
              <span className="an-country">
                <Flag code={r.country} />
                <span className="an-country-name">{countryName(r.country)}</span>
              </span>
              <span className="an-muted">
                {formatNum(r.visitors)} visitors · {formatPct(r.share)}
              </span>
            </div>
            <div className="an-bar"><span style={{ width: `${clampPct(r.share)}%` }} /></div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
};

export default TopCountries;
