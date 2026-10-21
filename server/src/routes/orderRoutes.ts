import { Router } from 'express';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment, getUserOrders, getOrderById } from '../controllers/orderController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);

router.post('/', createOrder);
router.post('/razorpay-order', createRazorpayOrder);
router.post('/verify-payment', verifyRazorpayPayment);
router.get('/user', getUserOrders);
router.get('/:orderIdOrNumber', getOrderById);

export default router;
