import React from 'react';

// Shared card chrome: title, loading skeleton, small error, empty state.
const WidgetShell = ({ title, subtitle, actions, loading, error, empty, emptyText, emptyHint, children }) => (
  <section className="an-card">
    {(title || actions) && (
      <div className="an-card-head">
        <div>
          {title && <h2 className="an-card-title">{title}</h2>}
          {subtitle && <p className="an-card-sub">{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    {loading ? (
      <div className="an-skeleton" aria-busy="true" aria-label="Loading" />
    ) : error ? (
      <p className="an-error" role="alert">Could not load this data. Try Refresh.</p>
    ) : empty ? (
      <div className="an-empty">
        <p>{emptyText || 'No data for this period.'}</p>
        {emptyHint && <code>{emptyHint}</code>}
      </div>
    ) : (
      children
    )}
  </section>
);

export default WidgetShell;
