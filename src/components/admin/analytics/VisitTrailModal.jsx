import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getVisitTrail } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import Flag from './Flag';
import { countryName, eventLabel, formatClock, shortVisitor } from './journey';

const VisitTrailModal = ({ visitId, onClose, visit }) => {
  const { data, loading, error } = useAnalytics(() => getVisitTrail(visitId), [visitId]);
  const rows = Array.isArray(data) ? data : [];
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    const prev = document.activeElement;
    if (dialogRef.current) dialogRef.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (f.length === 0) { e.preventDefault(); return; }
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, []);

  return (
    <div className="an-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeRef.current(); }}>
      <div
        className="an-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="an-trail-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="an-modal-head">
          <div>
            <h2 id="an-trail-title" className="an-card-title">Visitor Trail</h2>
            <p className="an-card-sub an-trail-meta">
              {visit && (
                <>
                  <Flag code={visit.country} /> {countryName(visit.country)} ·{' '}
                </>
              )}
              Visitor #{shortVisitor(visit ? visit.visitor : '')}
            </p>
          </div>
          <button type="button" className="an-icon-btn" onClick={() => closeRef.current()} aria-label="Close trail">
            <X size={18} />
          </button>
        </div>
        {loading ? (
          <div className="an-skeleton" aria-busy="true" aria-label="Loading" />
        ) : error ? (
          <p className="an-error" role="alert">Could not load this trail.</p>
        ) : rows.length === 0 ? (
          <div className="an-empty"><p>No events recorded for this visit.</p></div>
        ) : (
          <ol className="an-trail">
            {rows.map((r, i) => (
              <li key={`${r.created_at}-${i}`} className="an-trail-item">
                <time className="an-trail-time">{formatClock(r.created_at)}</time>
                <div className="an-trail-body">
                  <strong>{eventLabel(r.event_type)}</strong>
                  {(r.project_title || r.section || r.page_path) && (
                    <span className="an-muted">
                      {[r.project_title, r.section, r.page_path].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default VisitTrailModal;
