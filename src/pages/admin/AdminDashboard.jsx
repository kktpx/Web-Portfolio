import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAnalyticsSummary, getAnalyticsByDate, getTopProjects, getEventBreakdown } from '../../services/analyticsService';
import AnalyticsCards from '../../components/admin/AnalyticsCards';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
import TopProjects from '../../components/admin/TopProjects';
import EventBreakdown from '../../components/admin/EventBreakdown';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState(7); // 7, 30, or null (all time)
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [eventBreakdown, setEventBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, dailyData, projectsData, breakdownData] = await Promise.all([
        getAnalyticsSummary(dateRange),
        getAnalyticsByDate(dateRange),
        getTopProjects(dateRange),
        getEventBreakdown(dateRange)
      ]);

      setAnalytics(summaryData);
      setChartData(dailyData);
      setTopProjects(projectsData);
      setEventBreakdown(breakdownData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Analytics Dashboard</h1>
        
        <div className="analytics-date-filter">
          <button 
            className={`filter-btn ${dateRange === 7 ? 'active' : ''}`}
            onClick={() => setDateRange(7)}
          >
            7 Days
          </button>
          <button 
            className={`filter-btn ${dateRange === 30 ? 'active' : ''}`}
            onClick={() => setDateRange(30)}
          >
            30 Days
          </button>
          <button 
            className={`filter-btn ${dateRange === null ? 'active' : ''}`}
            onClick={() => setDateRange(null)}
          >
            All Time
          </button>
        </div>
      </div>

      {error && (
        <div className="analytics-error-state">
          <p>{error}</p>
          <button className="admin-btn admin-btn-secondary" onClick={loadAnalytics}>Retry</button>
        </div>
      )}

      {!error && !loading && (!analytics || analytics.pageViews === 0) && (
        <div className="analytics-empty-state">
          <p>No analytics data available yet. Events will appear here once visitors start interacting with your portfolio.</p>
        </div>
      )}

      {(!error && (loading || (analytics && analytics.pageViews > 0))) && (
        <>
          <AnalyticsCards data={analytics} loading={loading} />
          
          <AnalyticsChart data={chartData} loading={loading} />
          
          <div className="analytics-grid-2col">
            <TopProjects data={topProjects} loading={loading} />
            <EventBreakdown data={eventBreakdown} loading={loading} />
          </div>
        </>
      )}

      <div className="admin-dashboard-actions">
        <div className="admin-card action-card">
          <h2>Portfolio Management</h2>
          <p>Add new projects, update existing ones, or manage visibility on the public site.</p>
          <Link to="/admin/portfolio" className="admin-btn admin-btn-primary">
            Manage Portfolio <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
