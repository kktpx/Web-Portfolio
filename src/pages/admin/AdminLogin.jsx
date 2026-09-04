import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAdmin, loading, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in and admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Wait for the onAuthStateChange in useAuth to verify admin status
      // The useEffect above will handle the redirect once isAdmin becomes true
    } catch (err) {
      setError(err.message || 'Invalid login credentials');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="admin-login-screen">Loading...</div>;
  }

  return (
    <div className="admin-login-screen">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>Portfolio <span className="highlight">Admin</span></h2>
          <p>Sign in to manage your portfolio</p>
        </div>

        {error && <div className="admin-login-error">{error}</div>}
        
        {user && !isAdmin && !loading && (
          <div className="admin-login-error">
            Your account does not have administrator privileges.
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input"
              placeholder="admin@example.com"
            />
          </div>

          <div className="admin-login-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? 'Signing in...' : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <a href="/">← Return to public site</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
