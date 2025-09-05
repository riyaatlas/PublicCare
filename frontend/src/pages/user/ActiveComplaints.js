import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './ActiveComplaints.css';

const ActiveComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { toast } = useToast();

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/user/complaints/active', {
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

  const markAsSolved = async (ticketNo) => {
    try {
      const response = await fetch(`http://localhost:5000/user/complaint/${ticketNo}/mark_solved`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Complaint marked as resolved!');
        fetchComplaints(); // Refresh the list
      } else {
        toast.error('Failed to update complaint status');
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return '⏳';
      case 'In Progress':
        return '🔄';
      default:
        return '✅';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'badge-warning';
      case 'In Progress':
        return 'badge-info';
      default:
        return 'badge-success';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-complaints-container">
      <div className="active-complaints-header">
        <h1 className="page-title">Active Complaints</h1>
        <p className="page-subtitle">Track your pending and in-progress complaints</p>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3 className="empty-title">No Active Complaints</h3>
          <p className="empty-description">All your complaints have been resolved!</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="complaint-card">
              <div className="complaint-header">
                <div className="complaint-ticket">
                  <h3 className="ticket-number">#{complaint.ticket_no}</h3>
                  <span className={`badge ${getStatusClass(complaint.status)}`}>
                    <span className="status-icon">{getStatusIcon(complaint.status)}</span>
                    {complaint.status}
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

                <div className="complaint-footer">
                  <div className="submission-date">
                    Submitted: {new Date(complaint.created_at).toLocaleDateString()}
                  </div>
                  
                  {complaint.status === 'In Progress' && (
                    <button 
                      onClick={() => markAsSolved(complaint.ticket_no)}
                      className="btn btn-success"
                    >
                      <span className="btn-icon">✅</span>
                      Mark as Solved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveComplaints;