import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { ticketRepository } from '../repositories/ticket.repository.js';
import { messageRepository } from '../repositories/message.repository.js';
import { TicketRules } from './ticketRules.js';
import { AuthUser } from '../types/express.js';
import { NotFoundError, AuthorizationError } from '../errors/AppError.js';
import { logger } from '../logger/logger.js';

export class AttachmentService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getAttachmentFile(
    user: AuthUser,
    ticketId: string,
    attachmentId: string
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    // Enforce resource-level authorization
    TicketRules.assertCanViewTicket(user, ticket);

    // Find the message containing this attachment
    const messages = await messageRepository.findByTicketId(ticketId, user.role !== 'CUSTOMER');
    let targetAttachment: any = null;

    for (const msg of messages) {
      const match = msg.attachments.find(
        (att) => att._id?.toString() === attachmentId || att.storageKey === attachmentId
      );
      if (match) {
        targetAttachment = match;
        break;
      }
    }

    if (!targetAttachment) {
      throw new NotFoundError('Attachment not found or you do not have permission to access it.');
    }

    const filePath = path.join(this.uploadDir, targetAttachment.storageKey);

    if (!fs.existsSync(filePath)) {
      logger.error(`Attachment file missing on disk: ${filePath}`);
      throw new NotFoundError('File not found on storage server.');
    }

    return {
      filePath,
      fileName: targetAttachment.fileName,
      mimeType: targetAttachment.mimeType,
    };
  }
}

export const attachmentService = new AttachmentService();
