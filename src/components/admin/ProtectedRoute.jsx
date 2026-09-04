import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="admin-spinner" style={{ width: 40, height: 40, border: '3px solid rgba(255, 204, 0, 0.2)', borderTopColor: '#ffcc00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Verifying authorization...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: '#ffcc00', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You do not have administrator privileges to access this area.</p>
        <a href="/" style={{ padding: '0.8rem 2rem', backgroundColor: '#2a2a2a', color: '#fff', textDecoration: 'none', borderRadius: '30px', transition: 'all 0.3s ease' }}>← Return to Portfolio</a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
