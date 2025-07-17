const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('Environment variables check:');
console.log('-----------------------------');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set (hidden for security)' : 'Not set');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('-----------------------------');

// Check if credentials are being loaded properly
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'dummy_client_id') {
  console.log('✅ Google Client ID is properly configured');
} else {
  console.log('❌ Google Client ID is not properly configured');
}

// Check if file paths are correct
console.log('\nFile path check:');
console.log('-----------------------------');
console.log('Current directory:', __dirname);
console.log('.env path:', path.resolve(__dirname, '.env'));
console.log('Does .env exist?', require('fs').existsSync(path.resolve(__dirname, '.env')) ? 'Yes' : 'No'); 