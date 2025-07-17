const mongoose = require('mongoose');

// Set mongoose options
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      console.warn('No MONGODB_URI provided. Running without database connection.');
      return null;
    }
    
    // Connect with retry logic
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      console.log(`MongoDB connected to ${conn.connection.host}`);
    });
    
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check your connection string and make sure your MongoDB server is running.');
    }
    throw error;
  }
};

module.exports = connectDB; 