const express = require('express');
const passport = require('passport');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {googleAuthCallback, getCurrentUser, logout} = require('../controllers/authController');

// Get frontend URL from environment or use default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';

// Custom error handler for Google auth
const handleGoogleAuth = (req, res, next) => {
  console.log('Starting Google authentication...');
  try {
    passport.authenticate('google', { 
      scope: ['profile', 'email']
    })(req, res, (err) => {
      if (err) {
        console.error('Google auth error:', err);
        return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(err.message || 'auth_failed')}`);
      }
      next();
    });
  } catch (error) {
    console.error('Critical error in Google auth:', error);
    return res.redirect(`${FRONTEND_URL}/login?error=critical_error`);
  }
};

// Custom error handler for Google callback
const handleGoogleCallback = (req, res, next) => {
  console.log('Handling Google callback...');
  try {
    passport.authenticate('google', { 
      failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`
    })(req, res, (err) => {
      if (err) {
        console.error('Google callback error:', err);
        return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(err.message || 'auth_failed')}`);
      }
      next();
    });
  } catch (error) {
    console.error('Critical error in Google callback:', error);
    return res.redirect(`${FRONTEND_URL}/login?error=critical_error`);
  }
};

// Google OAuth routes with improved error handling
router.get('/google', handleGoogleAuth);
router.get('/google/callback', handleGoogleCallback, googleAuthCallback);

// Test route to verify auth is working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes are working correctly',
    clientID: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
    env: process.env.NODE_ENV || 'not set'
  });
});

// User routes
router.get('/me', protect, getCurrentUser);
router.get('/logout', protect, logout);

// Add a database connection status check route
router.get('/db-status', (req, res) => {
  const mongoose = require('mongoose');
  const isDevelopmentMode = process.env.GOOGLE_CLIENT_ID === 'dummy_client_id';
  
  if (isDevelopmentMode) {
    return res.json({
      status: 'development',
      message: 'Running in development mode with mock data',
      connected: true
    });
  }
  
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: states[state] || 'unknown',
    message: state === 1 ? 'Database connection is healthy' : 'Database is not connected',
    connected: state === 1
  });
});

module.exports = router; 