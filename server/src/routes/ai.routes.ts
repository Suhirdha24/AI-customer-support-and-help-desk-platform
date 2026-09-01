import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { aiLimiter } from '../middleware/rateLimit.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// On-demand re-classification (Agents and Admins only)
router.post(
  '/tickets/:id/analyze',
  authenticate,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  aiLimiter,
  aiController.classifyTicket
);

// Structured Summarization (Agents and Admins only)
router.post(
  '/tickets/:id/summarize',
  authenticate,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  aiLimiter,
  aiController.summarizeTicket
);

// RAG-assisted suggested reply (Agents and Admins only - human approval required before sending)
router.post(
  '/tickets/:id/suggest-reply',
  authenticate,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  aiLimiter,
  aiController.suggestReply
);

export default router;
