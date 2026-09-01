import { Router } from 'express';
import { feedbackController } from '../controllers/feedback.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Customer feedback submission
router.post('/tickets/:ticketId', authenticate, feedbackController.submitFeedback);
router.get('/tickets/:ticketId', authenticate, feedbackController.getFeedbackForTicket);

// Aggregated CSAT metrics (Agents & Admins)
router.get(
  '/metrics',
  authenticate,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  feedbackController.getSatisfactionMetrics
);

export default router;
