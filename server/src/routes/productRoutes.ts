import { Router } from 'express';
import {
  getProducts,
  getProductBySlugOrId,
  getSearchSuggestions,
  compareProducts,
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/compare', compareProducts);
router.get('/:slugOrId', getProductBySlugOrId);

export default router;
