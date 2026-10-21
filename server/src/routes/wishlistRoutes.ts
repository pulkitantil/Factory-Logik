import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
