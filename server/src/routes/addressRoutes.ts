import { Router } from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/addressController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
