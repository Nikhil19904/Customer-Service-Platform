const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createServiceRequest,
  getUserServiceRequests,
  getServiceRequestsByCategory,
  getServiceRequest,
  updateServiceRequest,
  deleteServiceRequest
} = require('../controllers/serviceRequestController');


router.post('/', protect, createServiceRequest);
router.get('/', protect, getUserServiceRequests);
router.get('/category/:category', protect, getServiceRequestsByCategory);
router.get('/:id', protect, getServiceRequest);
router.put('/:id', protect, updateServiceRequest);
router.delete('/:id', protect, deleteServiceRequest);

module.exports = router; 