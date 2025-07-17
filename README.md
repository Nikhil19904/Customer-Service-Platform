# Customer Service Platform

A full-stack application for managing customer service requests with Intercom integration.

## Features

- User authentication with Google OAuth
- Service request management system
- Intercom conversation integration
- Dashboard for service request tracking
- Category-based filtering

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Intercom account with API access

### Environment Variables

Set up your environment variables in the `backend/.env` file:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
INTERCOM_ACCESS_TOKEN=your_intercom_access_token
FRONTEND_URL=http://localhost:3002
```

### Installation

1. Clone the repository
2. Install dependencies for backend and frontend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running the Application

### Using the Startup Script (Recommended)

We've provided a PowerShell script to easily start both the frontend and backend servers:

1. Open PowerShell
2. Navigate to the project root directory
3. Run the startup script:

```powershell
.\start.ps1
```

This will:
- Run the cleanup script to kill any conflicting processes
- Start the backend server on port 5000
- Start the frontend server on port 3002

### Manual Startup

If you prefer to start the servers manually:

```bash
# Start backend
cd backend
npm start

# Start frontend (in a new terminal)
cd frontend
npm start
```

## Cleaning Up Processes

If you encounter port conflicts or need to stop all related processes:

```powershell
.\cleanup.ps1
```

This will terminate any processes running on ports 5000, 3000, 3001, and 3002.

## Project Structure

```
customer-service-platform/
├── backend/              # Node.js Express backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   └── .env              # Environment variables
├── frontend/             # React frontend
│   ├── public/
│   └── src/
│       ├── components/   # React components
│       ├── services/     # API service functions
│       └── pages/        # Page components
├── cleanup.ps1           # Process cleanup script
├── start.ps1             # Application startup script
└── README.md             # This file
```

## Troubleshooting Connection Issues

If you're having trouble with connections between frontend and backend, we've created a diagnostic script:

```
cd Customer-service-platform
powershell -ExecutionPolicy Bypass -File .\check-connection.ps1
```

This script will:
- Check if the backend server is running
- Verify MongoDB connection status
- Check if the frontend server is running
- Validate environment variables in .env files

### Common Issues and Solutions:

1. **Port 5000 already in use**:
   - Use task manager to end the process, or
   - Run the start-app.ps1 script which will handle this automatically

2. **MongoDB not connecting**:
   - Ensure MongoDB is installed and running
   - Verify your connection string in backend/.env

3. **"&&" operator errors in PowerShell**:
   - Use the provided PowerShell scripts instead of command chaining
   - Replace `&&` with `;` in PowerShell

## Development Mode

If you don't have MongoDB or Intercom set up, you can run the application in development mode:

1. In the backend `.env` file, set:
```
GOOGLE_CLIENT_ID=dummy_client_id
GOOGLE_CLIENT_SECRET=dummy_client_secret
```

2. This will enable mock data and disable actual database operations.

## Verifying MongoDB Connection

You can check if your MongoDB connection is working properly by:

1. Starting the backend server
2. Accessing the database status endpoint:
```
http://localhost:5000/api/auth/db-status
```

The endpoint will return:
- `status`: Current database connection status (connected, disconnected, connecting, or disconnecting)
- `message`: Human-readable status message
- `connected`: Boolean indicating if the database is connected

Alternatively, use the provided utility script (Windows only):
```
cd Customer-service-platform
powershell -ExecutionPolicy Bypass -File .\check-connection.ps1
```

This script will check the connection status and provide helpful messages if there are issues.

If you're in development mode with mock data, it will always show as connected.

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/db-status` - Check MongoDB connection status

### Service Requests
- `POST /api/service-requests` - Create a new service request
- `GET /api/service-requests` - Get all service requests for current user
- `GET /api/service-requests/category/:category` - Get service requests by category
- `GET /api/service-requests/:id` - Get a specific service request
- `PUT /api/service-requests/:id` - Update a service request
- `DELETE /api/service-requests/:id` - Delete a service request

## Socket Events

- `serviceRequest:new` - New service request created
- `serviceRequest:update` - Service request updated
- `serviceRequest:delete` - Service request deleted 