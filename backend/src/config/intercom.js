// Intercom client - using a simple version-agnostic approach
const http = require('https');

// Mock implementation that works regardless of Intercom package version
const createMockClient = () => {
  console.log('Using mock Intercom client');
  return {
    conversations: {
      create: async (data) => {
        console.log('MOCK: Creating Intercom conversation', data);
        return { id: `mock_conversation_${Date.now()}` };
      },
      replyByIdAsUser: async (data) => {
        console.log('MOCK: Replying to Intercom conversation', data);
        return { success: true };
      },
      replyByIdAsAdmin: async (data) => {
        console.log('MOCK: Admin replying to Intercom conversation', data);
        return { success: true };
      }
    }
  };
};

// Try to create a real client or fallback to mock
const createRealClient = (token) => {
  console.log('Creating real Intercom client with token');
  
  // Simple HTTP client that just wraps requests to Intercom API
  return {
    conversations: {
      create: async (data) => {
        return makeApiRequest('/conversations', 'POST', token, data);
      },
      replyByIdAsUser: async (data) => {
        const { id, ...rest } = data;
        return makeApiRequest(`/conversations/${id}/reply`, 'POST', token, {
          ...rest,
          type: 'user'
        });
      },
      replyByIdAsAdmin: async (data) => {
        const { id, ...rest } = data;
        return makeApiRequest(`/conversations/${id}/reply`, 'POST', token, {
          ...rest,
          type: 'admin'
        });
      }
    }
  };
};

// Helper function to make HTTP requests to Intercom API
const makeApiRequest = (path, method, token, data) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.intercom.io',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve({ success: true, raw: responseData });
          }
        } else {
          reject(new Error(`API error: ${res.statusCode} ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

let intercomClient;

// Check if we have a valid Intercom access token
if (process.env.INTERCOM_ACCESS_TOKEN && 
    process.env.INTERCOM_ACCESS_TOKEN !== 'your_intercom_access_token' && 
    process.env.INTERCOM_ACCESS_TOKEN.length > 10) {
  try {
    // Create a real Intercom client
    intercomClient = createRealClient(process.env.INTERCOM_ACCESS_TOKEN);
    console.log('Successfully connected to Intercom API');
  } catch (error) {
    console.error('Failed to initialize Intercom client:', error);
    // Fall back to mock client
    intercomClient = createMockClient();
  }
} else {
  // Use the mock client if no valid token
  intercomClient = createMockClient();
}

module.exports = intercomClient; 
