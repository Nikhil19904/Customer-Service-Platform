const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Debug environment variables
console.log('PASSPORT CONFIG:');
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substr(0, 10)}...` : 'Undefined');
console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set (hidden)' : 'Undefined');
console.log('- GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'Undefined');
console.log('- CLIENT_ID length:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.length : 0);

// Serialize user to session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id);
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error, null);
  }
});

// Check if we have valid credentials (make sure this isn't undefined)
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

const hasValidCredentials = 
  clientID && 
  clientSecret && 
  clientID.length > 10 &&
  clientSecret.length > 5;

if (hasValidCredentials) {
  console.log('Using Google OAuth with clientID:', clientID.substr(0, 10) + '...');
  console.log('Using Google callback URL:', callbackURL);
  
  try {
    // Create the Google strategy
    const googleStrategy = new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        proxy: true,  // Handle proxy issues
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo', // Use a more reliable endpoint
        passReqToCallback: true // Pass request to callback
      },
      async (req, accessToken, refreshToken, profile, done) => {
        console.log('Google auth callback received for profile:', profile.id);
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });
          
          if (user) {
            console.log('Existing user found:', user.email);
            return done(null, user);
          }
          
          // Create new user if doesn't exist
          console.log('Creating new user for:', profile.displayName);
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value
          });
          
          await user.save();
          console.log('New user created:', user.email);
          return done(null, user);
        } catch (error) {
          console.error('Error in Google strategy verify callback:', error);
          return done(error, null);
        }
      }
    );
    
    // Register the strategy
    passport.use(googleStrategy);
    console.log('Google strategy configured successfully');
  } catch (error) {
    console.error('Error configuring Google strategy:', error);
    console.error('Error details:', error.message);
    console.log('Falling back to mock authentication');
    useMockStrategy();
  }
} else {
  console.log('Using development mode with mock authentication');
  console.log('Missing credentials:', {
    hasClientId: !!clientID,
    hasClientSecret: !!clientSecret,
    validClientIdLength: clientID ? clientID.length > 10 : false,
    validClientSecretLength: clientSecret ? clientSecret.length > 5 : false
  });
  useMockStrategy();
}

function useMockStrategy() {
  // Simple strategy that works in development without real OAuth
  passport.use('google', {
    name: 'google',
    authenticate: function(req, options) {
      console.log('Using mock Google authentication');
      const user = {
        id: '123456789',
        googleId: '123456789',
        name: 'Test User',
        email: 'testuser@example.com',
        photo: 'https://via.placeholder.com/50'
      };
      
      this.success(user);
    }
  });
  console.log('Mock strategy configured successfully');
}

module.exports = passport; 