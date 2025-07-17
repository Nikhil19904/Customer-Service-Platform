import React, { useContext, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const loginCardRef = useRef(null);
  const loginElementsRef = useRef([]);

  useEffect(() => {
    // Animate login card on load
    if (loginCardRef.current) {
      setTimeout(() => {
        loginCardRef.current.classList.add('login-card-visible');
      }, 300);
    }

    // Animate elements sequentially
    loginElementsRef.current.forEach((element, index) => {
      if (element) {
        setTimeout(() => {
          element.classList.add('login-element-visible');
        }, 600 + (index * 200));
      }
    });
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-shape login-shape-1"></div>
        <div className="login-shape login-shape-2"></div>
        <div className="login-shape login-shape-3"></div>
        <div className="login-shape login-shape-4"></div>
      </div>
      
      <div className="login-card-wrapper">
        <div className="login-card" ref={loginCardRef}>
          <div className="login-card-content">
            <div 
              className="login-header login-element" 
              ref={el => loginElementsRef.current[0] = el}
            >
              <div className="login-logo">
                <i className="bi bi-headset login-logo-icon"></i>
              </div>
              <h2>Welcome Back</h2>
              <p>Log in to access the Customer Service Platform</p>
            </div>
            
            <div 
              className="login-divider login-element" 
              ref={el => loginElementsRef.current[1] = el}
            >
              <span className="login-divider-text">Sign in with</span>
            </div>
            
            <div 
              className="login-button-container login-element" 
              ref={el => loginElementsRef.current[2] = el}
            >
              <button
                onClick={handleGoogleLogin}
                className="login-google-button"
                type="button"
              >
                <div className="login-button-content">
                  <i className="bi bi-google"></i>
                  <span>Google</span>
                </div>
                <div className="login-button-shine"></div>
              </button>
            </div>
            
            <div 
              className="login-info login-element" 
              ref={el => loginElementsRef.current[3] = el}
            >
              <p>
                Secure authentication powered by Google
                <i className="bi bi-shield-check ms-2"></i>
              </p>
              <div className="login-features">
                <div className="login-feature">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Track your requests</span>
                </div>
                <div className="login-feature">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Quick customer support</span>
                </div>
                <div className="login-feature">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Secure communication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 