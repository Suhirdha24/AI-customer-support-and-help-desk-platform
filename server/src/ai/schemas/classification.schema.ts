import { z } from 'zod';
import { TicketPriority, Sentiment } from '../../constants/ticket.constants.js';

export const classificationSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  priority: z.enum([
    TicketPriority.LOW,
    TicketPriority.MEDIUM,
    TicketPriority.HIGH,
    TicketPriority.URGENT,
  ]),
  sentiment: z.enum([
    Sentiment.POSITIVE,
    Sentiment.NEUTRAL,
    Sentiment.NEGATIVE,
  ]),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

export type ClassificationSchemaType = z.infer<typeof classificationSchema>;
