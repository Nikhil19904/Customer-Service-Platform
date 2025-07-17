const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get frontend URL from environment or use default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Handle successful Google OAuth login
const googleAuthCallback = async (req, res) => {
  try {
    // Check if we're in development mode with dummy credentials
    if (process.env.GOOGLE_CLIENT_ID === 'dummy_client_id') {
      // Create a dummy user for development
      let user = await User.findOne({ email: 'testuser@example.com' });
      
      if (!user) {
        user = new User({
          googleId: '123456789',
          name: 'Test User',
          email: 'testuser@example.com',
          photo: 'https://via.placeholder.com/50'
        });
        
        await user.save();
      }
      
      req.user = user;
    }
    
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/login/success?token=${token}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
   
    if (process.env.GOOGLE_CLIENT_ID === 'dummy_client_id' && !req.user) {
      const user = await User.findOne({ email: 'testuser@example.com' });
      
      if (user) {
        return res.json(user);
      }
    }
    
    const user = await User.findById(req.user.id).select('-__v');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
const logout = (req, res) => {
  req.logout(function(err) {
    if (err) { 
      return res.status(500).json({ message: 'Error logging out' }); 
    }
    res.json({ message: 'User logged out' });
  });
};

module.exports = {
  googleAuthCallback,
  getCurrentUser,
  logout,
}; 