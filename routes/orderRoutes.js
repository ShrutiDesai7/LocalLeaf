const express = require('express');
const orderController = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', orderController.createOrder);
router.get('/mine', requireAuth, requireRole('customer'), orderController.getMyOrders);
router.get('/', requireAuth, requireRole('owner'), orderController.getOrders);
router.patch('/:id', requireAuth, requireRole('owner'), orderController.updateOrderStatus);

module.exports = router;
