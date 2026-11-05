const express = require('express');
const orderController = require('../controllers/orderController');
const validate = require('../middleware/validate');
const { createOrderSchema } = require('../utils/validators');

const router = express.Router();

// Public order placement
router.post('/', validate(createOrderSchema), orderController.createOrder);

// Public order tracking
router.get('/track/:orderNumber', orderController.trackOrder);

// Real-time live status updates via Server-Sent Events (SSE)
router.get('/track/:orderNumber/live', orderController.trackOrderLive);

module.exports = router;
