import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Set token in context/localStorage
      setToken(token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // No token found, redirect to login
      navigate('/login');
    }
  }, [searchParams, setToken, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoginSuccess; 