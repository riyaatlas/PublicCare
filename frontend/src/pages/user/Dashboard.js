import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Dashboard.css';

const Dashboard = () => {
  const [formData, setFormData] = useState({
    description: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const { token } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/user/complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissionResult(data);
        setFormData({ description: '', location: '' });
        toast.success('Complaint submitted successfully!');
        
        // Hide the result message after 2 minutes
        setTimeout(() => {
          setSubmissionResult(null);
        }, 120000);
      } else {
        toast.error(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Raise Complaint</h1>
        <p className="dashboard-subtitle">Submit your public service complaints</p>
      </div>

      <div className="complaint-form-container">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📝 New Complaint</h2>
            <p className="card-description">
              Describe your issue and we'll route it to the appropriate department
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="complaint-form">
              <div className="input-group">
                <label htmlFor="description" className="input-label">
                  Description of the Problem *
                </label>
                <textarea
                  id="description"
                  placeholder="Please describe the issue in detail..."
                  className="textarea-field"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="location" className="input-label">
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="Enter the specific location of the issue"
                  className="input-field"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                    Submitting Complaint...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </form>

            {submissionResult && (
              <div className="submission-result">
                <div className="result-icon">✅</div>
                <h3 className="result-title">Complaint Submitted Successfully!</h3>
                <div className="result-details">
                  <div className="result-item">
                    <span className="result-label">Ticket Number:</span>
                    <span className="result-value">#{submissionResult.ticket_no}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Department:</span>
                    <span className="result-value">{submissionResult.department}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Status:</span>
                    <span className="badge badge-warning">{submissionResult.status}</span>
                  </div>
                </div>
                <p className="result-note">
                  Your complaint has been forwarded to the {submissionResult.department} department. 
                  You can track its progress in your Active Complaints section.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">🚀</div>
            <h3 className="info-title">Quick Processing</h3>
            <p className="info-description">
              Your complaints are automatically routed to the right department using AI
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">📱</div>
            <h3 className="info-title">Track Progress</h3>
            <p className="info-description">
              Monitor your complaint status in real-time through your dashboard
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">✅</div>
            <h3 className="info-title">Get Resolved</h3>
            <p className="info-description">
              Mark complaints as solved once the issue has been addressed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;