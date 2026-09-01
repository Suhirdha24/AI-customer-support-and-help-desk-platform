export const buildSummaryPrompt = (
  ticketNumber: string,
  subject: string,
  description: string,
  messages: { authorRole: string; message: string; createdAt: Date }[]
): { system: string; user: string } => {
  const system = `You are an expert AI helpdesk summarization assistant.
Your task is to summarize an ongoing customer support ticket thread for a support agent.

RULES:
1. Be objective, accurate, and concise.
2. Clearly extract:
   - summary: A 2-3 sentence overview of the current ticket state.
   - keyIssues: Bullet points of the primary root problems reported.
   - customerRequests: What the customer is explicitly asking for.
   - actionsTaken: Steps already completed by support or the customer.
   - pendingActions: What needs to be done next.
   - recommendedNextAction: The single highest priority next action for the agent.
3. NEVER disclose or infer internal notes into customer-facing assertions.
4. Ground your summary strictly in the provided conversation.
5. Return your response as a valid JSON object matching the requested schema.`;

  const thread = messages
    .map(
      (m) =>
        `[${m.authorRole}] (${new Date(m.createdAt).toISOString()}): ${m.message}`
    )
    .join('\n\n');

  const user = `TICKET NUMBER: ${ticketNumber}
SUBJECT: ${subject}
INITIAL DESCRIPTION: ${description}

CONVERSATION THREAD:
${thread || '(No additional messages yet)'}`;

  return { system, user };
};
