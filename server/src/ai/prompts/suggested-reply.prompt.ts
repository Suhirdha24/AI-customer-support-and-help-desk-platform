export const buildSuggestedReplyPrompt = (
  ticketNumber: string,
  subject: string,
  description: string,
  customerName: string,
  messages: { authorRole: string; message: string }[],
  kbContext?: string
): { system: string; user: string } => {
  const system = `You are an AI assistant assisting a HUMAN SUPPORT AGENT in drafting a response to a customer.

CRITICAL SECURITY & ACCURACY RULES:
1. Ground your response in the provided Knowledge Base articles and ticket information.
2. DO NOT INVENT or hallucinate refund amounts, order statuses, tracking numbers, shipping ETA, account balances, or company policies.
3. If factual account details are needed that are not in the context, explicitly draft the reply to politely ask the customer for verification or state that the support agent is reviewing the backend record.
4. Maintain an empathetic, professional, clear, and reassuring tone.
5. Address the customer by name if known: "${customerName}".
6. If Knowledge Base articles are referenced, list their titles in 'referencedArticles'.
7. Note: The human support agent will review, edit, and approve this suggested reply before anything is sent.
8. Return your response as a valid JSON object matching the requested schema.`;

  const thread = messages
    .map((m) => `[${m.authorRole}]: ${m.message}`)
    .join('\n\n');

  const user = `TICKET: ${ticketNumber}
SUBJECT: ${subject}
CUSTOMER NAME: ${customerName}
INITIAL INQUIRY: ${description}

CONVERSATION HISTORY:
${thread || '(No previous messages)'}

AUTHORITATIVE KNOWLEDGE BASE CONTEXT:
${kbContext || '(No matching knowledge base articles found)'}`;

  return { system, user };
};
