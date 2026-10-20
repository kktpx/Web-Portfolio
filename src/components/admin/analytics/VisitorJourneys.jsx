import React, { useMemo, useState } from 'react';
import { GitBranch, Users, Zap, Link as LinkIcon, Calendar } from 'lucide-react';
import { getVisits } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import WidgetShell from './WidgetShell';
import Flag from './Flag';
import VisitTrailModal from './VisitTrailModal';
import { formatNum } from './format';
import { formatDuration, formatStart, journeyDays, relativeAge, shortVisitor } from './journey';

// lucide-react has no brand icons; GitBranch/Users stand in for GitHub/Facebook.
const SourceIcon = ({ source }) => {
  if (source === 'GitHub') return <GitBranch size={13} />;
  if (source === 'Facebook') return <Users size={13} />;
  if (source === 'Direct') return <Zap size={13} />;
  return <LinkIcon size={13} />;
};

const VisitorJourneys = ({ refreshKey }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pills = useMemo(() => journeyDays(new Date()), [refreshKey]);
  const [day, setDay] = useState(null);
  const [selected, setSelected] = useState(null);
  const { data, loading, error } = useAnalytics(() => getVisits(30, day), [day, refreshKey]);
  const visits = Array.isArray(data) ? data : [];
  const now = new Date();
  const onPill = pills.some((p) => p.day === day);

  const actions = (
    <div className="an-journey-filters">
      <div className="an-tabs" role="group" aria-label="Filter by day">
        {pills.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`an-tab${p.day === day ? ' active' : ''}`}
            aria-pressed={p.day === day}
            onClick={() => setDay(p.day)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <label className={`an-date${day && !onPill ? ' active' : ''}`}>
        <Calendar size={14} aria-hidden="true" />
        <input
          type="date"
          aria-label="Pick a day"
          value={day || ''}
          onChange={(e) => setDay(e.target.value || null)}
        />
      </label>
    </div>
  );

  return (
    <>
      <WidgetShell
        title="Recent Anonymous Visitor Journeys"
        subtitle="Real visitor trails with referral origin detection. Filter by day or pick a date (UTC)."
        actions={actions}
        loading={loading}
        error={error}
        empty={visits.length === 0}
        emptyText={day ? 'No visits on this day.' : 'No visits recorded yet.'}
      >
        <div className="an-journey-grid">
          {visits.map((v, i) => {
            const source = v.source || 'Direct';
            const direct = source === 'Direct';
            return (
              <article
                key={v.visit_id || i}
                className={`an-journey${direct ? '' : ' highlight'}`}
              >
                <div className="an-journey-top">
                  <span className="an-source">
                    <SourceIcon source={source} /> {source}
                  </span>
                  <span className="an-journey-time">
                    {formatStart(v.started_at)}{' '}
                    <span className="an-muted">{relativeAge(v.started_at, now)}</span>
                  </span>
                </div>
                <div className="an-journey-stats">
                  <span><small>DURATION</small> <b>{formatDuration(v.duration_seconds)}</b></span>
                  <span><small>ACTIVITY</small> <b>{formatNum(v.events)} events</b></span>
                </div>
                <div className="an-journey-meta">
                  <code>Visitor #{shortVisitor(v.visitor)}</code>
                  <code>{v.device || 'unknown'}</code>
                  <code className="an-journey-country">
                    <Flag code={v.country} /> {v.country || 'XX'}
                  </code>
                </div>
                <button
                  type="button"
                  className="an-link-btn"
                  disabled={!v.visit_id}
                  onClick={() => setSelected(v)}
                >
                  View Trail →
                </button>
              </article>
            );
          })}
        </div>
      </WidgetShell>
      {selected && (
        <VisitTrailModal
          visitId={selected.visit_id}
          visit={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default VisitorJourneys;
