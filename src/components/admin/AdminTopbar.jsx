import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, FolderOpen, User, Mail, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AdminTopbar.css';

const TABS = [
  { to: '/admin', label: 'Analytics', icon: BarChart3, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { to: '/admin/profile', label: 'Profile', icon: User },
  { to: '/admin/contact', label: 'Contact', icon: Mail },
  { to: '/admin/resume', label: 'Resume', icon: FileText },
];

const AdminTopbar = () => {
  const { logout } = useAuth();
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
    <header className="admin-topbar">
      <div className="admin-topbar-row admin-topbar-main">
        <div className="admin-topbar-brand">
          <span className="admin-topbar-title">Portfolio</span>
          <span className="admin-topbar-sep">/</span>
          <span className="admin-topbar-accent">Admin</span>
          <span className="admin-live-pill">
            <span className="admin-live-dot" />
            Live System
          </span>
        </div>
        <button className="admin-topbar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>

      <nav className="admin-topbar-row admin-topbar-tabs">
        {TABS.map(({ to, label, icon, end }) => {
          const Icon = icon;
          return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
          );
        })}
      </nav>
    </header>
  );
};

export default AdminTopbar;
