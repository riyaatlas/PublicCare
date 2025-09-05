import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ComplaintHistory.css';

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/user/complaints/All', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only resolved complaints
        const resolvedComplaints = data.filter(complaint => 
          complaint.status === 'User Resolved'
        );
        setComplaints(resolvedComplaints);
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
    <div className="complaint-history-container">
      <div className="complaint-history-header">
        <h1 className="page-title">Complaint History</h1>
        <p className="page-subtitle">Your resolved complaints</p>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3 className="empty-title">No Resolved Complaints</h3>
          <p className="empty-description">Your complaint history will appear here once resolved.</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="complaint-card resolved">
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
                  <span className="category">{complaint.category}</span>
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

                <div className="complaint-timeline">
                  <div className="timeline-item">
                    <span className="timeline-label">Submitted:</span>
                    <span className="timeline-date">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-label">Resolved:</span>
                    <span className="timeline-date">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </span>
                  </div>
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