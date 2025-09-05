import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './RegisterSubAdmin.css';

const departments = ['Water Supply', 'Electricity', 'Waste Management', 'Roads', 'Healthcare'];

const RegisterSubAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    department: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (user?.role !== 'superadmin') {
      toast.error('Only superadmin can register subadmins');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/admin/register-subadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setFormData({ name: '', email: '', phone: '', password: '', department: '' });
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="access-denied">
        <h3>Access Denied</h3>
        <p>Only superadmin can register subadmins.</p>
      </div>
    );
  }

  return (
    <div className="register-subadmin-container">
      <div className="register-subadmin-header">
        <h1 className="page-title">Register SubAdmin</h1>
        <p className="page-subtitle">Create department administrator accounts</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">👤 SubAdmin Registration Form</h2>
          <p className="card-description">Register a new administrator for a specific department</p>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="subadmin-form">
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="name" className="input-label">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="email" className="input-label">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="phone" className="input-label">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create password (default: admin123)"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="department" className="input-label">Department</label>
              <select 
                id="department"
                className="select-field"
                value={formData.department} 
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Registering...
                </>
              ) : (
                'Register SubAdmin'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterSubAdmin;