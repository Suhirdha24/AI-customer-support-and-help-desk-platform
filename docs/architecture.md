# Architecture Design Document: NexusDesk AI Platform

## 1. High-Level Architecture Overview

NexusDesk AI is a production-grade, enterprise customer support and helpdesk platform built on the MERN stack (MongoDB, Express, React, Node.js) with end-to-end TypeScript. The architecture emphasizes **security by default**, **resource-level tenant isolation**, **layered abstraction**, and **resilient AI orchestration**.

```
                           +-------------------------------------+
                           |            React 18 SPA             |
                           |   (Tailwind CSS, Zustand, Vite)     |
                           +------------------+------------------+
                                              | HTTPS / JSON
                                              v
+-----------------------------------------------------------------------------------------+
|                                    Express.js API Layer                                 |
|                                                                                         |
|  [Security Middlewares]                                                                 |
|  Helmet • CORS • express-rate-limit • Request-ID Correlation • Winston Logger Middleware|
|                                                                                         |
|  [Authentication & Authorization Middlewares]                                           |
|  JWT Bearer Verifier • Role-Based Access Control (CUSTOMER, AGENT, ADMIN)               |
|                                                                                         |
|  [Controllers (Thin HTTP Handlers)]                                                     |
|  Auth • Tickets • Messages • AI • KnowledgeBase • Feedback • Dashboard • Admin          |
|                                                                                         |
|  [Service Layer (Pure Business Logic & Invariants)]                                     |
|  TicketService • TicketStateMachine • TicketRules (Resource Auth) • MessageService      |
|  FeedbackService • DashboardService • AttachmentService • RAGService • AIService        |
|                                                                                         |
|  [Queue & Worker Subsystem]                                                             |
|  BullMQ Queue (Redis backed) <---> In-Memory Asynchronous Worker Failover               |
|                                                                                         |
|  [Repository Layer (Data Access & Projections)]                                         |
|  TicketRepo • MessageRepo (Private Note Filter) • UserRepo • KBRepo • AuditRepo         |
+------------------------------+---------------------------+------------------------------+
                               |                           |
                               v                           v
              +--------------------------------+   +-------------------------------+
              |        MongoDB Database        |   |    AI LLM Inference Engine    |
              |  Mongoose 8 ODM • BSON Indexes |   |  OpenAI API (GPT-4o / 3.5)    |
              |  Atomic Counters • Audit Trail |   |  Deterministic Fallback Engine|
              +--------------------------------+   +-------------------------------+
```

---

## 2. Layered Responsibilities & Dependency Rules

1. **Routing & Middleware**:
   - Parses HTTP requests and injects unique UUID `req.requestId`.
   - Validates incoming request parameters and bodies using Zod schemas (`validateBody`, `validateQuery`).
   - Authenticates JWT tokens and checks user roles.
2. **Controllers**:
   - Strictly thin. They extract validated inputs, forward calls to the Service layer, and return standard JSON response envelopes (`{ success: true, data, pagination }`).
   - Never query Mongoose models directly.
3. **Services**:
   - Contain 100% of business logic, invariant enforcement, state machine transitions, and cross-model orchestration.
   - Enforce resource-level authorization via `TicketRules` (e.g. verifying that the requesting customer owns the ticket before allowing reads/writes).
   - Emit audit events to `auditRepository` on every mutation.
4. **Repositories**:
   - Encapsulate all database interaction and MongoDB aggregation pipelines.
   - Strictly enforce security policies at the database query level: `messageRepository.findByTicketId` automatically strips `INTERNAL_NOTE` records when the requesting user is a `CUSTOMER`.
5. **AI Subsystem**:
   - Abstracted behind `AIProvider` interface (`openai.provider.ts`).
   - Uses strict Zod schema validation on structured LLM outputs.
   - If OpenAI is unreachable, times out, or has invalid keys, the provider automatically falls back to an offline heuristic scoring engine without throwing 500 errors to end users.

---

## 3. Background Job Queue Subsystem

AI ticket classification and embedding generation can introduce latency into standard HTTP request lifecycles. NexusDesk AI implements a resilient queue architecture:

1. **Primary Queue**: BullMQ backed by Redis.
2. **Fallback Queue**: When Redis is unavailable, `queue.service.ts` seamlessly switches to an internal, non-blocking asynchronous event worker (`setImmediate` / `EventEmitter`).
3. **Job Lifecycle**:
   - Ticket Created -> Event Enqueued (`QUEUE_NAMES.AI_CLASSIFICATION`).
   - Worker picks up job -> Invokes `aiService.classifyTicket(ticketId)`.
   - Result written to `AIAnalysis` collection -> Linked atomically to `ticket.aiAnalysisId`.
   - Audit log recorded.
