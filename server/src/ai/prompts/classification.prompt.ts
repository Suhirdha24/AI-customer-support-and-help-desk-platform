export const buildClassificationPrompt = (
  subject: string,
  description: string,
  categories: string[]
): { system: string; user: string } => {
  const system = `You are an expert AI support ticket classification assistant.
Your task is to analyze the support ticket submitted by a customer and provide structured classification.

RULES:
1. Category must be strictly chosen from the following available categories: [${categories.join(', ')}]. If none clearly match, choose "General" or "Technical Support".
2. Priority must be strictly one of: "LOW", "MEDIUM", "HIGH", "URGENT".
   - "URGENT": Complete outage, severe data loss, production stoppage, payment/security breach.
   - "HIGH": Severe issue impacting core workflows, immediate attention needed.
   - "MEDIUM": Standard issue, partial impediment with workaround available.
   - "LOW": Minor question, general feedback, cosmetic issue.
3. Sentiment must be strictly one of: "POSITIVE", "NEUTRAL", "NEGATIVE".
4. Confidence must be a number between 0.0 and 1.0 representing your certainty.
5. Reason must be a concise, objective explanation of why you selected this priority and category.
6. Do NOT invent system facts or customer history. Use only the text provided.
7. Return your response as a valid JSON object matching the requested schema.`;

  const user = `TICKET DETAILS:
Subject: ${subject}
Description: ${description}`;

  return { system, user };
};
