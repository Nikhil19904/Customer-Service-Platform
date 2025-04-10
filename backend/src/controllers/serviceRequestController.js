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
      return res.status(201).json(mockRequest);
    }

    // Production code
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a conversation in Intercom
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

    res.status(201).json(serviceRequest);
  } catch (error) {
    console.error('Service request creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all service requests for a user
const getUserServiceRequests = async (req, res) => {
  try {
   
    if (isDevelopment()) {
      return res.json(mockRequests.filter(req => req.user === req.user.id));
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
      return res.json(mockRequests.filter(req => 
        req.user === req.user.id && req.category === category
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
      const request = mockRequests.find(req => req._id === req.params.id);
      
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
      const requestIndex = mockRequests.findIndex(req => req._id === req.params.id);
      
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
    
    res.json(serviceRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createServiceRequest,
  getUserServiceRequests,
  getServiceRequestsByCategory,
  getServiceRequest,
  updateServiceRequest
}; 