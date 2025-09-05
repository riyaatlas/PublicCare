import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ComplaintHistory.css';

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = useAuth();

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/complaint-history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading complaint history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-complaint-history-container">
      <div className="admin-complaint-history-header">
        <h1 className="page-title">Complaint History</h1>
        <p className="page-subtitle">
          {user?.role === 'superadmin' 
            ? 'All resolved complaints across departments'
            : `Resolved ${user?.department} complaints`
          }
        </p>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3 className="empty-title">No Resolved Complaints</h3>
          <p className="empty-description">Complaint history will appear here once complaints are resolved.</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {complaints.map((complaint, index) => (
            <div key={index} className="complaint-card resolved">
              <div className="complaint-header">
                <div className="complaint-ticket">
                  <h3 className="ticket-number">#{complaint.ticket_no}</h3>
                  <span className="badge badge-success">
                    <span className="status-icon">✅</span>
                    Resolved
                  </span>
                </div>
                <div className="complaint-meta">
                  <span className="department">{complaint.department}</span>
                  <span className="separator">•</span>
                  <span className="resolved-date">
                    Resolved: {new Date(complaint.resolved_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="complaint-content">
                <div className="complaint-section">
                  <h4 className="section-title">Description:</h4>
                  <p className="section-content">{complaint.description}</p>
                </div>
                
                <div className="complaint-section">
                  <h4 className="section-title">Location:</h4>
                  <p className="section-content">{complaint.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintHistory;