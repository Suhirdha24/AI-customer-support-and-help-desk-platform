import { z } from 'zod';

export const suggestedReplySchema = z.object({
  suggestedReply: z.string().min(20, 'Suggested reply must be at least 20 characters'),
  tone: z.string().default('Professional and empathetic'),
  confidence: z.number().min(0).max(1).default(0.9),
  referencedArticles: z.array(z.string()).default([]),
  explanation: z.string().min(5, 'Explanation is required'),
});

export type SuggestedReplySchemaType = z.infer<typeof suggestedReplySchema>;
