import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller.js';
import { messageController } from '../controllers/message.controller.js';
import { attachmentController } from '../controllers/attachment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { uploadAttachment } from '../middleware/upload.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Ticket CRUD & Listing
router.post('/', authenticate, ticketController.createTicket);
router.get('/', authenticate, ticketController.listTickets);
router.get('/:id', authenticate, ticketController.getTicketById);

// State transitions & assignments
router.patch('/:id/status', authenticate, ticketController.updateStatus);
router.patch(
  '/:id/priority',
  authenticate,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  ticketController.updatePriority
);
router.post(
  '/:id/assign',
  authenticate,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  ticketController.assignTicket
);
router.post(
  '/:id/claim',
  authenticate,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  ticketController.claimTicket
);

// Messages & internal notes
router.get('/:id/messages', authenticate, messageController.listMessages);
router.post('/:id/messages', authenticate, messageController.createMessage);

// Secure Attachments
router.post('/upload', authenticate, uploadAttachment.single('file'), attachmentController.uploadFile);
router.get(
  '/:ticketId/attachments/:attachmentId',
  authenticate,
  attachmentController.downloadAttachment
);

export default router;
