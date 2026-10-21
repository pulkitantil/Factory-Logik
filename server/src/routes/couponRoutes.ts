import { Router } from 'express';
import { getActiveCoupons, validateCoupon } from '../controllers/couponController.js';

const router = Router();

router.get('/', getActiveCoupons);
router.post('/validate', validateCoupon);

export default router;
