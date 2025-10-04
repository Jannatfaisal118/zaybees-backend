import express from 'express';
import { placeOrder, allOrders, userOrders, updateStatus }  from '../controllers/orderController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { easypaisaCallback, jazzcashCallback } from '../controllers/paymentCallbackController.js';


const orderRouter = express.Router();

// Admin Features
orderRouter.get('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/payment/easypaisa/callback', easypaisaCallback);
orderRouter.post('/payment/jazzcash/callback', jazzcashCallback);

// User Features
orderRouter.post('/userorders', authUser, userOrders);

export default orderRouter;
