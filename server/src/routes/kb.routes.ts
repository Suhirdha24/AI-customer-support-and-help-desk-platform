import { Router } from 'express';
import { kbController } from '../controllers/kb.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Public / Authenticated search and read
router.get('/', kbController.listArticles);
router.get('/search', kbController.searchArticles);
router.get('/:id', kbController.getArticleById);

// Admin-only management
router.post('/', authenticate, requireRole(UserRole.ADMIN), kbController.createArticle);
router.put('/:id', authenticate, requireRole(UserRole.ADMIN), kbController.updateArticle);
router.delete('/:id', authenticate, requireRole(UserRole.ADMIN), kbController.deleteArticle);

export default router;
