import mongoose from 'mongoose';
import { ticketRepository, TicketListOptions } from '../repositories/ticket.repository.js';
import { messageRepository } from '../repositories/message.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { queueService } from '../queues/queue.service.js';
import { TicketRules } from './ticketRules.js';
import { TicketStateMachine } from './ticketStateMachine.service.js';
import { ITicket } from '../models/Ticket.js';
import { AuthUser } from '../types/express.js';
import { UserRole } from '../constants/roles.js';
import {
  TicketStatus,
  TicketStatusType,
  TicketPriority,
  TicketPriorityType,
  PrioritySource,
  MessageType,
} from '../constants/ticket.constants.js';
import { AuditEventType, NotificationType } from '../constants/events.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';

export interface CreateTicketDTO {
  subject: string;
  description: string;
  categoryId: string;
  priority?: TicketPriorityType;
}

export interface TicketQueryFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedAgent?: string;
  team?: string;
  fromDate?: string;
  toDate?: string;
  sort?: 'newest' | 'oldest' | 'highest-priority' | 'recently-updated';
  page?: number;
  limit?: number;
}

export class TicketService {
  async createTicket(user: AuthUser, dto: CreateTicketDTO): Promise<ITicket> {
    const { subject, description, categoryId, priority } = dto;

    if (!subject || !description || !categoryId) {
      throw new ValidationError('Subject, description, and category are required.');
    }

    const ticket = await ticketRepository.create({
      customerId: new mongoose.Types.ObjectId(user.id),
      subject: subject.trim(),
      description: description.trim(),
      categoryId: new mongoose.Types.ObjectId(categoryId),
      priority: priority || TicketPriority.MEDIUM,
      prioritySource: priority ? PrioritySource.HUMAN : PrioritySource.SYSTEM,
      status: TicketStatus.OPEN,
      lastCustomerMessageAt: new Date(),
    });

    // Create initial message entry in TicketMessages
    await messageRepository.create({
      ticketId: ticket._id,
      authorId: new mongoose.Types.ObjectId(user.id),
      authorRole: user.role,
      type: MessageType.CUSTOMER_MESSAGE,
      message: description.trim(),
      attachments: [],
    });

    // Record audit event
    await auditRepository.create({
      actorId: new mongoose.Types.ObjectId(user.id),
      actorRole: user.role,
      eventType: AuditEventType.TICKET_CREATED,
      ticketId: ticket._id,
      metadata: {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        priority: ticket.priority,
      },
    });

    // Queue background AI ticket classification
    await queueService.addClassificationJob(ticket._id.toString(), user.id);

    return ticket;
  }

  async getTicketById(user: AuthUser, ticketId: string): Promise<ITicket> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    // Resource-level security check
    TicketRules.assertCanViewTicket(user, ticket);

    return ticket;
  }

  async listTickets(user: AuthUser, query: TicketQueryFilters): Promise<{
    data: ITicket[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    // Customer Isolation: Always scope customers to their own tickets
    if (user.role === UserRole.CUSTOMER) {
      filter.customerId = new mongoose.Types.ObjectId(user.id);
    }

    // Status filter
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }

    // Priority filter
    if (query.priority && query.priority !== 'ALL') {
      filter.priority = query.priority;
    }

    // Category filter
    if (query.category && query.category !== 'ALL') {
      filter.categoryId = new mongoose.Types.ObjectId(query.category);
    }

    // Assigned Agent filter
    if (query.assignedAgent) {
      if (query.assignedAgent === 'unassigned') {
        filter.assignedAgentId = { $exists: false };
      } else if (query.assignedAgent === 'me') {
        filter.assignedAgentId = new mongoose.Types.ObjectId(user.id);
      } else if (query.assignedAgent !== 'ALL') {
        filter.assignedAgentId = new mongoose.Types.ObjectId(query.assignedAgent);
      }
    }

    // Team filter
    if (query.team && query.team !== 'ALL') {
      filter.teamId = new mongoose.Types.ObjectId(query.team);
    }

    // Date range
    if (query.fromDate || query.toDate) {
      filter.createdAt = {};
      if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
      if (query.toDate) filter.createdAt.$lte = new Date(query.toDate);
    }

    // Search query on ticketNumber, subject, or description
    if (query.search && query.search.trim().length > 0) {
      filter.$text = { $search: query.search.trim() };
    }

    // Sorting
    let sort: Record<string, any> = { createdAt: -1 };
    if (query.sort === 'oldest') {
      sort = { createdAt: 1 };
    } else if (query.sort === 'recently-updated') {
      sort = { updatedAt: -1 };
    } else if (query.sort === 'highest-priority') {
      // Map priority ordering: URGENT, HIGH, MEDIUM, LOW
      sort = { priority: 1, createdAt: -1 };
    }

    const [data, total] = await Promise.all([
      ticketRepository.list({ filter, sort, skip, limit }),
      ticketRepository.count(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateTicketStatus(
    user: AuthUser,
    ticketId: string,
    newStatus: TicketStatusType
  ): Promise<ITicket> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    TicketRules.assertCanModifyTicket(user, ticket);

    // Validate state machine rule
    TicketStateMachine.validateTransition(ticket.status, newStatus, user.role);

    const updatePayload: Record<string, any> = {
      status: newStatus,
    };

    const now = new Date();
    if (newStatus === TicketStatus.RESOLVED) {
      updatePayload.resolvedAt = now;
    } else if (newStatus === TicketStatus.CLOSED) {
      updatePayload.closedAt = now;
    } else if (newStatus === TicketStatus.REOPENED) {
      updatePayload.reopenedAt = now;
    }

    const updated = await ticketRepository.update(ticketId, updatePayload);

    // Audit log
    await auditRepository.create({
      actorId: new mongoose.Types.ObjectId(user.id),
      actorRole: user.role,
      eventType: AuditEventType.STATUS_CHANGED,
      ticketId: ticket._id,
      metadata: {
        from: ticket.status,
        to: newStatus,
      },
    });

    // Notify relevant party
    if (user.role === UserRole.AGENT || user.role === UserRole.ADMIN) {
      await notificationRepository.create({
        userId: ticket.customerId._id,
        type: newStatus === TicketStatus.RESOLVED ? NotificationType.TICKET_RESOLVED : NotificationType.TICKET_UPDATED,
        title: `Ticket ${ticket.ticketNumber} Updated`,
        message: `Status updated to ${newStatus}.`,
        ticketId: ticket._id,
      });
    }

    return updated!;
  }

  async updateTicketPriority(
    user: AuthUser,
    ticketId: string,
    newPriority: TicketPriorityType
  ): Promise<ITicket> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    TicketRules.assertCanChangePriority(user);

    const oldPriority = ticket.priority;
    const updated = await ticketRepository.update(ticketId, {
      priority: newPriority,
      prioritySource: PrioritySource.HUMAN, // Rule: Human override permanently locks priority source
    });

    await auditRepository.create({
      actorId: new mongoose.Types.ObjectId(user.id),
      actorRole: user.role,
      eventType: AuditEventType.PRIORITY_CHANGED,
      ticketId: ticket._id,
      metadata: {
        from: oldPriority,
        to: newPriority,
        source: PrioritySource.HUMAN,
      },
    });

    return updated!;
  }

  async assignTicket(user: AuthUser, ticketId: string, agentId: string): Promise<ITicket> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    TicketRules.assertCanAssignTicket(user);

    const updated = await ticketRepository.update(ticketId, {
      assignedAgentId: new mongoose.Types.ObjectId(agentId),
      status: ticket.status === TicketStatus.OPEN ? TicketStatus.ASSIGNED : ticket.status,
    });

    await auditRepository.create({
      actorId: new mongoose.Types.ObjectId(user.id),
      actorRole: user.role,
      eventType: AuditEventType.TICKET_ASSIGNED,
      ticketId: ticket._id,
      metadata: {
        assignedToAgentId: agentId,
      },
    });

    await notificationRepository.create({
      userId: new mongoose.Types.ObjectId(agentId),
      type: NotificationType.TICKET_ASSIGNED,
      title: `Assigned to Ticket ${ticket.ticketNumber}`,
      message: `You have been assigned to "${ticket.subject}".`,
      ticketId: ticket._id,
    });

    return updated!;
  }

  async claimTicket(user: AuthUser, ticketId: string): Promise<ITicket> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    TicketRules.assertCanClaimTicket(user, ticket);

    const updated = await ticketRepository.update(ticketId, {
      assignedAgentId: new mongoose.Types.ObjectId(user.id),
      status: ticket.status === TicketStatus.OPEN ? TicketStatus.ASSIGNED : ticket.status,
    });

    await auditRepository.create({
      actorId: new mongoose.Types.ObjectId(user.id),
      actorRole: user.role,
      eventType: AuditEventType.TICKET_CLAIMED,
      ticketId: ticket._id,
      metadata: {
        claimedByAgentId: user.id,
      },
    });

    return updated!;
  }
}

export const ticketService = new TicketService();
