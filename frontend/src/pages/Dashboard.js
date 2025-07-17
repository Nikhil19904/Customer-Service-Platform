import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { 
  subscribeToServiceRequests, 
  unsubscribeFromServiceRequests 
} from '../services/socketService';
import './Dashboard.css';

// Use an environment variable or a config value 
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [notification, setNotification] = useState(null);
  const { user } = useContext(AuthContext);

  const categories = [
    'All',
    'General Queries',
    'Product Features Queries',
    'Product Pricing Queries',
    'Product Feature Implementation Requests'
  ];

  // Function to fetch service requests
  const fetchServiceRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      let url = `${API_URL}/service-requests`;
      if (selectedCategory !== 'All') {
        url = `${API_URL}/service-requests/category/${selectedCategory}`;
      }

      const response = await axios.get(url, config);
      setServiceRequests(response.data);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to fetch service requests');
      setIsLoading(false);
    }
  }, [selectedCategory]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((type, data) => {
    switch (type) {
      case 'new':
        // Only add if it matches the selected category or if viewing all categories
        if (selectedCategory === 'All' || data.category === selectedCategory) {
          setServiceRequests(prevRequests => [data, ...prevRequests]);
          showNotification('New service request received');
        }
        break;
        
      case 'update':
        setServiceRequests(prevRequests => 
          prevRequests.map(request => 
            request._id === data._id ? data : request
          )
        );
        showNotification('A service request was updated');
        break;
        
      case 'delete':
        setServiceRequests(prevRequests => 
          prevRequests.filter(request => request._id !== data._id)
        );
        showNotification('A service request was deleted');
        break;
        
      default:
        break;
    }
  }, [selectedCategory]);

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Initial load and socket subscription
  useEffect(() => {
    fetchServiceRequests();
    
    // Subscribe to real-time updates
    subscribeToServiceRequests(handleRealtimeUpdate);
    
    // Cleanup function to unsubscribe
    return () => {
      unsubscribeFromServiceRequests();
    };
  }, [fetchServiceRequests, handleRealtimeUpdate]);

  // Handle delete request
  const handleDelete = async (id) => {
    setIsDeleting(true);
    setDeleteId(id);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`${API_URL}/service-requests/${id}`, config);
      
      // Remove the deleted request from state
      // Note: The socket update might also handle this, but we'll update locally for immediate feedback
      setServiceRequests(prevRequests => 
        prevRequests.filter(request => request._id !== id)
      );
      
      showNotification('Service request deleted successfully');
    } catch (error) {
      showNotification('Failed to delete service request');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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

  return (
    <div className="container">
      {notification && (
        <div className="alert alert-info alert-dismissible fade show notification-alert" role="alert">
          {notification}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setNotification(null)} 
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{user?.name ? `${user.name}'s` : 'Your'} Service Requests</h2>
        <div>
          <Link to="/profile" className="btn btn-outline-primary me-2">
            <i className="bi bi-person-circle me-1"></i> Profile
          </Link>
          <Link to="/new-request" className="btn btn-primary">
            <i className="bi bi-plus-circle me-1"></i> New Request
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Filter by Category</h5>
          <div className="d-flex flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                className={`btn ${
                  selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'
                } me-2 mb-2`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {serviceRequests.length === 0 ? (
        <div className="alert alert-info">
          No service requests found. Create a new request to get started.
        </div>
      ) : (
        <div className="row">
          {serviceRequests.map((request) => (
            <div className="col-md-6 mb-4" key={request._id}>
              <div className="card h-100 service-request-card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary">{request.category}</span>
                  <span className="badge bg-secondary">{request.status}</span>
                </div>
                <div className="card-body">
                  <p className="card-text">{request.content.substring(0, 150)}...</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Created: {formatDate(request.createdAt)}</small>
                    <div className="btn-group">
                      <Link to={`/requests/${request._id}`} className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-eye me-1"></i> View
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(request._id)}
                        disabled={isDeleting && deleteId === request._id}
                      >
                        {isDeleting && deleteId === request._id ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-trash me-1"></i>
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                {request.updatedAt !== request.createdAt && (
                  <div className="card-footer text-muted small">
                    <i className="bi bi-clock-history me-1"></i>
                    Updated: {formatDate(request.updatedAt)}
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

export default Dashboard; 