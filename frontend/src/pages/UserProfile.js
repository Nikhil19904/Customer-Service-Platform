import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    company: '',
    position: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        company: user.company || '',
        position: user.position || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const success = await updateProfile(formData);
      
      if (success) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });
        setIsEditing(false);
      } else {
        setMessage({
          type: 'danger',
          text: 'Failed to update profile. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'danger',
        text: 'An error occurred while updating your profile.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-info" role="alert">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card profile-card animate-card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div className="profile-image-container">
                <img
                  src={user.photo || 'https://via.placeholder.com/150'}
                  alt={user.name}
                  className="profile-image img-fluid rounded-circle mb-3"
                />
                <div className="profile-badges">
                  <span className="badge bg-primary">Customer</span>
                  {user.isAdmin && <span className="badge bg-danger ms-2">Admin</span>}
                </div>
              </div>
              
              <h4 className="profile-name">{user.name}</h4>
              <p className="profile-email text-muted">{user.email}</p>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline-primary mt-3"
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="col-md-8">
              {message && (
                <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                  {message.text}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMessage(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                    />
                    <div className="form-text text-muted">Email cannot be changed.</div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="company" className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-control"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="position" className="form-label">Position</label>
                      <input
                        type="text"
                        className="form-control"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          bio: user.bio || '',
                          company: user.company || '',
                          position: user.position || ''
                        });
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
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <h3 className="profile-section-title">Profile Information</h3>
                  
                  <div className="profile-info-item">
                    <div className="profile-info-label">
                      <i className="bi bi-building me-2"></i>
                      Company
                    </div>
                    <div className="profile-info-value">
                      {user.company || 'Not specified'}
                    </div>
                  </div>
                  
                  <div className="profile-info-item">
                    <div className="profile-info-label">
                      <i className="bi bi-briefcase me-2"></i>
                      Position
                    </div>
                    <div className="profile-info-value">
                      {user.position || 'Not specified'}
                    </div>
                  </div>
                  
                  <h3 className="profile-section-title mt-4">Bio</h3>
                  <p className="profile-bio">
                    {user.bio || 'No bio information provided.'}
                  </p>
                  
                  <h3 className="profile-section-title mt-4">Account Activity</h3>
                  <div className="profile-info-item">
                    <div className="profile-info-label">
                      <i className="bi bi-calendar-check me-2"></i>
                      Member Since
                    </div>
                    <div className="profile-info-value">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="profile-info-item">
                    <div className="profile-info-label">
                      <i className="bi bi-chat-left-text me-2"></i>
                      Service Requests
                    </div>
                    <div className="profile-info-value">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-link p-0 text-decoration-none"
                      >
                        View your requests
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 