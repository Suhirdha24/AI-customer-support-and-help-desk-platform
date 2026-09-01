# Authorization & Security Architecture

NexusDesk AI enforces a dual-layered security architecture:
1. **Role-Based Access Control (RBAC)** at the HTTP router layer.
2. **Resource-Level Authorization (Tenant Isolation)** inside the Service layer.

---

## 1. Role Definitions

| Role | Intended Audience | Core Capabilities |
| :--- | :--- | :--- |
| **CUSTOMER** | External end users | Create tickets, view own tickets, post customer replies, view public KB articles, rate resolved tickets. |
| **AGENT** | Support engineers | View full ticket queue, claim tickets, reassign, update priority/status, post customer replies & private internal notes, execute AI assistance tools. |
| **ADMIN** | System administrators | Full platform access, manage users & roles, configure teams & categories, manage KB, inspect audit trails & AI telemetry. |

---

## 2. Resource-Level Authorization (`TicketRules`)

RBAC checks whether a user *role* can hit a URL (e.g. `GET /api/tickets/:id`). However, RBAC alone cannot prevent Customer A from reading Customer B's ticket.

NexusDesk AI solves this with `TicketRules`:
```ts
// server/src/services/ticketRules.ts
export class TicketRules {
  public static canViewTicket(user: AuthUser, ticket: ITicket): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.AGENT) return true;
    // Customers can ONLY view their own tickets
    const customerId = getEntityId(ticket.customerId);
    return customerId === user.id;
  }
}
```

If Customer A attempts to:
- Access `/api/tickets/:id` of Customer B -> Returns `403 Forbidden`.
- Post a message to Customer B's ticket -> Returns `403 Forbidden`.
- Download an attachment from Customer B's ticket -> Returns `403 Forbidden`.
- Submit feedback on Customer B's ticket -> Returns `403 Forbidden`.

---

## 3. Private Internal Note Secrecy (Defense-in-Depth)

Internal notes allow agents to collaborate, discuss root causes, and post sensitive diagnostics without exposing them to customers. We implement **three layers of defense**:

1. **API Ingestion Guard**:
   In `message.controller.ts`, if a `CUSTOMER` attempts to post `isInternalNote: true`, the system rejects the request immediately with `403 Forbidden: Customers cannot create internal notes.`

2. **Service Layer Assertion**:
   `TicketRules.assertCanAddInternalNote(user)` enforces that only `AGENT` or `ADMIN` can create an internal note.

3. **Database-Level Projection Stripping**:
   In `message.repository.ts`, `findByTicketId(ticketId, userRole)` evaluates the role at the database query level:
   ```ts
   const filter: any = { ticketId };
   if (userRole === UserRole.CUSTOMER) {
     filter.type = { $ne: 'INTERNAL_NOTE' };
   }
   return TicketMessage.find(filter).sort({ createdAt: 1 });
   ```
   Even if an attacker intercepts or tampers with the API response, internal notes are never retrieved from MongoDB for customer requests.

---

## 4. Authorization Decision Matrix

| Action | Customer | Agent | Admin | Enforcement Mechanism |
| :--- | :---: | :---: | :---: | :--- |
| **Register Account** | Yes | No | No | `auth.controller` default role |
| **View Own Tickets** | Yes | Yes | Yes | `TicketRules.canViewTicket` |
| **View Other Customer's Ticket** | **NO (403)** | Yes | Yes | `TicketRules.assertCanViewTicket` |
| **Create Ticket** | Yes | Yes | Yes | `ticket.controller.createTicket` |
| **Change Status** | No | Allowed transitions | Allowed transitions | `TicketStateMachine` |
| **Change Priority** | **NO (403)** | Yes | Yes | `TicketRules.assertCanChangePriority` |
| **Claim Ticket** | No | If unassigned | Yes | `TicketRules.assertCanClaimTicket` |
| **Assign Ticket to Agent** | No | Yes | Yes | `TicketRules.assertCanAssignTicket` |
| **Add Customer Reply** | Yes (own ticket) | Yes | Yes | `message.service.addMessage` |
| **Add Internal Note** | **NO (403)** | Yes | Yes | `TicketRules.assertCanAddInternalNote` |
| **View Internal Notes** | **NEVER** | Yes | Yes | `messageRepository` query filter |
| **Download Attachments** | Yes (own ticket) | Yes | Yes | `attachment.service.getAttachmentStream` |
| **Download Other User's Attachment** | **NO (403)** | Yes | Yes | `TicketRules.assertCanViewTicket` |
| **Trigger AI Triage** | No | Yes | Yes | `requireRole(AGENT, ADMIN)` |
| **Submit CSAT Feedback** | Yes (own resolved) | No | No | `feedback.service.createFeedback` |
| **Manage Users / Teams / Categories** | **NO (403)** | **NO (403)** | Yes | `requireRole(ADMIN)` |
| **View Audit Logs & AI Telemetry** | **NO (403)** | **NO (403)** | Yes | `requireRole(ADMIN)` |
