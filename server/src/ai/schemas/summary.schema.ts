import { z } from 'zod';

export const summarySchema = z.object({
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  keyIssues: z.array(z.string()).min(1, 'At least one key issue required'),
  customerRequests: z.array(z.string()).default([]),
  actionsTaken: z.array(z.string()).default([]),
  pendingActions: z.array(z.string()).default([]),
  recommendedNextAction: z.string().min(5, 'Recommended next action required'),
});

export type SummarySchemaType = z.infer<typeof summarySchema>;
