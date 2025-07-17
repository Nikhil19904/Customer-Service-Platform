const path = require('path');
const dotenv = require('dotenv');

// Load environment variables before importing other modules
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const passport = require('./config/passport');
const connectDB = require('./config/db');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true
  }
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join service request room
  socket.on('joinServiceRequest', (requestId) => {
    socket.join(`request-${requestId}`);
    console.log(`User ${socket.userId} joined room: request-${requestId}`);
  });
  
  // Leave service request room
  socket.on('leaveServiceRequest', (requestId) => {
    socket.leave(`request-${requestId}`);
    console.log(`User ${socket.userId} left room: request-${requestId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}));

// Socket.io middleware for Express routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/service-requests', require('./routes/serviceRequestRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    if (!isDevelopmentMode()) {
      try {
        await connectDB();
        console.log('MongoDB Connected');
      } catch (dbError) {
        console.error('MongoDB connection error:', dbError.message);
        console.log('Starting server without database connection...');
      }
    } else {
      console.log('Running in development mode with mock data');
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.io server initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

// Helper function to check if we're in development mode
const isDevelopmentMode = () => {
  return process.env.GOOGLE_CLIENT_ID === 'dummy_client_id' || !process.env.MONGODB_URI;
};

startServer(); 