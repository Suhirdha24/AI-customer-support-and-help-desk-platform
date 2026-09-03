import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Category listing (available for ticket creation dropdowns)
router.get('/categories', adminController.listCategories);
router.post('/categories', authenticate, requireRole(UserRole.ADMIN), adminController.createCategory);
router.put('/categories/:id', authenticate, requireRole(UserRole.ADMIN), adminController.updateCategory);

// Teams
router.get('/teams', authenticate, adminController.listTeams);
router.post('/teams', authenticate, requireRole(UserRole.ADMIN), adminController.createTeam);
router.put('/teams/:id', authenticate, requireRole(UserRole.ADMIN), adminController.updateTeam);

// Users and Agents
router.get('/users', authenticate, requireRole(UserRole.ADMIN), adminController.listUsers);
router.post('/users', authenticate, requireRole(UserRole.ADMIN), adminController.createUser);
router.patch('/users/:id/status', authenticate, requireRole(UserRole.ADMIN), adminController.toggleUserStatus);
router.patch('/users/:id/role', authenticate, requireRole(UserRole.ADMIN), adminController.updateUserRole);
router.get('/agents', authenticate, requireRole(UserRole.ADMIN, UserRole.AGENT), adminController.listAgents);

// Telemetry & Audits
router.get('/ai-usage', authenticate, requireRole(UserRole.ADMIN), adminController.getAIUsageLogs);
router.get('/audit-logs', authenticate, requireRole(UserRole.ADMIN), adminController.getAuditLogs);

export default router;
