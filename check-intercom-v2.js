// Script to test Intercom API connection with version 6.0.0-beta.3
require('dotenv').config({ path: './backend/.env' });
const { Client } = require('intercom-client');

const testIntercomConnection = async () => {
  console.log('Testing Intercom API connection with intercom-client@6.0.0-beta.3...');
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
    // Create a client using the correct constructor for v6.0.0-beta.3
    const client = new Client({
      tokenAuth: { token: process.env.INTERCOM_ACCESS_TOKEN },
    });
    
    // Test the connection by getting the counts
    const counts = await client.counts.forApp();
    
    console.log('✅ Successfully connected to Intercom API!');
    console.log('Connection test successful');
    
    if (counts && counts.company) {
      console.log(`App has ${counts.company.count} companies`);
    }
    
    if (counts && counts.user) {
      console.log(`App has ${counts.user.count} users`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Intercom API:');
    console.error(error.message || error);
    console.error('Full error:', JSON.stringify(error, null, 2));
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