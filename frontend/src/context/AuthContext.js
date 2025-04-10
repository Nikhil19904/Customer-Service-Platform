import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { initSocket, disconnectSocket } from '../services/socketService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from local storage on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Configure axios with token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get('http://localhost:5000/api/auth/me', config);

        setUser(response.data);
        setIsAuthenticated(true);
        
        // Initialize socket connection after successful authentication
        initSocket(token);
        
        setIsLoading(false);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setError(error.response?.data?.message || 'An error occurred');
        setIsLoading(false);
      }
    };

    loadUser();
    
    // Cleanup function to disconnect socket when component unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  // Set token in localStorage and update state
  const setToken = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    
    // Initialize socket connection when token is set
    initSocket(token);
    
    // Load user data with the new token
    const loadUserWithToken = async () => {
      try {
        // Configure axios with token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get('http://localhost:5000/api/auth/me', config);
        setUser(response.data);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    
    loadUserWithToken();
  };

  // Load user data with token
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Configure axios with token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get('http://localhost:5000/api/auth/me', config);

      setUser(response.data);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(error.response?.data?.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return false;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.put(
        'http://localhost:5000/api/users/profile', 
        userData,
        config
      );

      setUser(response.data);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        await axios.get('http://localhost:5000/api/auth/logout', config);
      }
      
      // Disconnect socket
      disconnectSocket();
      
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        setToken,
        loadUser,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 