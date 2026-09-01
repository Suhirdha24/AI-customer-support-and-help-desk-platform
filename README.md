# NexusDesk AI — Intelligent Customer Support & Helpdesk Platform

[![Tests](https://img.shields.io/badge/tests-49%20passed-emerald)](https://github.com/Suhirdha24/AI-customer-support-and-help-desk-platform)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-forestgreen)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **NexusDesk AI** is a production-quality, full-stack AI-augmented customer support and helpdesk platform built using the **MERN** stack (MongoDB, Express, React, Node.js) with **100% end-to-end TypeScript**. It integrates automated multi-factor ticket triaging, contextual incident summarization, RAG-grounded reply suggestions with **human-in-the-loop governance**, deterministic state machine transitions, and triple-layer privacy for internal team notes.

---

## Table of Contents

1. [Primary Architecture & System Overview](#1-primary-architecture--system-overview)
2. [Core Platform Features](#2-core-platform-features)
3. [Technology Stack](#3-technology-stack)
4. [Monorepo Workspace Structure](#4-monorepo-workspace-structure)
5. [Prerequisites & System Requirements](#5-prerequisites--system-requirements)
6. [Installation & Setup](#6-installation--setup)
7. [Pre-Seeded Demo Credentials](#7-pre-seeded-demo-credentials)
8. [Environment Configuration Reference](#8-environment-configuration-reference)
9. [Database Schema & Data Model](#9-database-schema--data-model)
10. [Atomic Ticket Sequence Generation](#10-atomic-ticket-sequence-generation)
11. [Deterministic Ticket State Machine](#11-deterministic-ticket-state-machine)
12. [Dual-Layer Authorization & Tenant Isolation](#12-dual-layer-authorization--tenant-isolation)
13. [Private Internal Note Security (Triple Defense)](#13-private-internal-note-security-triple-defense)
14. [AI Subsystem & Prompt Engineering](#14-ai-subsystem--prompt-engineering)
15. [Retrieval-Augmented Generation (RAG) Grounding](#15-retrieval-augmented-generation-rag-grounding)
16. [Resilient Offline Heuristic Engine](#16-resilient-offline-heuristic-engine)
17. [Background Queue Subsystem](#17-background-queue-subsystem)
18. [Customer Satisfaction (CSAT) Feedback](#18-customer-satisfaction-csat-feedback)
19. [File Attachment Security Pipeline](#19-file-attachment-security-pipeline)
20. [Immutable Compliance Audit Trail](#20-immutable-compliance-audit-trail)
21. [AI Telemetry & Model Observability](#21-ai-telemetry--model-observability)
22. [Frontend Architecture & Design Aesthetics](#22-frontend-architecture--design-aesthetics)
23. [API Endpoints Reference](#23-api-endpoints-reference)
24. [Standard JSON Envelope & Typed Errors](#24-standard-json-envelope--typed-errors)
25. [Security Engineering & Log Scrubbing](#25-security-engineering--log-scrubbing)
26. [Automated Vitest Test Suite](#26-automated-vitest-test-suite)
27. [Running Tests Locally](#27-running-tests-locally)
28. [Docker Compose Deployment](#28-docker-compose-deployment)
29. [Database Seeding & Resetting](#29-database-seeding--resetting)
30. [Troubleshooting & Diagnostics](#30-troubleshooting--diagnostics)
31. [Production Deployment Checklist](#31-production-deployment-checklist)
32. [License & Engineering Attribution](#32-license--engineering-attribution)

---

## 1. Primary Architecture & System Overview

NexusDesk AI follows clean architecture principles with strict layer boundaries:
- **Presentation Layer**: React 18 Single Page Application with Tailwind CSS, Lucide icons, and Zustand.
- **Transport Layer**: Express API with Helmet, CORS, Rate Limiting, and Winston request logging.
- **Application Services**: Pure TypeScript business services enforcing state transitions, resource authorization, and domain invariants.
- **Data Repositories**: Encapsulated Mongoose queries and aggregation pipelines with database-level security projections.
- **Queue Subsystem**: BullMQ with Redis, seamlessly falling back to an in-memory asynchronous worker when Redis is absent.
- **AI Orchestration**: Modular `AIProvider` using OpenAI GPT-4o with runtime Zod schema validation and a deterministic offline heuristic simulator.

```
                           +-------------------------------------+
                           |            React 18 SPA             |
                           |    (Vite, Tailwind, Zustand, Lucide)|
                           +------------------+------------------+
                                              | HTTPS / REST
                                              v
+-----------------------------------------------------------------------------------------+
|                                    Express.js API Layer                                 |
|                                                                                         |
|  [Security & Logging Middlewares]                                                       |
|  Helmet • CORS • Rate Limiter (15 req/15min) • UUID RequestId • Winston Log Sanitizer   |
|                                                                                         |
|  [Auth & RBAC Middleware]                                                               |
|  JWT Bearer Verifier • Role Guard (CUSTOMER, AGENT, ADMIN)                              |
|                                                                                         |
|  [Thin Controllers]                                                                     |
|  Auth • Tickets • Messages • AI • KnowledgeBase • Feedback • Dashboard • Admin          |
|                                                                                         |
|  [Business Service Layer & Invariants]                                                  |
|  TicketService • TicketStateMachine • TicketRules (Tenant Isolation) • MessageService  |
|  FeedbackService • DashboardService • AttachmentService • RAGService • AIService        |
|                                                                                         |
|  [Queue & Worker Subsystem]                                                             |
|  BullMQ (Redis) <---------------------------------> In-Memory Async Worker Fallback     |
|                                                                                         |
|  [Repository Layer]                                                                     |
|  TicketRepo • MessageRepo (Private Note Filter) • UserRepo • KBRepo • AuditRepo         |
+------------------------------+---------------------------+------------------------------+
                               |                           |
                               v                           v
              +--------------------------------+   +-------------------------------+
              |        MongoDB Database        |   |    AI LLM Inference Engine    |
              |  Mongoose 8 ODM • BSON Indexes |   |  OpenAI API (GPT-4o / 3.5)    |
              |  Atomic Counters • Audit Trail |   |  Offline Heuristic Simulator  |
              +--------------------------------+   +-------------------------------+
```

---

## 2. Core Platform Features

### 👤 For Customers
- **Self-Service Registration & Login**: Instant account creation with password hashing and JWT issuance.
- **Ticket Submission**: Rich ticket creation with category selection, priority indicators, and multi-file drag-and-drop attachments.
- **Ticket Tracking**: Filter, search, and monitor progress across statuses (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
- **Interactive Conversation Thread**: Real-time communication with support representatives.
- **Knowledge Base Search**: Full-text instant search across documentation to solve issues without opening tickets.
- **CSAT Feedback**: Submit 1 to 5-star ratings and written reviews once inquiries are resolved.

### 🛡️ For Support Agents
- **Multi-Queue Dashboard**: Fast views for *My Assigned Tickets*, *Unassigned Pool*, *Urgent Queue*, and *Waiting on Customer*.
- **Quick Ticket Claiming**: 1-click claiming of unassigned inquiries.
- **AI Ticket Intelligence Card**: View predicted category, suggested priority, sentiment analysis (Positive, Neutral, Negative), and confidence percentage.
- **AI Incident Summarizer**: 1-click structured summary extracting *Key Issues*, *Customer Requests*, *Actions Taken*, *Pending Actions*, and *Recommended Next Steps*.
- **RAG-Grounded Suggested Replies**: AI auto-drafts responses grounded in knowledge base documentation.
- **Human-in-the-Loop Governance**: AI drafts are never sent automatically; agents review, edit, and approve before sending.
- **Private Internal Notes**: Add team-only notes highlighted in amber, guaranteed never to leak to customers.
- **FSM Status Controls**: Transition tickets strictly through allowed lifecycle states.

### 👑 For Administrators
- **Executive Analytics Dashboard**: Aggregated metrics on ticket velocity, SLA fulfillment, average CSAT score, status breakdowns, and agent workloads.
- **User Directory**: Search, activate/deactivate accounts, and adjust role permissions.
- **Agent Workloads**: Inspect active tickets per agent in real time.
- **Taxonomy & Team Routing**: Create and configure categories and specialized support tiers.
- **Knowledge Base Management**: Author, publish, and tag documentation articles.
- **Compliance Audit Trail**: Paginated viewer for all state transitions, user access, and configuration changes.
- **AI Telemetry & Observability**: Real-time monitoring of model inference latency, token counts, and fallback activation.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript 5.7, Vite, Tailwind CSS 3.4, Zustand, Lucide Icons, Axios |
| **Backend** | Node.js 20+, Express 4.21, TypeScript 5.7, Zod 3.24, Winston 3.17 |
| **Database** | MongoDB 8.0 / 7.0, Mongoose 8.9 |
| **Authentication**| JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (10 rounds) |
| **AI / LLM** | OpenAI API (`gpt-4o`, `gpt-3.5-turbo`), Deterministic Heuristic Offline Engine |
| **Queues** | BullMQ 5.40, IORedis 5.4, In-Memory Event Worker Fallback |
| **Security** | Helmet 8.0, CORS 2.8, Express-Rate-Limit 7.5, Multer 1.4 |
| **Testing** | Vitest 3.0, Supertest 7.0 |
| **DevOps** | Docker, Docker Compose, Nginx Alpine |

---

## 4. Monorepo Workspace Structure

```
c:\customer support
├── package.json               # Root npm workspaces orchestrator
├── docker-compose.yml         # Multi-container Docker deployment
├── .env.example               # Root template for environment variables
├── .env                       # Local environment configuration
├── docs/                      # Comprehensive architectural documentation
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── authorization.md
│   ├── ai-architecture.md
│   ├── ticket-state-machine.md
│   └── security.md
├── server/                    # Backend API (Node.js, Express, TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts       # Vitest runner configuration
│   ├── Dockerfile
│   ├── src/
│   │   ├── ai/                # AI Provider, Prompts, Schemas, RAG Service
│   │   ├── config/            # Environment parsing (Zod) and DB manager
│   │   ├── constants/         # Roles, Ticket statuses, Events
│   │   ├── controllers/       # Thin HTTP controllers
│   │   ├── errors/            # Typed AppError hierarchy
│   │   ├── logger/            # Winston logger with redaction
│   │   ├── middleware/        # Auth, RBAC, Validation, Upload, Error
│   │   ├── models/            # Mongoose schemas & TypeScript interfaces
│   │   ├── queues/            # BullMQ & async in-memory worker
│   │   ├── repositories/      # Encapsulated MongoDB data access
│   │   ├── routes/            # Mounted Express routers
│   │   ├── seeds/             # Seed data script
│   │   ├── services/          # Business logic, FSM, and Auth checks
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   └── tests/
│       └── helpdesk.test.ts   # 34 comprehensive automated Vitest tests
└── client/                    # Frontend SPA (React, Vite, Tailwind)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/               # Axios client with JWT interceptor
        ├── components/        # Badges, Modals, Loaders, Sidebar, Navbar
        ├── features/          # Auth, Dashboards, Tickets, KB, Admin
        ├── layouts/           # AppLayout, Role boundary guards
        ├── store/             # Zustand stores (useAuthStore, useToastStore)
        ├── types/             # Frontend TypeScript definitions
        ├── App.tsx            # Route tree configuration
        └── main.tsx           # Application entry point
```

---

## 5. Prerequisites & System Requirements

- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- **MongoDB**: `v7.0` or `v8.0` running locally on `localhost:27017` (or Docker)
- *(Optional)* **Redis**: `v6.x` or `v7.x` on `localhost:6379` (system automatically falls back to in-memory async worker if absent)
- *(Optional)* **OpenAI API Key**: For live LLM inferences (system automatically falls back to offline heuristic simulator if absent)

---

## 6. Installation & Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/Suhirdha24/AI-customer-support-and-help-desk-platform.git
cd AI-customer-support-and-help-desk-platform
```

### Step 2: Install Monorepo Dependencies
From the repository root:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` into `.env` and `server/.env`:
```bash
cp .env.example .env
cp .env.example server/.env
```

### Step 4: Seed Database with Demo Accounts
Run the seed script from root or inside `server/`:
```bash
npm run seed --workspace=ai-helpdesk-server
# OR:
cd server && npm run seed
```

### Step 5: Start Development Servers
To run both backend and frontend concurrently:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000` (Health check: `http://localhost:5000/health`)
- **Frontend App**: `http://localhost:5173`

---

## 7. Pre-Seeded Demo Credentials

All seeded accounts share the default password: **`Password123!`**

| Name | Role | Email | Password | Pre-configured Access |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `ADMIN` | `admin@example.com` | `Password123!` | Executive analytics, user management, audit logs, AI telemetry |
| **Sarah Connor** | `AGENT` | `agent1@example.com` | `Password123!` | Senior Agent (Assigned to Tier 2 & Billing) |
| **Alex Murphy** | `AGENT` | `agent2@example.com` | `Password123!` | Support Agent (General Queue) |
| **Alice Smith** | `CUSTOMER` | `customer1@example.com`| `Password123!` | Acquired tickets: `TKT-000001` (API & Webhooks) |
| **Bob Jones** | `CUSTOMER` | `customer2@example.com`| `Password123!` | Acquired tickets: `TKT-000002` (Billing Discrepancy) |

> 💡 *The login screen includes **one-click demo login buttons** for instant access without manual typing.*

---

## 8. Environment Configuration Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | `5000` | Backend API listen port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ai_helpdesk` | MongoDB connection URI |
| `JWT_SECRET` | `super-secret-key-32-chars-long` | Cryptographic secret for signing JWTs |
| `JWT_EXPIRES_IN`| `7d` | JWT lifespan window |
| `CLIENT_URL` | `http://localhost:5173` | Allowed origin for CORS |
| `OPENAI_API_KEY`| *(Optional)* | OpenAI API key for live GPT-4o inference |
| `REDIS_HOST` | `localhost` | Redis server hostname |
| `REDIS_PORT` | `6379` | Redis server port |
| `UPLOAD_DIR` | `./uploads` | Local directory for encrypted attachment storage |

---

## 9. Database Schema & Data Model

The platform uses 11 MongoDB collections:
1. `users`: Stores customer, agent, and administrator profiles, roles, and hashed passwords.
2. `counters`: Atomic integer sequence counter ensuring non-colliding human-readable ticket numbers (`TKT-000001`).
3. `categories`: Triage routing taxonomy (e.g. *API & Integrations*, *Billing*, *Authentication*).
4. `teams`: Support tiers (e.g. *Tier 2 DevOps*, *Enterprise Billing*).
5. `tickets`: Core incident records with full-text search indexes on subject and description.
6. `ticket_messages`: Chronological conversation timeline containing customer messages, agent replies, internal notes, and file attachments.
7. `knowledge_base_articles`: Published documentation indexed for full-text search and RAG retrieval.
8. `ticket_feedbacks`: CSAT 1-5 rating records with duplicate submission prevention.
9. `audit_logs`: Append-only compliance ledger recording every state change and administrative action.
10. `ai_analyses`: Structured AI outputs (Category, Priority, Sentiment, Confidence, Reason).
11. `ai_usage_logs`: Inference telemetry recording model used, latency in milliseconds, token counts, and fallback activation.

---

## 10. Atomic Ticket Sequence Generation

Human-readable identifiers (`TKT-000001`) are generated via MongoDB's atomic `$inc` operator on the `Counter` collection:
```ts
// server/src/services/ticket.service.ts
const counter = await Counter.findByIdAndUpdate(
  { _id: 'ticket_number' },
  { $inc: { seq: 1 } },
  { new: true, upsert: true }
);
const ticketNumber = `TKT-${String(counter.seq).padStart(6, '0')}`;
```
This guarantees monotonic incrementation without race conditions or sequence collisions, even under high concurrent load.

---

## 11. Deterministic Ticket State Machine

Ticket status transitions are strictly governed by `TicketStateMachine`:

| From State | Allowed Next States |
| :--- | :--- |
| `OPEN` | `ASSIGNED`, `IN_PROGRESS`, `CLOSED` |
| `ASSIGNED` | `IN_PROGRESS`, `WAITING_FOR_CUSTOMER`, `RESOLVED`, `CLOSED` |
| `IN_PROGRESS` | `WAITING_FOR_CUSTOMER`, `RESOLVED`, `CLOSED` |
| `WAITING_FOR_CUSTOMER` | `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `RESOLVED` | `CLOSED`, `REOPENED` |
| `REOPENED` | `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `CLOSED` | `REOPENED` |

- Illegal transitions (e.g. `ASSIGNED` -> `CLOSED` or `OPEN` -> `RESOLVED`) are rejected with `409 Conflict`.
- **Automated Trigger**: When a customer posts a message to a ticket in `WAITING_FOR_CUSTOMER`, the system automatically transitions the status back to `IN_PROGRESS`.

---

## 12. Dual-Layer Authorization & Tenant Isolation

NexusDesk AI prevents unauthorized access through two independent layers:
1. **HTTP Router RBAC**: Validates role access (e.g. ensuring only `ADMIN` can reach `/api/admin/*`).
2. **Resource-Level Authorization (`TicketRules`)**:
   - Customer A cannot view, reply to, or download attachments from Customer B's ticket.
   - Any access attempt by an unauthorized customer returns `403 Forbidden`.
   - Agents and administrators have access across the helpdesk queue.

---

## 13. Private Internal Note Security (Triple Defense)

Internal notes allow agents to discuss issues privately. NexusDesk AI implements **defense-in-depth**:
1. **Controller Rejection**: If a `CUSTOMER` submits `isInternalNote: true`, the API rejects the request with `403 Forbidden`.
2. **Service Assertion**: `TicketRules.assertCanAddInternalNote` verifies agent/admin role before proceeding.
3. **Database Query Projection**: `messageRepository.findByTicketId` inspects the calling user's role. If the user is a `CUSTOMER`, `{ type: { $ne: 'INTERNAL_NOTE' } }` is applied at the MongoDB query level. Internal notes are **never retrieved from disk** for customers.

---

## 14. AI Subsystem & Prompt Engineering

The platform implements three AI workflows:
- **Triage & Classification**: Extracts priority, category, and customer sentiment with explainability reasoning.
- **Incident Timeline Summarizer**: Extracts key issues, customer requests, actions taken, and recommended next steps.
- **Suggested Reply Generator**: RAG-assisted response drafting grounded in published documentation.

All AI responses are validated at runtime using **Zod schemas**. Malformed outputs trigger fallback routines instead of throwing unhandled exceptions.

---

## 15. Retrieval-Augmented Generation (RAG) Grounding

To prevent LLM hallucination:
1. When generating a suggested reply, `rag.service.ts` extracts keywords from the ticket inquiry.
2. It queries published articles in MongoDB using a text-index search.
3. The top relevant articles are injected into the prompt context.
4. The model is constrained to formulate answers based solely on the grounded documentation.

---

## 16. Resilient Offline Heuristic Engine

If OpenAI API keys are absent, network connectivity is severed, or OpenAI experiences an outage:
- The system automatically engages an offline heuristic engine (`openai.provider.ts`).
- It analyzes urgency triggers, keyword densities, and linguistic sentiment polarities.
- It returns valid, schema-compliant triage outputs.
- Flags `usedFallback: true` in `AIUsageLog` for administrative monitoring.
- The platform remains **100% operational** with zero 500 errors.

---

## 17. Background Queue Subsystem

- **Primary Queue**: BullMQ backed by Redis for asynchronous AI classification.
- **Resilient Fallback**: When Redis is not available, `queue.service.ts` switches to an internal, non-blocking asynchronous worker.
- Classification runs in the background without blocking ticket creation HTTP response times.

---

## 18. Customer Satisfaction (CSAT) Feedback

- Once a ticket is `RESOLVED` or `CLOSED`, the customer is invited to submit a 1 to 5-star rating with optional comments.
- Submissions on active/open tickets or by non-owners are rejected with `403 Forbidden`.
- Unique MongoDB indexes prevent duplicate ratings on the same ticket.

---

## 19. File Attachment Security Pipeline

- **Permitted File Types**: `.png`, `.jpg`, `.jpeg`, `.pdf`, `.log`, `.txt`, `.json`, `.csv`. Executables are rejected by Multer with `400 Bad Request`.
- **Size Limit**: 10MB per file.
- **Unique Storage Keys**: Stored as `${Date.now()}-${randomHex}.${ext}` to prevent path traversal and overwriting.
- **Authorized Serving**: Files are served exclusively via authenticated endpoint `GET /api/tickets/:id/attachments/:storageKey`, which verifies ticket view permissions.

---

## 20. Immutable Compliance Audit Trail

Every mutating action records an immutable audit entry in the `audit_logs` collection:
- `action`: e.g. `TICKET_CREATED`, `TICKET_STATUS_CHANGED`, `TICKET_ASSIGNED`, `INTERNAL_NOTE_ADDED`.
- `performedBy`: User reference.
- `details`: Metadata snapshot (previous status, new status, assigned agent ID).

---

## 21. AI Telemetry & Model Observability

Administrators can monitor AI performance in real time via `GET /api/admin/ai-usage`:
- Execution latency in milliseconds.
- Token consumption.
- Fallback heuristic activation rates.
- Error logs and schema rejection telemetry.

---

## 22. Frontend Architecture & Design Aesthetics

Built with modern web standards and visual polish:
- **Tailwind CSS Design System**: Custom curated palette (Slate, Indigo, Violet, Emerald, Amber, Rose).
- **Responsive Layout**: Collapsible sidebar with mobile overlay drawer.
- **Visual Status Badges**: Distinct badges with status indicator dots.
- **Dynamic Empty States & Skeleton Loaders**: Smooth transitions during data loading.
- **Real-Time Notification Drawer**: In-app notifications with badge counts and mark-as-read actions.

---

## 23. API Endpoints Reference

Comprehensive documentation is provided in [`docs/api.md`](file:///c:/customer%20support/docs/api.md).

Quick summary of endpoints:
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/tickets`, `POST /api/tickets`, `GET /api/tickets/:id`
- `PATCH /api/tickets/:id/status`, `PATCH /api/tickets/:id/priority`
- `POST /api/tickets/:id/assign`, `POST /api/tickets/:id/claim`
- `POST /api/tickets/upload`, `GET /api/tickets/:id/attachments/:storageKey`
- `GET /api/tickets/:id/messages`, `POST /api/tickets/:id/messages`
- `POST /api/ai/tickets/:id/analyze`, `POST /api/ai/tickets/:id/summarize`, `POST /api/ai/tickets/:id/suggest-reply`
- `GET /api/knowledge-base`, `GET /api/knowledge-base/search`, `POST /api/knowledge-base`
- `POST /api/feedback/tickets/:id`, `GET /api/feedback/tickets/:id`
- `GET /api/dashboard/customer`, `GET /api/dashboard/agent`, `GET /api/dashboard/admin`
- `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `PATCH /api/admin/users/:id/status`
- `GET /api/admin/agents`, `GET /api/admin/teams`, `GET /api/admin/categories`
- `GET /api/admin/audit-logs`, `GET /api/admin/ai-usage`

---

## 24. Standard JSON Envelope & Typed Errors

All responses adhere to the standard envelope:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 24, "totalPages": 3 }
}
```

Errors map to typed HTTP status codes:
- `400 Bad Request`: `ValidationError` (with Zod field errors array).
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: `AuthorizationError` (resource or role violation).
- `404 Not Found`: `NotFoundError` (entity does not exist).
- `409 Conflict`: `StateTransitionError` or duplicate email.
- `429 Too Many Requests`: `RateLimitError`.
- `500 Internal Server Error`: Safe generic message (stack trace hidden in production).

---

## 25. Security Engineering & Log Scrubbing

- **Winston Redaction**: Password, token, and authorization headers are automatically scrubbed from logs.
- **Helmet**: Sets secure HTTP response headers.
- **CORS**: Enforces origin restrictions.
- **Rate Limiter**: Protects auth endpoints from brute-force attempts.

---

## 26. Automated Vitest Test Suite

The automated test suite (`server/tests/helpdesk.test.ts`) covers **34 comprehensive integration scenarios**:
1. Authentication (Registration, Hashing, Token Issuance, Invalid Passwords).
2. Resource-Level Authorization (Customer Isolation, Admin Route Protection).
3. Ticket Core & State Machine (Human-readable ticket numbers, Valid transitions, Invalid transition rejection).
4. Ticket Assignment & Workload Distribution.
5. Internal Note Secrecy (Agent access vs Database-level customer stripping).
6. AI Triage, Structured Schema Validation, and Grounded Suggested Replies.
7. Knowledge Base Search & Authoring.
8. Customer Satisfaction Feedback Eligibility.
9. Attachment Upload Whitelisting & Secure Stream Authorization.

---

## 27. Running Tests Locally

To execute the test suite against the local MongoDB instance:
```bash
# From the repository root:
npm test --workspace=ai-helpdesk-server

# Or directly from server/:
cd server
npm test
```

Expected output:
```
 ✓ tests/helpdesk.test.ts (34 tests)
 Test Files  1 passed (1)
      Tests  34 passed (34)
```

---

## 28. Docker Compose Deployment

The platform includes a complete multi-container Docker configuration (`docker-compose.yml`):
- `mongodb`: MongoDB 7.0 with persistent volume.
- `redis`: Redis Alpine with healthcheck.
- `server`: Multi-stage Node.js Alpine build.
- `client`: Multi-stage Nginx Alpine build.

To launch the full stack with Docker:
```bash
docker-compose up --build
```
- Client accessible at `http://localhost:3000` (or `http://localhost:5173`)
- Server API accessible at `http://localhost:5000`

---

## 29. Database Seeding & Resetting

To reset and reseed the database with demo users, tickets, articles, and feedback:
```bash
npm run seed --workspace=ai-helpdesk-server
```

---

## 30. Troubleshooting & Diagnostics

- **MongoDB Connection Refused**:
  Ensure MongoDB is running locally (`net start MongoDB` on Windows or `systemctl start mongod` on Linux).
- **Redis Connection Warnings**:
  If Redis is not installed locally, NexusDesk AI automatically activates its in-memory async worker. No action required.
- **OpenAI Key Not Provided**:
  The offline heuristic simulator activates automatically. All classification, summarization, and suggested reply features remain functional.

---

## 31. Production Deployment Checklist

- [x] Configure production `MONGODB_URI` with authentication and TLS.
- [x] Set strong 64-character `JWT_SECRET`.
- [x] Configure production `CLIENT_URL` for CORS.
- [x] Provide valid `OPENAI_API_KEY`.
- [x] Provision Redis cluster for BullMQ job queue.
- [x] Enable HTTPS termination via reverse proxy (Nginx or Cloudflare).
- [x] Configure external volume mount for `UPLOAD_DIR`.

---

## 32. License & Engineering Attribution

Distributed under the **MIT License**. Built with engineering rigor by **Suhirdha24**.
