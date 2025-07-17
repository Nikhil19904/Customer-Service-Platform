import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  joinServiceRequestRoom, 
  leaveServiceRequestRoom 
} from '../services/socketService';
import './ServiceRequestDetail.css';

// Use environment variable or default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ServiceRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceRequest, setServiceRequest] = useState(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    const fetchServiceRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get(
          `${API_URL}/service-requests/${id}`,
          config
        );
        
        setServiceRequest(response.data);
        setContent(response.data.content);
        setIsLoading(false);
        
        // Join the socket room for this specific service request
        joinServiceRequestRoom(id);
      } catch (error) {
        setError('Failed to fetch service request');
        setIsLoading(false);
      }
    };

    fetchServiceRequest();
    
    // Leave the room when component unmounts
    return () => {
      leaveServiceRequestRoom(id);
    };
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.put(
        `${API_URL}/service-requests/${id}`,
        { content },
        config
      );

      setServiceRequest(response.data);
      setIsEditing(false);
      setIsSubmitting(false);
      showNotification('Service request updated successfully', 'success');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      setIsSubmitting(false);
      showNotification('Failed to update service request', 'danger');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this service request?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`${API_URL}/service-requests/${id}`, config);
      
      navigate('/dashboard');
      // We'll rely on the socket event to update the dashboard
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      setIsDeleting(false);
      showNotification('Failed to delete service request', 'danger');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!serviceRequest) {
    return (
      <div className="alert alert-warning" role="alert">
        Service request not found.
      </div>
    );
  }

  return (
    <div className="container">
      {notification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
          {notification.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setNotification(null)} 
            aria-label="Close"
          ></button>
        </div>
      )}
    
      <div className="card mt-4 detail-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h2>Service Request Details</h2>
            <div className="d-flex align-items-center mt-2">
              <span className="badge bg-primary me-2">{serviceRequest.category}</span>
              <span className={`badge ${getStatusBadgeClass(serviceRequest.status)}`}>
                {serviceRequest.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back to Dashboard
          </button>
        </div>
        <div className="card-body">
          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">
                  Update your request
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="6"
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setContent(serviceRequest.content);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    <><i className="bi bi-check-circle me-1"></i> Update Request</>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-4">
                <p className="card-text content-text">{serviceRequest.content}</p>
                <div className="d-flex">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline-primary me-2"
                  >
                    <i className="bi bi-pencil me-1"></i> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn btn-outline-danger"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-trash me-1"></i>
                    )}
                    Delete
                  </button>
                </div>
              </div>
              <div className="d-flex justify-content-between flex-wrap">
                <div className="detail-info-group">
                  <p className="mb-1"><strong><i className="bi bi-calendar me-1"></i> Created:</strong> {formatDate(serviceRequest.createdAt)}</p>
                  <p className="mb-0"><strong><i className="bi bi-clock-history me-1"></i> Last Updated:</strong> {formatDate(serviceRequest.updatedAt)}</p>
                </div>
                {serviceRequest.intercomConversationId && (
                  <div className="detail-info-group">
                    <p className="mb-0">
                      <strong><i className="bi bi-chat-square-text me-1"></i> Intercom Conversation ID:</strong> 
                      <span className="intercom-id">{serviceRequest.intercomConversationId}</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get badge color based on status
function getStatusBadgeClass(status) {
  switch (status) {
    case 'Open':
      return 'bg-secondary';
    case 'In Progress':
      return 'bg-info';
    case 'Resolved':
      return 'bg-success';
    case 'Closed':
      return 'bg-dark';
    default:
      return 'bg-secondary';
  }
}

export default ServiceRequestDetail; 