const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const intercomClient = require('../config/intercom');


const mockRequests = [];


const isDevelopment = () => process.env.GOOGLE_CLIENT_ID === 'dummy_client_id';

// Create a new service request
const createServiceRequest = async (req, res) => {
  try {
    const { category, content } = req.body;
    const userId = req.user.id;

    // Development mode handling
    if (isDevelopment()) {
      const mockRequest = {
        _id: `mock_${Date.now()}`,
        user: userId,
        category,
        content,
        intercomConversationId: `mock_intercom_${Date.now()}`,
        status: 'Open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequests.push(mockRequest);
      
      // Emit socket event
      if (req.io) {
        req.io.emit('serviceRequest:new', mockRequest);
      }
      
      return res.status(201).json(mockRequest);
    }

    // Production code
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a conversation in Intercom
    try {
      const intercomConversation = await intercomClient.conversations.create({
        type: 'user',
        message_type: 'inapp',
        user: { 
          email: user.email 
        },
        body: `Category: ${category}\n\n${content}`
      });

      // Create a service request in our database
      const serviceRequest = await ServiceRequest.create({
        user: userId,
        category,
        content,
        intercomConversationId: intercomConversation.id
      });
      
      // Emit socket event
      if (req.io) {
        req.io.emit('serviceRequest:new', serviceRequest);
      }

      res.status(201).json(serviceRequest);
    } catch (intercomError) {
      console.error('Intercom conversation creation error:', intercomError);
      // Fall back to creating a request without Intercom if there's an error
      const serviceRequest = await ServiceRequest.create({
        user: userId,
        category,
        content
      });
      
      if (req.io) {
        req.io.emit('serviceRequest:new', serviceRequest);
      }
      
      res.status(201).json(serviceRequest);
    }
  } catch (error) {
    console.error('Service request creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all service requests for a user
const getUserServiceRequests = async (req, res) => {
  try {
   
    if (isDevelopment()) {
      return res.json(mockRequests.filter(request => request.user === req.user.id));
    }

    const serviceRequests = await ServiceRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(serviceRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all service requests by category
const getServiceRequestsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Development mode handling
    if (isDevelopment()) {
      return res.json(mockRequests.filter(request => 
        request.user === req.user.id && request.category === category
      ));
    }

    const serviceRequests = await ServiceRequest.find({ 
      category,
      user: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json(serviceRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific service request
const getServiceRequest = async (req, res) => {
  try {
    // Development mode handling
    if (isDevelopment()) {
      const request = mockRequests.find(request => request._id === req.params.id);
      
      if (!request) {
        return res.status(404).json({ message: 'Service request not found' });
      }
      
      if (request.user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      return res.json(request);
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);
    
    // Check if service request exists
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Check if service request belongs to user
    if (serviceRequest.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(serviceRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a service request
const updateServiceRequest = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Development mode handling
    if (isDevelopment()) {
      const requestIndex = mockRequests.findIndex(request => request._id === req.params.id);
      
      if (requestIndex === -1) {
        return res.status(404).json({ message: 'Service request not found' });
      }
      
      if (mockRequests[requestIndex].user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      mockRequests[requestIndex] = {
        ...mockRequests[requestIndex],
        content,
        updatedAt: new Date()
      };
      
      // Emit socket event
      if (req.io) {
        req.io.emit('serviceRequest:update', mockRequests[requestIndex]);
      }
      
      return res.json(mockRequests[requestIndex]);
    }

    let serviceRequest = await ServiceRequest.findById(req.params.id);
    
    // Check if service request exists
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Check if service request belongs to user
    if (serviceRequest.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update service request in our database
    serviceRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { content, updatedAt: Date.now() },
      { new: true }
    );
    
    // Add a note to the Intercom conversation
    if (serviceRequest.intercomConversationId) {
      await intercomClient.conversations.replyByIdAsUser({
        id: serviceRequest.intercomConversationId,
        intercomUserId: req.user.email,
        body: `Updated Request: ${content}`
      });
    }
    
    // Emit socket event
    if (req.io) {
      req.io.emit('serviceRequest:update', serviceRequest);
      // Also emit to specific room
      req.io.to(`request-${req.params.id}`).emit('serviceRequest:update', serviceRequest);
    }
    
    res.json(serviceRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a service request
const deleteServiceRequest = async (req, res) => {
  try {
    // Development mode handling
    if (isDevelopment()) {
      const requestIndex = mockRequests.findIndex(request => request._id === req.params.id);
      
      if (requestIndex === -1) {
        return res.status(404).json({ message: 'Service request not found' });
      }
      
      if (mockRequests[requestIndex].user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      const deletedRequest = mockRequests[requestIndex];
      mockRequests.splice(requestIndex, 1);
      
      // Emit socket event if needed
      if (req.io) {
        req.io.emit('serviceRequest:delete', { _id: req.params.id });
      }
      
      return res.json({ message: 'Service request removed' });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);
    
    // Check if service request exists
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Check if service request belongs to user
    if (serviceRequest.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // If there's an Intercom conversation, you might want to add a note or close it
    if (serviceRequest.intercomConversationId) {
      try {
        await intercomClient.conversations.replyByIdAsAdmin({
          id: serviceRequest.intercomConversationId,
          adminId: process.env.INTERCOM_ADMIN_ID || 'system',
          messageType: 'note',
          body: 'Service request was deleted by the user'
        });
      } catch (intercomError) {
        console.error('Error updating Intercom conversation:', intercomError);
        // Continue with deletion even if Intercom update fails
      }
    }
    
    // Delete the service request
    await serviceRequest.deleteOne();
    
    // Emit socket event
    if (req.io) {
      req.io.emit('serviceRequest:delete', { _id: req.params.id });
    }
    
    res.json({ message: 'Service request removed' });
  } catch (error) {
    console.error('Delete service request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createServiceRequest,
  getUserServiceRequests,
  getServiceRequestsByCategory,
  getServiceRequest,
  updateServiceRequest,
  deleteServiceRequest
}; 