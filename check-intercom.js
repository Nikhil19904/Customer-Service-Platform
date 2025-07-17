// Script to test Intercom API connection
require('dotenv').config({ path: './backend/.env' });
const { Intercom } = require('intercom-client');

const testIntercomConnection = async () => {
  console.log('Testing Intercom API connection...');
  console.log('INTERCOM_ACCESS_TOKEN:', maskToken(process.env.INTERCOM_ACCESS_TOKEN));
  
  if (!process.env.INTERCOM_ACCESS_TOKEN) {
    console.error('❌ INTERCOM_ACCESS_TOKEN is not set in the .env file');
    return false;
  }
  
  if (process.env.INTERCOM_ACCESS_TOKEN === 'your_intercom_access_token') {
    console.error('❌ INTERCOM_ACCESS_TOKEN is set to the default placeholder value');
    return false;
  }
  
  try {
    // Create a client using the correct Intercom constructor
    const client = new Intercom({
      token: process.env.INTERCOM_ACCESS_TOKEN
    });
    
    // Test the connection by getting the app details
    const appInfo = await client.admins.list();
    
    console.log('✅ Successfully connected to Intercom API!');
    console.log(`Found ${appInfo.admins ? appInfo.admins.length : 0} admin(s)`);
    
    // If we get this far, the connection was successful
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Intercom API:');
    console.error(error.message || error);
    return false;
  }
};

// Helper function to mask token for security
function maskToken(token) {
  if (!token) return 'undefined';
  if (token.length < 10) return token;
  return token.substring(0, 4) + '...' + token.substring(token.length - 4);
}

// Run the test
testIntercomConnection()
  .then(success => {
    if (success) {
      console.log('Intercom connection test passed!');
      process.exit(0);
    } else {
      console.log('Intercom connection test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error running Intercom test:', error);
    process.exit(1);
  }); 