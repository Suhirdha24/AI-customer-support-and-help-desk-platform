# REST API Reference Manual

Base URL: `http://localhost:5000/api`

All successful responses follow the standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

All error responses return:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | FORBIDDEN | CONFLICT | STATE_TRANSITION_ERROR",
    "message": "Human-readable explanation of error",
    "errors": [ ... ]
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "Password123!",
    "role": "CUSTOMER"
  }
  ```
- **Response**: `201 Created` with JWT token and user profile.

### `POST /api/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "alice@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` with JWT token and user profile.

### `GET /api/auth/me`
- **Access**: Authenticated (Bearer Token)
- **Response**: `200 OK` with current user profile.

---

## 2. Tickets & Helpdesk Endpoints

### `GET /api/tickets`
- **Access**: Authenticated
- **Permissions**: Customers receive only their own tickets; Agents & Admins receive full queue.
- **Query Params**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10, max: 100)
  - `status`: TicketStatus enum
  - `priority`: TicketPriority enum
  - `categoryId`: ObjectId
  - `assignedAgentId`: ObjectId
  - `unassigned`: Boolean (`true` filters unassigned tickets)
  - `search`: String (searches subject & description)
  - `sortBy`: String (`createdAt`, `updatedAt`, `priority`)
  - `sortOrder`: `asc` | `desc`
- **Response**: `200 OK` with ticket array and pagination metadata.

### `POST /api/tickets`
- **Access**: Authenticated (Customer or Admin)
- **Body**:
  ```json
  {
    "subject": "System downtime in US-East",
    "description": "Database queries timing out on all read replicas.",
    "categoryId": "60d0fe4f5311236168a109ca",
    "priority": "HIGH",
    "attachments": [
      {
        "fileName": "error.log",
        "storageKey": "1788243-error.log",
        "mimeType": "text/plain",
        "size": 1024
      }
    ]
  }
  ```
- **Response**: `201 Created` with full Ticket object including sequence `ticketNumber` (`TKT-000001`). Triggers background AI triage.

### `GET /api/tickets/:id`
- **Access**: Authenticated
- **Permissions**: Must be ticket owner (Customer), or support Agent/Admin.
- **Response**: `200 OK` with populated ticket details.

### `PATCH /api/tickets/:id/status`
- **Access**: Authenticated
- **Permissions**: Agents & Admins.
- **Body**:
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```
- **Response**: `200 OK`. Strictly validates state transition graph; throws `409 Conflict` if invalid.

### `PATCH /api/tickets/:id/priority`
- **Access**: Authenticated (Agents and Admins only)
- **Body**:
  ```json
  {
    "priority": "URGENT"
  }
  ```
- **Response**: `200 OK`.

### `POST /api/tickets/:id/assign`
- **Access**: Authenticated (Agents and Admins only)
- **Body**:
  ```json
  {
    "agentId": "60d0fe4f5311236168a109cb"
  }
  ```
- **Response**: `200 OK`. Sets `assignedAgentId`, transitions ticket status from `OPEN` to `ASSIGNED`.

### `POST /api/tickets/:id/claim`
- **Access**: Authenticated (Agents and Admins only)
- **Response**: `200 OK`. Assigns the calling agent to the unassigned ticket.

### `POST /api/tickets/upload`
- **Access**: Authenticated
- **Form Data**: `files` (multipart/form-data)
- **Restrictions**: Max 10MB per file. Allowed extensions: `.png`, `.jpg`, `.jpeg`, `.pdf`, `.log`, `.txt`, `.json`, `.csv`. Executables rejected with `400 Bad Request`.
- **Response**: `200 OK` with array of attachment metadata.

### `GET /api/tickets/:id/attachments/:storageKey`
- **Access**: Authenticated
- **Permissions**: Resource authorization enforced. Customer cannot download attachments from other users' tickets.
- **Response**: File stream with correct `Content-Type`.

---

## 3. Ticket Messages & Internal Notes

### `GET /api/tickets/:id/messages`
- **Access**: Authenticated
- **Permissions**: Customer, Agent, Admin.
- **Security Invariant**: If caller is `CUSTOMER`, internal notes (`INTERNAL_NOTE`) are filtered out at the database level.
- **Response**: `200 OK` with array of messages.

### `POST /api/tickets/:id/messages`
- **Access**: Authenticated
- **Body**:
  ```json
  {
    "message": "We have escalated this to Tier 2 DevOps.",
    "isInternalNote": true,
    "attachments": []
  }
  ```
- **Permissions**: `isInternalNote: true` is strictly prohibited for `CUSTOMER` role (throws `403 Forbidden`).
- **Response**: `201 Created`.

---

## 4. AI & Human-in-the-Loop Endpoints

### `POST /api/ai/tickets/:id/analyze`
- **Access**: Authenticated (Agents and Admins)
- **Response**: `200 OK` with structured `{ category, priority, sentiment, confidence, reason }`.

### `POST /api/ai/tickets/:id/summarize`
- **Access**: Authenticated (Agents and Admins)
- **Response**: `200 OK` with `{ keyIssues, customerRequests, actionsTaken, pendingActions, nextStep }`.

### `POST /api/ai/tickets/:id/suggest-reply`
- **Access**: Authenticated (Agents and Admins)
- **Response**: `200 OK` with `{ replyText, confidence, groundingArticles, model }`.
- **Safety Policy**: **Human-in-the-loop enforced.** Does NOT send reply to customer automatically. The agent must accept, edit, and click "Send".

---

## 5. Knowledge Base Endpoints

- `GET /api/knowledge-base`: List published articles.
- `GET /api/knowledge-base/search?q=query`: Full-text search with text score ranking.
- `POST /api/knowledge-base`: Create article (Admin only).
- `PUT /api/knowledge-base/:id`: Update article (Admin only).
- `DELETE /api/knowledge-base/:id`: Archive article (Admin only).

---

## 6. Feedback & Dashboard Endpoints

- `POST /api/feedback/tickets/:id`: Submit CSAT 1-5 rating (Customer owner only, ticket must be RESOLVED or CLOSED).
- `GET /api/feedback/tickets/:id`: View feedback for ticket.
- `GET /api/dashboard/customer`: Customer metrics (Total, Open, In Progress, Resolved).
- `GET /api/dashboard/agent`: Agent workload (My assigned, unassigned, urgent, waiting).
- `GET /api/dashboard/admin`: Complete platform analytics, agent workloads, AI telemetry.

---

## 7. Admin Management Endpoints

- `GET /api/admin/users`: User directory with search and role filters.
- `PATCH /api/admin/users/:id/role`: Update user role (`CUSTOMER`, `AGENT`, `ADMIN`).
- `PATCH /api/admin/users/:id/status`: Toggle user activation (`isActive`).
- `GET /api/admin/agents`: Agent list with live active ticket workload counts.
- `GET /api/admin/categories` & `POST /api/admin/categories`: Ticket category management.
- `GET /api/admin/teams` & `POST /api/admin/teams`: Support team management.
- `GET /api/admin/audit-logs`: Query compliance audit logs.
- `GET /api/admin/ai-usage`: Query AI model performance telemetry.
