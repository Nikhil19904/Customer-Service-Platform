import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ServiceRequestForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const categories = [
    'General Queries',
    'Product Features Queries',
    'Product Pricing Queries',
    'Product Feature Implementation Requests'
  ];

  const { category, content } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
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

      await axios.post(
        'http://localhost:5000/api/service-requests',
        formData,
        config
      );

      setIsSubmitting(false);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="mb-0 fs-4">
                <i className="bi bi-ticket-detailed me-2"></i>
                Submit a New Service Request
              </h2>
            </div>
            <div className="card-body p-4 p-md-5 bg-light">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}
              <form onSubmit={onSubmit}>
                <div className="mb-4">
                  <label htmlFor="category" className="form-label fw-bold">
                    <i className="bi bi-tag me-2"></i>Category
                  </label>
                  <select
                    className="form-select form-select-lg py-3"
                    id="category"
                    name="category"
                    value={category}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="content" className="form-label fw-bold">
                    <i className="bi bi-chat-text me-2"></i>Description
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    id="content"
                    name="content"
                    value={content}
                    onChange={onChange}
                    rows="6"
                    placeholder="Please describe your request in detail..."
                    required
                    style={{ resize: 'none' }}
                  ></textarea>
                </div>
                <div className="d-grid gap-2 mt-5">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg py-3 shadow"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i>
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer bg-white p-4 text-center text-muted">
              <small>Your request will be processed by our support team as soon as possible</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestForm; 