// Simple script to test Intercom API connection
const https = require('https');
const fs = require('fs');
const path = require('path');

// Read the token directly from the .env file
function getIntercomToken() {
  try {
    const envPath = path.join(__dirname, 'backend', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const tokenMatch = envContent.match(/INTERCOM_ACCESS_TOKEN=([^\r\n]+)/);
    
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1].trim();
    }
    throw new Error('INTERCOM_ACCESS_TOKEN not found in .env file');
  } catch (error) {
    console.error('Error reading token:', error.message);
    process.exit(1);
  }
}

// Mask the token for display
function maskToken(token) {
  if (token.length < 10) return token;
  return token.substring(0, 4) + '...' + token.substring(token.length - 4);
}

// Test the connection directly using HTTPS
function testIntercomConnection() {
  const token = getIntercomToken();
  console.log('Testing Intercom API with token:', maskToken(token));
  
  const options = {
    hostname: 'api.intercom.io',
    path: '/admins',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Successfully connected to Intercom API!');
        try {
          const response = JSON.parse(data);
          if (response.admins) {
            console.log(`Found ${response.admins.length} admin(s) in your Intercom workspace`);
          }
          console.log('Intercom connection test passed!');
        } catch (e) {
          console.log('Received successful response but could not parse JSON');
        }
        process.exit(0);
      } else {
        console.error('❌ Failed to connect to Intercom API');
        console.error(`Status code: ${res.statusCode}`);
        console.error(`Response: ${data}`);
        process.exit(1);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error making request to Intercom API:');
    console.error(error.message);
    process.exit(1);
  });
  
  req.end();
}

// Run the test
testIntercomConnection(); 