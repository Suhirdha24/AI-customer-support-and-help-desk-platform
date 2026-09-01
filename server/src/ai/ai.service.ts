import mongoose from 'mongoose';
import { aiProvider } from './openai.provider.js';
import { ragService } from './rag.service.js';
import { ticketRepository } from '../repositories/ticket.repository.js';
import { messageRepository } from '../repositories/message.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { aiRepository } from '../repositories/ai.repository.js';
import { ClassificationResult, SummaryResult, SuggestedReplyResult } from './ai.types.js';
import { NotFoundError, AIServiceError } from '../errors/AppError.js';
import { logger } from '../logger/logger.js';
import { PrioritySource } from '../constants/ticket.constants.js';
import { TicketRules } from '../services/ticketRules.js';
import { AuthUser } from '../types/express.js';

export class AIService {
  async classifyTicket(ticketId: string, user?: AuthUser | string): Promise<ClassificationResult> {
    const startTime = Date.now();
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found for AI classification.');
    }

    if (user && typeof user !== 'string') {
      TicketRules.assertCanViewTicket(user, ticket);
    }

    const categories = await categoryRepository.list(true);
    const categoryNames = categories.map((c) => c.name);

    try {
      const result = await aiProvider.classifyTicket({
        subject: ticket.subject,
        description: ticket.description,
        categories: categoryNames,
      });

      const latencyMs = Date.now() - startTime;

      // Persist AI analysis document
      const analysis = await aiRepository.createAnalysis({
        ticketId: ticket._id,
        category: result.category,
        priority: result.priority,
        sentiment: result.sentiment,
        confidence: result.confidence,
        reason: result.reason,
        model: 'gpt-4o-mini',
      });

      // Update ticket reference
      const updatePayload: Record<string, any> = {
        aiAnalysisId: analysis._id,
      };

      // Rule: AI may set priority if not manually specified by a human agent
      if (ticket.prioritySource !== PrioritySource.HUMAN) {
        updatePayload.priority = result.priority;
        updatePayload.prioritySource = PrioritySource.AI;
      }

      await ticketRepository.update(ticket._id.toString(), updatePayload);

      // Log AI telemetry
      await aiRepository.logUsage({
        operation: 'CLASSIFICATION',
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        ticketId: ticket._id,
        userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        status: 'SUCCESS',
        latencyMs,
      });

      return result;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      logger.error(`AI classification failed for ticket ${ticketId}:`, err);

      await aiRepository.logUsage({
        operation: 'CLASSIFICATION',
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        ticketId: ticket._id,
        userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        status: 'FAILURE',
        latencyMs,
        errorType: err.name || 'UNKNOWN_ERROR',
      });

      throw new AIServiceError('Unable to complete AI ticket classification. Please try again later.');
    }
  }

  async summarizeTicket(ticketId: string, userId: string): Promise<SummaryResult> {
    const startTime = Date.now();
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    // Only fetch customer-safe messages (do not include internal notes in generic summaries)
    const messages = await messageRepository.findByTicketId(ticketId, false);

    try {
      const result = await aiProvider.summarizeTicket({
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        description: ticket.description,
        messages: messages.map((m) => ({
          authorRole: m.authorRole,
          message: m.message,
          createdAt: m.createdAt,
        })),
      });

      const latencyMs = Date.now() - startTime;

      await aiRepository.logUsage({
        operation: 'SUMMARY',
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        ticketId: ticket._id,
        userId: new mongoose.Types.ObjectId(userId),
        status: 'SUCCESS',
        latencyMs,
      });

      return result;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      logger.error(`AI summarization failed for ticket ${ticketId}:`, err);

      await aiRepository.logUsage({
        operation: 'SUMMARY',
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        ticketId: ticket._id,
        userId: new mongoose.Types.ObjectId(userId),
        status: 'FAILURE',
        latencyMs,
        errorType: err.name || 'UNKNOWN_ERROR',
      });

      throw new AIServiceError('Unable to generate AI summary. Please try again later.');
    }
  }

  async suggestReply(ticketId: string, userId: string): Promise<SuggestedReplyResult> {
    const startTime = Date.now();
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    const messages = await messageRepository.findByTicketId(ticketId, false);
    const customer = ticket.customerId as any;
    const customerName = customer?.name || 'Valued Customer';

    // Retrieve grounded Knowledge Base context
    const kbContext = await ragService.retrieveGroundedContext(ticket.subject, ticket.description);

    try {
      const result = await aiProvider.suggestReply({
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        description: ticket.description,
        customerName,
        messages: messages.map((m) => ({
          authorRole: m.authorRole,
          message: m.message,
        })),
        kbContext,
      });

      const latencyMs = Date.now() - startTime;

      await aiRepository.logUsage({
        operation: 'SUGGESTED_REPLY',
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        ticketId: ticket._id,
        userId: new mongoose.Types.ObjectId(userId),
        status: 'SUCCESS',
        latencyMs,
      });

      return result;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      logger.error(`AI suggested reply failed for ticket ${ticketId}:`, err);

      await aiRepository.logUsage({
        operation: 'SUGGESTED_REPLY',
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        ticketId: ticket._id,
        userId: new mongoose.Types.ObjectId(userId),
        status: 'FAILURE',
        latencyMs,
        errorType: err.name || 'UNKNOWN_ERROR',
      });

      throw new AIServiceError('Unable to generate AI suggested reply. Please try again later.');
    }
  }
}

export const aiService = new AIService();
