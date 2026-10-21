import { Router } from 'express';
import { handleAiChat, getAiTools } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/chat', optionalAuth, handleAiChat);
router.get('/tools', getAiTools);

export default router;
