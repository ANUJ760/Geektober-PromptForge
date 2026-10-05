import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import * as orderController from '../controllers/orderController.js';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/create', verifyJWT, orderController.createOrder);
router.post('/verify', verifyJWT, orderController.verifyPayment);
router.get('/my-orders', verifyJWT, orderController.getUserOrders);
router.post('/webhook', handleRazorpayWebhook);

export default router;
