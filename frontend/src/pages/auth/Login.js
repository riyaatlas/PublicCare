import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Login.css';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isAdmin ? '/admin/login' : '/user/login';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
        id: data.user?.id,
        name: data.user?.name,
        email: data.user?.email,
        phone: data.user?.phone,
        role: data.user?.role,
        department: data.user?.department,
      };
        login(data.access_token, userData);
        
        toast.success('Welcome to PublicCare!');

        // Navigate based on role
        if (userData.role === 'user') {
          navigate('/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">PC</div>
          <h1 className="login-title">PublicCare Login</h1>
          <p className="login-subtitle">Access your public service dashboard</p>
        </div>

        <div className="login-content">
          <div className="login-tabs">
            <button
              type="button"
              className={`tab-btn ${!isAdmin ? 'active' : ''}`}
              onClick={() => setIsAdmin(false)}
            >
              User Login
            </button>
            <button
              type="button"
              className={`tab-btn ${isAdmin ? 'active' : ''}`}
              onClick={() => setIsAdmin(true)}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                `Sign In as ${isAdmin ? 'Admin' : 'User'}`
              )}
            </button>
          </form>

          {!isAdmin && (
            <div className="register-section">
              <div className="divider">
                <span>New User?</span>
              </div>
              <Link to="/register" className="btn btn-secondary w-full">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;