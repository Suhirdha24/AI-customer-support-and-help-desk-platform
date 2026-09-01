import mongoose from 'mongoose';
import { feedbackRepository } from '../repositories/feedback.repository.js';
import { ticketRepository } from '../repositories/ticket.repository.js';
import { ITicketFeedback } from '../models/TicketFeedback.js';
import { AuthUser } from '../types/express.js';
import { TicketStatus } from '../constants/ticket.constants.js';
import { NotFoundError, ValidationError, AuthorizationError, ConflictError } from '../errors/AppError.js';

export interface SubmitFeedbackDTO {
  rating: number;
  feedback?: string;
}

export class FeedbackService {
  async submitFeedback(
    user: AuthUser,
    ticketId: string,
    dto: SubmitFeedbackDTO
  ): Promise<ITicketFeedback> {
    const { rating, feedback } = dto;

    if (!rating || rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be an integer between 1 and 5.');
    }

    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    // Only the ticket owner can provide feedback
    if (ticket.customerId._id.toString() !== user.id) {
      throw new AuthorizationError('You can only provide satisfaction feedback for your own tickets.');
    }

    // Rule: Feedback is only permitted on RESOLVED or CLOSED tickets
    if (ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) {
      throw new ValidationError('Feedback can only be submitted after a ticket is resolved or closed.');
    }

    // Prevent duplicate feedback
    const existing = await feedbackRepository.findByTicketId(ticketId);
    if (existing) {
      throw new ConflictError('Feedback has already been submitted for this ticket.');
    }

    return feedbackRepository.create({
      ticketId: ticket._id,
      customerId: new mongoose.Types.ObjectId(user.id),
      rating,
      feedback: feedback?.trim(),
    });
  }

  async getFeedbackForTicket(user: AuthUser, ticketId: string): Promise<ITicketFeedback | null> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    return feedbackRepository.findByTicketId(ticketId);
  }

  async getSatisfactionMetrics(): Promise<{
    averageRating: number;
    totalFeedback: number;
    distribution: Record<number, number>;
  }> {
    const [avg, distribution] = await Promise.all([
      feedbackRepository.getAverageRating(),
      feedbackRepository.getRatingDistribution(),
    ]);

    return {
      averageRating: avg.averageRating,
      totalFeedback: avg.totalFeedback,
      distribution,
    };
  }
}

export const feedbackService = new FeedbackService();
