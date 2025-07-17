// Script to test Google OAuth configuration
const fs = require('fs');
const path = require('path');
const https = require('https');

// Read configuration from .env file
function getGoogleConfig() {
  try {
    const envPath = path.join(__dirname, 'backend', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const clientId = extractEnvValue(envContent, 'GOOGLE_CLIENT_ID');
    const clientSecret = extractEnvValue(envContent, 'GOOGLE_CLIENT_SECRET');
    const callbackUrl = extractEnvValue(envContent, 'GOOGLE_CALLBACK_URL');
    
    return {
      clientId,
      clientSecret,
      callbackUrl
    };
  } catch (error) {
    console.error('Error reading Google Auth configuration:', error.message);
    process.exit(1);
  }
}

// Extract value from .env content
function extractEnvValue(content, key) {
  const match = content.match(new RegExp(`${key}=([^\r\n]+)`));
  return match ? match[1].trim() : null;
}

// Mask sensitive information
function maskValue(value) {
  if (!value) return 'not set';
  if (value === 'dummy_client_id' || value === 'dummy_client_secret') {
    return `${value} (development mode)`;
  }
  if (value.length < 10) return value;
  return value.substring(0, 4) + '...' + value.substring(value.length - 4);
}

// Validate OAuth configuration
function validateGoogleConfig(config) {
  console.log('Google OAuth Configuration:');
  console.log('-------------------------');
  
  // Check Client ID
  if (!config.clientId) {
    console.log('❌ GOOGLE_CLIENT_ID: not set');
  } else if (config.clientId === 'dummy_client_id') {
    console.log('ℹ️ GOOGLE_CLIENT_ID: dummy value (development mode)');
  } else if (config.clientId.length < 20) {
    console.log(`❌ GOOGLE_CLIENT_ID: ${maskValue(config.clientId)} (looks invalid - too short)`);
  } else {
    console.log(`✅ GOOGLE_CLIENT_ID: ${maskValue(config.clientId)}`);
  }
  
  // Check Client Secret
  if (!config.clientSecret) {
    console.log('❌ GOOGLE_CLIENT_SECRET: not set');
  } else if (config.clientSecret === 'dummy_client_secret') {
    console.log('ℹ️ GOOGLE_CLIENT_SECRET: dummy value (development mode)');
  } else if (config.clientSecret.length < 10) {
    console.log(`❌ GOOGLE_CLIENT_SECRET: ${maskValue(config.clientSecret)} (looks invalid - too short)`);
  } else {
    console.log(`✅ GOOGLE_CLIENT_SECRET: ${maskValue(config.clientSecret)}`);
  }
  
  // Check Callback URL
  if (!config.callbackUrl) {
    console.log('❌ GOOGLE_CALLBACK_URL: not set');
  } else {
    console.log(`✅ GOOGLE_CALLBACK_URL: ${config.callbackUrl}`);
    
    // Validate callback URL format
    try {
      const url = new URL(config.callbackUrl);
      if (!url.pathname.includes('/google/callback')) {
        console.log('⚠️ Warning: Callback URL may not be correctly formatted. Should contain "/google/callback"');
      }
    } catch (e) {
      console.log('❌ Error: Callback URL is not a valid URL');
    }
  }
  
  // Check development mode
  const isDevMode = config.clientId === 'dummy_client_id';
  if (isDevMode) {
    console.log('\n🔹 Running in DEVELOPMENT mode with mock authentication');
    console.log('🔹 No actual Google authentication will take place');
    console.log('🔹 Users will be automatically logged in with test credentials');
    return true;
  }
  
  // Check if configuration is valid
  const isValid = 
    config.clientId && 
    config.clientSecret && 
    config.callbackUrl &&
    config.clientId.length > 20 &&
    config.clientSecret.length > 10;
  
  if (isValid) {
    console.log('\n✅ Google OAuth configuration appears valid!');
    return true;
  } else {
    console.log('\n❌ Google OAuth configuration is incomplete or invalid');
    return false;
  }
}

// Test Google OAuth Discovery Document (optional, only for production mode)
async function testGoogleOAuthDiscovery() {
  const config = getGoogleConfig();
  
  // Skip test in development mode
  if (config.clientId === 'dummy_client_id') {
    return;
  }
  
  console.log('\nTesting connection to Google OAuth...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'accounts.google.com',
      path: '/.well-known/openid-configuration',
      method: 'GET'
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Successfully connected to Google OAuth services!');
          console.log('✅ Your application can communicate with Google OAuth');
          resolve(true);
        } else {
          console.error('❌ Failed to connect to Google OAuth services');
          console.error(`Status code: ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Error making request to Google OAuth:');
      console.error(error.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Run tests
async function runTests() {
  const config = getGoogleConfig();
  const isConfigValid = validateGoogleConfig(config);
  
  // Only attempt to connect to Google if config is valid
  if (isConfigValid && config.clientId !== 'dummy_client_id') {
    await testGoogleOAuthDiscovery();
  }
  
  // Final verdict
  if (config.clientId === 'dummy_client_id') {
    console.log('\n✅ Your application is configured to use mock authentication');
    console.log('➡️ This will work fine for development but not for production use');
  } else if (isConfigValid) {
    console.log('\n✅ Google Auth configuration check complete');
    console.log('➡️ Your application should be able to authenticate with Google');
  } else {
    console.log('\n❌ Google Auth configuration is not valid');
    console.log('➡️ Please fix the issues above before proceeding');
  }
}

runTests(); 