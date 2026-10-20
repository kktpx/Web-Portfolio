import React, { useState } from 'react';
import { getGoals, getSections } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import WidgetShell from './WidgetShell';
import { formatNum, formatPct } from './format';

const GOALS = [
  { key: 'resume', label: 'Resume Downloads' },
  { key: 'project', label: 'Project Deep Dives' },
  { key: 'outbound', label: 'Live Demos & GitHub' },
  { key: 'contact', label: 'Direct Inquiries' },
];
const barWidth = (f) =>
  `${Math.min(100, Math.max(0, Math.round((Number.isFinite(f) ? f : 0) * 100)))}%`;

const GoalsPanel = ({ from, to, refreshKey }) => {
  const [tab, setTab] = useState('goals');
  const isGoals = tab === 'goals';
  const { data, loading, error } = useAnalytics(
    () => (tab === 'goals' ? getGoals(from, to) : getSections(from, to)),
    [from, to, refreshKey, tab]
  );

  // Guard against a stale payload of the other tab's shape while switching.
  const goalsData = isGoals && data && !Array.isArray(data) && typeof data === 'object' ? data : {};
  const sections = !isGoals && Array.isArray(data) ? data : [];
  const goalsEmpty = GOALS.every((g) => !(goalsData[g.key] && goalsData[g.key].visits > 0));
  const sectionsEmpty = sections.length === 0 || sections.every((s) => !s.visits);

  return (
    <WidgetShell
      title="Recruiter Intent"
      subtitle={isGoals ? 'Share of visits reaching each goal' : 'Share of visits that reached each section'}
      actions={
        <div className="an-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={isGoals} className={`an-tab ${isGoals ? 'active' : ''}`} onClick={() => setTab('goals')}>
            Conversion Goals
          </button>
          <button type="button" role="tab" aria-selected={!isGoals} className={`an-tab ${!isGoals ? 'active' : ''}`} onClick={() => setTab('sections')}>
            Section Retention
          </button>
        </div>
      }
      loading={loading}
      error={error}
      empty={isGoals ? goalsEmpty : sectionsEmpty}
      emptyText={isGoals ? 'No conversions in this period.' : 'No section views in this period.'}
    >
      {isGoals ? (
        <div className="an-goal-grid">
          {GOALS.map((g) => {
            const v = goalsData[g.key] || {};
            return (
              <div key={g.key} className="an-goal">
                <span className="an-stat-label">{g.label}</span>
                <div className="an-stat-value-sm">{formatPct(v.rate)}</div>
                <div className="an-bar"><span style={{ width: barWidth(v.rate) }} /></div>
                <span className="an-muted">{formatNum(v.visits)} visits</span>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="an-rank">
          {sections.map((s) => (
            <li key={s.section}>
              <div className="an-rank-row">
                <span className="an-cap">{s.section}</span>
                <span>{formatPct(s.rate)} <span className="an-muted">({formatNum(s.visits)})</span></span>
              </div>
              <div className="an-bar"><span style={{ width: barWidth(s.rate) }} /></div>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
};

export default GoalsPanel;
