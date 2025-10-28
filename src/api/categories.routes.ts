import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from './categories.controller';
import { authenticateUser } from './auth.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateUser, createCategory);
router.put('/:id', authenticateUser, updateCategory);
router.delete('/:id', authenticateUser, deleteCategory);

export default router;
