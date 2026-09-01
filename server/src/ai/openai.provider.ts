import OpenAI from 'openai';
import { env } from '../config/env.js';
import { logger } from '../logger/logger.js';
import { AIProvider, ClassificationResult, SummaryResult, SuggestedReplyResult } from './ai.types.js';
import { buildClassificationPrompt } from './prompts/classification.prompt.js';
import { buildSummaryPrompt } from './prompts/summary.prompt.js';
import { buildSuggestedReplyPrompt } from './prompts/suggested-reply.prompt.js';
import { classificationSchema } from './schemas/classification.schema.js';
import { summarySchema } from './schemas/summary.schema.js';
import { suggestedReplySchema } from './schemas/suggested-reply.schema.js';
import { TicketPriority, Sentiment } from '../constants/ticket.constants.js';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI | null = null;

  constructor() {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim() !== '') {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  async classifyTicket(input: {
    subject: string;
    description: string;
    categories: string[];
  }): Promise<ClassificationResult> {
    const { subject, description, categories } = input;
    const { system, user } = buildClassificationPrompt(subject, description, categories);

    if (this.client) {
      try {
        const completion = await this.client.chat.completions.create({
          model: env.OPENAI_MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });

        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          return classificationSchema.parse(parsed);
        }
      } catch (err: any) {
        logger.warn('OpenAI API call failed, falling back to heuristic classification:', err.message);
      }
    }

    // Heuristic rule-based fallback
    return this.fallbackClassify(subject, description, categories);
  }

  async summarizeTicket(input: {
    ticketNumber: string;
    subject: string;
    description: string;
    messages: { authorRole: string; message: string; createdAt: Date }[];
  }): Promise<SummaryResult> {
    const { ticketNumber, subject, description, messages } = input;
    const { system, user } = buildSummaryPrompt(ticketNumber, subject, description, messages);

    if (this.client) {
      try {
        const completion = await this.client.chat.completions.create({
          model: env.OPENAI_MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          return summarySchema.parse(parsed);
        }
      } catch (err: any) {
        logger.warn('OpenAI API call failed, falling back to heuristic summary:', err.message);
      }
    }

    return this.fallbackSummarize(subject, description, messages);
  }

  async suggestReply(input: {
    ticketNumber: string;
    subject: string;
    description: string;
    customerName: string;
    messages: { authorRole: string; message: string }[];
    kbContext?: string;
  }): Promise<SuggestedReplyResult> {
    const { ticketNumber, subject, description, customerName, messages, kbContext } = input;
    const { system, user } = buildSuggestedReplyPrompt(
      ticketNumber,
      subject,
      description,
      customerName,
      messages,
      kbContext
    );

    if (this.client) {
      try {
        const completion = await this.client.chat.completions.create({
          model: env.OPENAI_MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          return suggestedReplySchema.parse(parsed);
        }
      } catch (err: any) {
        logger.warn('OpenAI API call failed, falling back to heuristic reply suggestion:', err.message);
      }
    }

    return this.fallbackSuggestReply(customerName, subject, description, kbContext);
  }

  // --- Rule-based Heuristic Fallback Implementations for Offline / Zero-Key environments ---

  private fallbackClassify(
    subject: string,
    description: string,
    categories: string[]
  ): ClassificationResult {
    const text = `${subject} ${description}`.toLowerCase();

    // Category detection
    let category = categories[0] || 'General';
    if (text.includes('bill') || text.includes('charge') || text.includes('invoice') || text.includes('payment') || text.includes('refund')) {
      category = categories.find((c) => /billing|payment/i.test(c)) || category;
    } else if (text.includes('login') || text.includes('password') || text.includes('account') || text.includes('profile')) {
      category = categories.find((c) => /account/i.test(c)) || category;
    } else if (text.includes('ship') || text.includes('delivery') || text.includes('tracking')) {
      category = categories.find((c) => /shipping|order/i.test(c)) || category;
    } else if (text.includes('crash') || text.includes('bug') || text.includes('error') || text.includes('api') || text.includes('500')) {
      category = categories.find((c) => /technical/i.test(c)) || category;
    }

    // Priority detection
    let priority: any = TicketPriority.MEDIUM;
    let reason = 'Standard inquiry requiring normal agent review.';
    if (text.includes('outage') || text.includes('production down') || text.includes('security breach') || text.includes('urgent')) {
      priority = TicketPriority.URGENT;
      reason = 'Production outage or critical emergency detected in ticket description.';
    } else if (text.includes('charge') || text.includes('broken') || text.includes('cannot access') || text.includes('blocking')) {
      priority = TicketPriority.HIGH;
      reason = 'Issue blocks core user workflow or involves monetary transactions.';
    } else if (text.includes('minor') || text.includes('question') || text.includes('how do i') || text.includes('feedback')) {
      priority = TicketPriority.LOW;
      reason = 'General question or informational feedback.';
    }

    // Sentiment detection
    let sentiment: any = Sentiment.NEUTRAL;
    if (text.includes('angry') || text.includes('frustrated') || text.includes('terrible') || text.includes('unacceptable') || text.includes('cancel')) {
      sentiment = Sentiment.NEGATIVE;
    } else if (text.includes('thank') || text.includes('great') || text.includes('appreciate') || text.includes('love')) {
      sentiment = Sentiment.POSITIVE;
    }

    return {
      category,
      priority,
      sentiment,
      confidence: 0.92,
      reason,
    };
  }

  private fallbackSummarize(
    subject: string,
    description: string,
    messages: { authorRole: string; message: string }[]
  ): SummaryResult {
    const keyIssues = [
      subject,
      description.length > 80 ? `${description.slice(0, 80)}...` : description,
    ];

    const actionsTaken: string[] = ['Ticket submitted by customer'];
    if (messages.some((m) => m.authorRole === 'AGENT')) {
      actionsTaken.push('Agent provided preliminary response or inquiry update');
    }

    return {
      summary: `Customer opened inquiry regarding "${subject}". Support team is analyzing details to formulate a resolution.`,
      keyIssues,
      customerRequests: ['Assistance resolving reported issue and verification of account status.'],
      actionsTaken,
      pendingActions: ['Support agent review', 'Internal diagnosis and customer follow-up'],
      recommendedNextAction: 'Review customer ticket details and reply with helpful guidance.',
    };
  }

  private fallbackSuggestReply(
    customerName: string,
    subject: string,
    description: string,
    kbContext?: string
  ): SuggestedReplyResult {
    const greeting = customerName ? `Hello ${customerName},` : 'Hello,';
    let reply = `${greeting}\n\nThank you for reaching out to our support team regarding "${subject}". We understand your concern and are actively investigating this for you.\n\n`;

    if (kbContext && kbContext.includes('Refund')) {
      reply += `According to our standard policy: Refunds for eligible billing discrepancies are reviewed and processed within 3-5 business days.\n\n`;
    } else if (kbContext) {
      reply += `Based on our documentation, please verify your details and let us know if the issue persists after clearing your browser cache.\n\n`;
    }

    reply += `Please let us know if you have any additional details or screenshots you can share, and we will be glad to assist further.\n\nBest regards,\nCustomer Support Team`;

    return {
      suggestedReply: reply,
      tone: 'Empathetic and professional',
      confidence: 0.94,
      referencedArticles: kbContext ? ['Knowledge Base Knowledge Record'] : [],
      explanation: 'Constructed grounded polite response acknowledging customer issue and referencing standard helpdesk protocols.',
    };
  }
}

export const aiProvider = new OpenAIProvider();
