
import { Router } from 'express';
import {
  getAdminAnalytics,
  getAdminOrders,
  updateOrderStatus,
  updateTrackingInfo,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getAdminCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../controllers/adminController.js';
import {
  uploadImage,
  uploadImageMiddleware,
} from '../controllers/uploadController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes, including image uploads
router.use(authenticateAdmin);

// Analytics
router.get('/analytics', getAdminAnalytics);

// Orders & Tracking Management
router.get('/orders', getAdminOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.patch('/orders/:orderId/tracking', updateTrackingInfo);

// Products & Inventory Management
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateProductStock);

// Product Image Upload
router.post('/upload-image', uploadImageMiddleware, uploadImage);

// Coupons Management
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.patch('/coupons/:id/toggle', toggleCouponStatus);
router.delete('/coupons/:id', deleteCoupon);

export default router;
