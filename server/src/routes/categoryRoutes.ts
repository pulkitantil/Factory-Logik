
import { Router } from 'express';
import {
  getCategories,
  createCategory,
} from '../controllers/categoryController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Public: customers and the product form can read categories.
router.get('/', getCategories);

// Admin only: create a category.
router.post('/', authenticateAdmin, createCategory);

export default router;
