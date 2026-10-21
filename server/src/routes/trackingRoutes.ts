import { Router } from 'express';
import { getTrackingInfo } from '../controllers/trackingController.js';

const router = Router();

router.get('/:identifier', getTrackingInfo);

export default router;
