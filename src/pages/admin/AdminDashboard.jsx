import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RangeBar from '../../components/admin/analytics/RangeBar';
import { computeRange } from '../../components/admin/analytics/range';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [range, setRange] = useState(7);
  const [refreshKey, setRefreshKey] = useState(0);

  // Recomputed only when range or refreshKey changes. Pass { from, to, refreshKey } to widgets.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { from, to } = useMemo(() => computeRange(range), [range, refreshKey]);

  return (
    <div className="admin-page-container">
      <div className="analytics-header">
        <div>
          <div className="analytics-eyebrow">
            <span>BEHAVIORAL &amp; CONVERSION ANALYTICS</span>
            <span className="analytics-live-pill">Live Sync</span>
          </div>
          <h1 className="admin-page-title">Portfolio Analytics</h1>
          <p className="analytics-subtitle">
            How visitors find, explore and convert on your portfolio.
          </p>
        </div>
        <RangeBar
          range={range}
          onChange={setRange}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <div className="analytics-widgets" data-from={from} data-to={to}>
        {/* Task 7 widgets mount here */}
        {/* Task 8 widgets mount here */}
      </div>

      <div className="admin-dashboard-actions">
        <div className="admin-card action-card">
          <h2>Portfolio Management</h2>
          <p>Add new projects, update existing ones, or manage visibility on the public site.</p>
          <Link to="/admin/projects" className="admin-btn admin-btn-primary">
            Manage Portfolio <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
