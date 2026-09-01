import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

router.get('/customer', authenticate, dashboardController.getCustomerDashboard);
router.get(
  '/agent',
  authenticate,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  dashboardController.getAgentDashboard
);
router.get(
  '/admin',
  authenticate,
  requireRole(UserRole.ADMIN),
  dashboardController.getAdminDashboard
);

export default router;
