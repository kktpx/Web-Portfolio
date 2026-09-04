import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Globe, EyeOff, ArrowRight } from 'lucide-react';
import { getAllProjects } from '../../services/projectService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    hidden: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const projects = await getAllProjects();
      const published = projects.filter(p => p.is_published).length;
      
      setStats({
        total: projects.length,
        published,
        hidden: projects.length - published
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
      </div>

      <div className="admin-dashboard-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <FolderKanban size={24} />
          </div>
          <div className="admin-stat-content">
            <h3>Total Projects</h3>
            <div className="admin-stat-value">{loading ? '-' : stats.total}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Globe size={24} />
          </div>
          <div className="admin-stat-content">
            <h3>Published</h3>
            <div className="admin-stat-value">{loading ? '-' : stats.published}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#a0a0a0', backgroundColor: 'rgba(160, 160, 160, 0.1)' }}>
            <EyeOff size={24} />
          </div>
          <div className="admin-stat-content">
            <h3>Hidden</h3>
            <div className="admin-stat-value">{loading ? '-' : stats.hidden}</div>
          </div>
        </div>
      </div>

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
