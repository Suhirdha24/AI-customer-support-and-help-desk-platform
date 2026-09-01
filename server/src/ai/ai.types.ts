import { TicketPriorityType, SentimentType } from '../constants/ticket.constants.js';

export interface ClassificationResult {
  category: string;
  priority: TicketPriorityType;
  sentiment: SentimentType;
  confidence: number;
  reason: string;
}

export interface SummaryResult {
  summary: string;
  keyIssues: string[];
  customerRequests: string[];
  actionsTaken: string[];
  pendingActions: string[];
  recommendedNextAction: string;
}

export interface SuggestedReplyResult {
  suggestedReply: string;
  tone: string;
  confidence: number;
  referencedArticles: string[];
  explanation: string;
}

export interface AIProvider {
  classifyTicket(input: {
    subject: string;
    description: string;
    categories: string[];
  }): Promise<ClassificationResult>;

  summarizeTicket(input: {
    ticketNumber: string;
    subject: string;
    description: string;
    messages: { authorRole: string; message: string; createdAt: Date }[];
  }): Promise<SummaryResult>;

  suggestReply(input: {
    ticketNumber: string;
    subject: string;
    description: string;
    customerName: string;
    messages: { authorRole: string; message: string }[];
    kbContext?: string;
  }): Promise<SuggestedReplyResult>;
}
