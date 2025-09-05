import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">View your account information</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">👤 Profile Information</h2>
        </div>
        <div className="card-content">
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">{user?.role}</span>
            </div>
            {user?.department && (
              <div className="info-item">
                <span className="info-label">Department:</span>
                <span className="info-value">{user.department}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;