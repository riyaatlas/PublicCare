import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const { token, user } = useAuth();
  const { toast } = useToast();

  const departments = ['All', 'Water Supply', 'Electricity', 'Waste Management', 'Roads', 'Healthcare'];

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/active-complaints', {
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

  const updateComplaintStatus = async (ticketNo) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/complaint/${ticketNo}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'In Progress',
          notes: 'Complaint reviewed and field team notified'
        }),
      });

      if (response.ok) {
        toast.success('Complaint marked as In Progress');
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

  const filteredComplaints = activeTab === 'All' 
    ? complaints 
    : complaints.filter(complaint => complaint.department === activeTab);

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
          <p>Loading active complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <div className="header-content">
          <h1 className="page-title">Active Complaints</h1>
          <p className="page-subtitle">
            {user?.role === 'superadmin' 
              ? 'All active complaints across departments'
              : `Active ${user?.department} complaints`
            }
          </p>
        </div>
        {user?.role === 'superadmin' && (
          <a href="/admin/register-subadmin" className="btn btn-primary">
            <span className="btn-icon">👤</span>
            Register SubAdmin
          </a>
        )}
      </div>

      {user?.role === 'superadmin' && (
        <div className="department-tabs">
          {departments.map((dept) => (
            <button
              key={dept}
              className={`tab-btn ${activeTab === dept ? 'active' : ''}`}
              onClick={() => setActiveTab(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      )}

      {filteredComplaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">No Active Complaints</h3>
          <p className="empty-description">
            {activeTab === 'All' 
              ? 'No complaints are currently active.'
              : `No active complaints in ${activeTab} department.`
            }
          </p>
        </div>
      ) : (
        <div className="complaints-grid">
          {filteredComplaints.map((complaint) => (
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
                  <span className="submission-date">
                    {new Date(complaint.created_at).toLocaleDateString()}
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

                {complaint.status === 'Pending' && (
                  <div className="complaint-actions">
                    <button 
                      onClick={() => updateComplaintStatus(complaint.ticket_no)}
                      className="btn btn-primary w-full"
                    >
                      <span className="btn-icon">👁️</span>
                      Review / Noted
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;