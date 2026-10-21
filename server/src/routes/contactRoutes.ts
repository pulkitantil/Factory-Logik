import { Router } from 'express';
import { submitContactMessage, getContactMessages } from '../controllers/contactController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', submitContactMessage);
router.get('/', authenticateAdmin, getContactMessages);

export default router;
