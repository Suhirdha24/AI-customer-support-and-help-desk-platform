import mongoose from 'mongoose';
import { messageRepository } from '../repositories/message.repository.js';
import { ticketRepository } from '../repositories/ticket.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { TicketRules } from './ticketRules.js';
import { ITicketMessage, IAttachment } from '../models/TicketMessage.js';
import { AuthUser } from '../types/express.js';
import { UserRole } from '../constants/roles.js';
import { MessageType, MessageTypeType, TicketStatus } from '../constants/ticket.constants.js';
import { AuditEventType, NotificationType } from '../constants/events.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';

export interface CreateMessageDTO {
  type: MessageTypeType;
  message: string;
  attachments?: IAttachment[];
}

export class MessageService {
  async createMessage(
    user: AuthUser,
    ticketId: string,
    dto: CreateMessageDTO
  ): Promise<ITicketMessage> {
    const rawMessage = (dto as any).message || (dto as any).content || (dto as any).body || '';
    let type = (dto as any).type;
    if (!type) {
      if ((dto as any).isInternalNote) {
        type = MessageType.INTERNAL_NOTE;
      } else if (user.role === UserRole.CUSTOMER) {
        type = MessageType.CUSTOMER_MESSAGE;
      } else {
        type = MessageType.AGENT_MESSAGE;
      }
    }
    const attachments = dto.attachments || [];

    if (!rawMessage || rawMessage.trim().length === 0) {
      throw new ValidationError('Message body cannot be empty.');
    }

    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    TicketRules.assertCanViewTicket(user, ticket);

    // Rule: Internal notes are strictly forbidden for customers
    if (type === MessageType.INTERNAL_NOTE) {
      TicketRules.assertCanAddInternalNote(user);
    }

    const newMessage = await messageRepository.create({
      ticketId: ticket._id,
      authorId: new mongoose.Types.ObjectId(user.id),
      authorRole: user.role,
      type,
      message: rawMessage.trim(),
      attachments,
    });

    const now = new Date();
    const ticketUpdates: Record<string, any> = {};

    if (user.role === UserRole.CUSTOMER) {
      ticketUpdates.lastCustomerMessageAt = now;
      // Auto-transition from WAITING_FOR_CUSTOMER to IN_PROGRESS when customer responds
      if (ticket.status === TicketStatus.WAITING_FOR_CUSTOMER) {
        ticketUpdates.status = TicketStatus.IN_PROGRESS;
      }
    } else {
      ticketUpdates.lastAgentMessageAt = now;
    }

    await ticketRepository.update(ticketId, ticketUpdates);

    // Audit log
    const eventType =
      type === MessageType.INTERNAL_NOTE
        ? AuditEventType.INTERNAL_NOTE_ADDED
        : AuditEventType.MESSAGE_ADDED;

    await auditRepository.create({
      actorId: new mongoose.Types.ObjectId(user.id),
      actorRole: user.role,
      eventType,
      ticketId: ticket._id,
      metadata: {
        messageId: newMessage._id,
        type,
        attachmentCount: attachments.length,
      },
    });

    // Notifications (only for non-internal notes)
    if (type !== MessageType.INTERNAL_NOTE) {
      if (user.role === UserRole.CUSTOMER && ticket.assignedAgentId) {
        await notificationRepository.create({
          userId: ticket.assignedAgentId._id,
          type: NotificationType.CUSTOMER_REPLIED,
          title: `Customer Replied: ${ticket.ticketNumber}`,
          message: `Customer responded to "${ticket.subject}".`,
          ticketId: ticket._id,
        });
      } else if (user.role !== UserRole.CUSTOMER) {
        await notificationRepository.create({
          userId: ticket.customerId._id,
          type: NotificationType.AGENT_REPLIED,
          title: `Agent Replied: ${ticket.ticketNumber}`,
          message: `An agent replied to your ticket "${ticket.subject}".`,
          ticketId: ticket._id,
        });
      }
    }

    return newMessage;
  }

  async listMessages(user: AuthUser, ticketId: string): Promise<ITicketMessage[]> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    TicketRules.assertCanViewTicket(user, ticket);

    // CRITICAL SECURITY ENFORCEMENT:
    // If the requesting user is a CUSTOMER, includeInternalNotes is FALSE.
    // The query excludes INTERNAL_NOTE at the MongoDB layer!
    const includeInternalNotes = user.role === UserRole.AGENT || user.role === UserRole.ADMIN;

    return messageRepository.findByTicketId(ticketId, includeInternalNotes);
  }
}

export const messageService = new MessageService();
