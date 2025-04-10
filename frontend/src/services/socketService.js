import { io } from 'socket.io-client';

let socket;

// Connect to the Socket.IO server
export const initSocket = (token) => {
  socket = io('http://localhost:5000', {
    auth: {
      token
    }
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// Get the socket instance
export const getSocket = () => socket;

// Subscribe to service request updates
export const subscribeToServiceRequests = (callback) => {
  if (!socket) return;
  
  socket.on('serviceRequest:new', (data) => {
    callback('new', data);
  });
  
  socket.on('serviceRequest:update', (data) => {
    callback('update', data);
  });
  
  socket.on('serviceRequest:delete', (data) => {
    callback('delete', data);
  });
};

// Unsubscribe from service request updates
export const unsubscribeFromServiceRequests = () => {
  if (!socket) return;
  
  socket.off('serviceRequest:new');
  socket.off('serviceRequest:update');
  socket.off('serviceRequest:delete');
};

// Join a specific service request room to get updates for that request
export const joinServiceRequestRoom = (requestId) => {
  if (socket) {
    socket.emit('joinServiceRequest', requestId);
  }
};

// Leave a specific service request room
export const leaveServiceRequestRoom = (requestId) => {
  if (socket) {
    socket.emit('leaveServiceRequest', requestId);
  }
}; 