const Intercom = require('intercom-client');

// Check if we're using dummy credentials
const isDevelopment = process.env.INTERCOM_ACCESS_TOKEN === 'dummy_access_token';

let intercomClient;

if (!isDevelopment) {
  
  intercomClient = new Intercom.Client({
    token: process.env.INTERCOM_ACCESS_TOKEN
  });
} else {
  
  console.log('Using dummy Intercom credentials. Intercom operations will be mocked.');
  
  intercomClient = {
    conversations: {
      create: async (data) => {
        console.log('MOCK: Creating Intercom conversation', data);
        return { id: `mock_conversation_${Date.now()}` };
      },
      replyByIdAsUser: async (data) => {
        console.log('MOCK: Replying to Intercom conversation', data);
        return { success: true };
      }
    }
  };
}

module.exports = intercomClient; 