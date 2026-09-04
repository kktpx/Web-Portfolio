import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AdminSidebar.css';

const AdminSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className={`admin-sidebar ${isMobileOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <span className="highlight">Portfolio</span> Admin
        </div>
        <button className="admin-close-mobile" onClick={onCloseMobile}>
          <X size={24} />
        </button>
      </div>

      <div className="admin-user-info">
        <div className="admin-user-avatar">
          {user?.email?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="admin-user-details">
          <span className="admin-user-role">Administrator</span>
          <span className="admin-user-email" title={user?.email}>{user?.email}</span>
        </div>
      </div>

      <nav className="admin-nav">
        <NavLink 
          to="/admin" 
          end
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={onCloseMobile}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/admin/portfolio" 
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={onCloseMobile}
        >
          <FolderOpen size={20} />
          <span>Portfolio Showcase</span>
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        <a href="/" className="admin-return-link" target="_blank" rel="noopener noreferrer">
          View Public Site ↗
        </a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
