# AI Architecture & Prompt Engineering

OmniSupport AI incorporates artificial intelligence as an **augmented copilot for support agents**, maintaining a strict **human-in-the-loop** paradigm.

---

## 1. AI Capabilities

1. **Automated Ticket Triage**:
   Infers category, priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and customer sentiment (`POSITIVE`, `NEUTRAL`, `NEGATIVE`) with confidence scores and explainable reasoning.
2. **Contextual Incident Summarization**:
   Summarizes multi-message conversation histories into five structured dimensions:
   - Key Issues
   - Customer Requests
   - Actions Taken So Far
   - Pending Actions
   - Recommended Next Step
3. **Grounded Suggested Reply (RAG)**:
   Retrieves relevant knowledge base documentation from MongoDB via full-text search and supplies it as context to the LLM to draft grounded, hallucination-free support responses.

---

## 2. Structured Outputs & Validation

All AI outputs are validated using Zod schemas at runtime before persisting or returning to callers:

```ts
// server/src/ai/schemas/classification.schema.ts
export const classificationSchema = z.object({
  category: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1),
});
```

If an LLM response violates schema constraints, the AI subsystem flags a validation error and executes the deterministic fallback rather than crashing the API.

---

## 3. Grounded Retrieval-Augmented Generation (RAG)

To eliminate hallucinations in suggested replies, `rag.service.ts` performs keyword extraction and queries the `knowledge_base_articles` collection using MongoDB's text search index:

```ts
// server/src/ai/rag.service.ts
const articles = await kbRepository.searchPublished(extractedKeywords, 3);
```

The top 3 relevant articles are appended directly into the prompt context:

```
CONTEXTUAL KNOWLEDGE BASE ARTICLES:
---
Article: Webhook Retry Policy
Content: Webhook delivery failures retry with exponential backoff for up to 24 hours...
---
Instructions: Answer the customer's question strictly based on the provided articles above. If the context does not provide sufficient info, recommend escalating to engineering.
```

---

## 4. Deterministic Offline Fallback Simulator

A fundamental requirement of enterprise software is **high availability**. If the OpenAI API key is missing, network access is severed, or OpenAI experiences an outage, `openai.provider.ts` activates a deterministic offline heuristic engine:

- **Priority Estimation**: Evaluates urgency triggers (e.g. `production down`, `outage`, `crash` -> `URGENT`; `billing`, `invoice` -> `HIGH`; `how to`, `guide` -> `LOW`).
- **Category Inference**: Evaluates semantic keyword clusters (e.g. `api`, `webhook`, `oauth`, `token` -> `API & Integrations`).
- **Sentiment Scoring**: Detects frustration markers (`frustrated`, `unacceptable`, `broken`, `urgent` -> `NEGATIVE`).

This ensures that the platform functions reliably during technical evaluations, automated CI runs, or offline environments.

---

## 5. Human-in-the-Loop Safeguards

OmniSupport AI strictly prohibits autonomous message delivery to customers. The system architecture enforces this via:
- Suggested replies are saved only in the agent's interactive UI draft session.
- No background job or API endpoint transmits an AI draft directly to the customer message thread.
- The human support agent must explicitly review, optionally modify, and press "Send Reply".
