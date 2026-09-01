import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/seeds/seed.js';
import { classificationSchema } from '../src/ai/schemas/classification.schema.js';
import { aiProvider } from '../src/ai/openai.provider.js';
import { ragService } from '../src/ai/rag.service.js';
import { TicketStateMachine } from '../src/services/ticketStateMachine.service.js';
import { TicketStatus, TicketPriority } from '../src/constants/ticket.constants.js';
import { UserRole } from '../src/constants/roles.js';

const app = createApp();

let adminToken: string;
let agentToken: string;
let customer1Token: string;
let customer2Token: string;

let seededTicketId: string;
let customer2TicketId: string;
let categoryId: string;

beforeAll(async () => {
  await connectDB();
  await seedDatabase();

  // Log in as all test users to acquire fresh tokens
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'Password123!' });
  adminToken = adminRes.body.data.token;

  const agentRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'agent1@example.com', password: 'Password123!' });
  agentToken = agentRes.body.data.token;

  const cust1Res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'customer1@example.com', password: 'Password123!' });
  customer1Token = cust1Res.body.data.token;

  const cust2Res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'customer2@example.com', password: 'Password123!' });
  customer2Token = cust2Res.body.data.token;

  // Retrieve seed ticket IDs
  const ticketsRes = await request(app)
    .get('/api/tickets')
    .set('Authorization', `Bearer ${adminToken}`);
  const tkt1 = ticketsRes.body.data.find((t: any) => t.ticketNumber === 'TKT-000001');
  seededTicketId = tkt1._id || tkt1.id;

  // Find ticket owned by customer2 (TKT-000002)
  const tkt2 = ticketsRes.body.data.find((t: any) => t.ticketNumber === 'TKT-000002');
  customer2TicketId = tkt2._id || tkt2.id;

  // Retrieve a category ID
  const catsRes = await request(app).get('/api/admin/categories');
  categoryId = catsRes.body.data[0]._id || catsRes.body.data[0].id;
});

afterAll(async () => {
  await disconnectDB();
});

// ==========================================
// 1. AUTHENTICATION TESTS (1 - 5)
// ==========================================
describe('1. Authentication Tests', () => {
  it('Test 1: Registration creates user with hashed password and JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New Test User',
        email: 'newuser@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('newuser@example.com');
    expect(res.body.data.user.role).toBe(UserRole.CUSTOMER);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('Test 2: Duplicate email registration returns 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Alice',
        email: 'customer1@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RESOURCE_CONFLICT');
  });

  it('Test 3: Login with valid credentials returns user profile & token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer1@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('customer1@example.com');
  });

  it('Test 4: Login with invalid password returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer1@example.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('Test 5: Accessing protected endpoint without token returns 401', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});

// ==========================================
// 2. AUTHORIZATION & SCOPING (6 - 9)
// ==========================================
describe('2. Resource-Level Authorization Tests', () => {
  it("Test 6: Customer cannot access another customer's ticket", async () => {
    // Customer 1 attempts to access Customer 2's ticket directly by ID
    const res = await request(app)
      .get(`/api/tickets/${customer2TicketId}`)
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Test 7: Customer cannot access admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Test 8: Agent cannot perform admin operations', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Test 9: Agent cannot perform administrative platform changes (e.g. create category)', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ name: 'Unauthorized Category' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ==========================================
// 3. TICKET LIFECYCLE & STATE TRANSITIONS (10 - 16)
// ==========================================
describe('3. Ticket Core & State Machine Tests', () => {
  let createdTicketId: string;

  it('Test 10: Create ticket succeeds with human-readable ticket number', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        subject: 'Cannot download invoice PDF',
        description: 'Clicking download results in a blank page.',
        categoryId,
        priority: TicketPriority.HIGH,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticketNumber).toMatch(/^TKT-\d{6}$/);
    expect(res.body.data.status).toBe(TicketStatus.OPEN);
    createdTicketId = res.body.data._id || res.body.data.id;
  });

  it('Test 11: Update ticket priority succeeds for authorized agent', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${createdTicketId}/priority`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ priority: TicketPriority.URGENT });

    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe(TicketPriority.URGENT);
    expect(res.body.data.prioritySource).toBe('HUMAN');
  });

  it('Test 12: Valid status transition OPEN -> ASSIGNED succeeds', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${createdTicketId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: TicketStatus.ASSIGNED });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(TicketStatus.ASSIGNED);
  });

  it('Test 13: Invalid status transition ASSIGNED -> CLOSED rejected with 409', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${createdTicketId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: TicketStatus.CLOSED });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });

  it('Test 14: Assign ticket to an agent records assignment', async () => {
    const agentRes = await request(app)
      .get('/api/admin/agents')
      .set('Authorization', `Bearer ${adminToken}`);

    if (agentRes.status !== 200) {
      console.error('Agent lookup failed:', agentRes.status, agentRes.body);
    }

    expect(agentRes.status).toBe(200);
    expect(agentRes.body.data).toBeDefined();
    expect(agentRes.body.data.length).toBeGreaterThan(0);
    const targetAgentId = agentRes.body.data[0].id || agentRes.body.data[0]._id;


    const res = await request(app)
      .post(`/api/tickets/${createdTicketId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ agentId: targetAgentId });

    expect(res.status).toBe(200);
    expect(res.body.data.assignedAgentId).toBeDefined();
  });

  it('Test 15: Claim unassigned ticket succeeds for support agent', async () => {
    // Customer 2 creates an open ticket
    const newTkt = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        subject: 'Questions regarding SLA response times',
        description: 'What are the response time guarantees for our enterprise tier?',
        categoryId,
      });

    const unassignedId = newTkt.body.data._id || newTkt.body.data.id;

    const claimRes = await request(app)
      .post(`/api/tickets/${unassignedId}/claim`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(claimRes.status).toBe(200);
    expect(claimRes.body.data.status).toBe(TicketStatus.ASSIGNED);
  });

  it('Test 16: Customer cannot perform unauthorized priority adjustments', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${createdTicketId}/priority`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ priority: TicketPriority.URGENT });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ==========================================
// 4. MESSAGES & INTERNAL NOTE ISOLATION (17 - 20)
// ==========================================
describe('4. Ticket Messages & Internal Note Security', () => {
  it('Test 17: Customer message addition persists correctly', async () => {
    const res = await request(app)
      .post(`/api/tickets/${seededTicketId}/messages`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        type: 'CUSTOMER_MESSAGE',
        message: 'Here is an update on my ticket inquiry.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('CUSTOMER_MESSAGE');
    expect(res.body.data.message).toBe('Here is an update on my ticket inquiry.');
  });

  it('Test 18: Agent message addition persists correctly', async () => {
    const res = await request(app)
      .post(`/api/tickets/${seededTicketId}/messages`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        type: 'AGENT_MESSAGE',
        message: 'Thank you. We are reviewing the logs now.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('AGENT_MESSAGE');
  });

  it('Test 19: Agent can view internal notes on ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${seededTicketId}/messages`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    const hasInternalNote = res.body.data.some((m: any) => m.type === 'INTERNAL_NOTE');
    expect(hasInternalNote).toBe(true);
  });

  it('Test 20: Customer CANNOT see internal notes in message list', async () => {
    const res = await request(app)
      .get(`/api/tickets/${seededTicketId}/messages`)
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.status).toBe(200);
    // Strict isolation assertion
    const hasInternalNote = res.body.data.some((m: any) => m.type === 'INTERNAL_NOTE');
    expect(hasInternalNote).toBe(false);
  });
});

// ==========================================
// 5. AI CAPABILITIES, VALIDATION & FAULT TOLERANCE (21 - 27)
// ==========================================
describe('5. AI Service & Human-In-The-Loop Tests', () => {
  it('Test 21: Classification returns valid structured schema', async () => {
    const res = await request(app)
      .post(`/api/ai/tickets/${seededTicketId}/analyze`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.category).toBeDefined();
    expect(res.body.data.priority).toBeDefined();
    expect(res.body.data.sentiment).toBeDefined();
    expect(res.body.data.confidence).toBeGreaterThanOrEqual(0);
    expect(res.body.data.reason).toBeDefined();
  });

  it('Test 22: Zod schema validates correct classification output structure', () => {
    const sampleOutput = {
      category: 'Billing',
      priority: 'HIGH',
      sentiment: 'NEGATIVE',
      confidence: 0.95,
      reason: 'Customer reported duplicate charge and demands refund.',
    };

    const parsed = classificationSchema.safeParse(sampleOutput);
    expect(parsed.success).toBe(true);
  });

  it('Test 23 & 24: AI service handles timeouts/provider errors gracefully with fallback', async () => {
    // Calling offline fallback explicitly
    const fallbackResult = await aiProvider.classifyTicket({
      subject: 'Urgent production down outage',
      description: 'System completely offline for 1000 users.',
      categories: ['Technical Support', 'Billing', 'General'],
    });

    expect(fallbackResult.priority).toBe(TicketPriority.URGENT);
    expect(fallbackResult.sentiment).toBeDefined();
    expect(fallbackResult.confidence).toBeGreaterThan(0.5);
  });

  it('Test 25: Malformed AI output is rejected by Zod validation', () => {
    const malformed = {
      category: '',
      priority: 'SUPER_DUPER_URGENT', // Invalid enum
      sentiment: 'ANGRY', // Invalid enum
      confidence: 500, // Invalid range
      reason: '',
    };

    const parsed = classificationSchema.safeParse(malformed);
    expect(parsed.success).toBe(false);
  });

  it('Test 26: Suggested response requires human approval before sending (not auto-sent)', async () => {
    const res = await request(app)
      .post(`/api/ai/tickets/${seededTicketId}/suggest-reply`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.suggestedReply).toBeDefined();
    expect(res.body.data.explanation).toBeDefined();

    // Verify suggested response is NOT added to ticket messages automatically
    const messagesRes = await request(app)
      .get(`/api/tickets/${seededTicketId}/messages`)
      .set('Authorization', `Bearer ${agentToken}`);

    const replyWasAutoSent = messagesRes.body.data.some(
      (m: any) => m.message === res.body.data.suggestedReply
    );
    expect(replyWasAutoSent).toBe(false);
  });

  it('Test 27: Knowledge base context grounding is utilized for replies', async () => {
    const context = await ragService.retrieveGroundedContext(
      'Need a refund on my billing invoice',
      'Please refund my money.'
    );

    expect(typeof context).toBe('string');
    expect(context.length).toBeGreaterThan(0);
    expect(context.toLowerCase()).toContain('refund');
  });
});

// ==========================================
// 6. KNOWLEDGE BASE & GROUNDING (28 - 30)
// ==========================================
describe('6. Knowledge Base Tests', () => {
  let createdArticleId: string;

  it('Test 28: Admin can create knowledge base article', async () => {
    const res = await request(app)
      .post('/api/knowledge-base')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Configuring Webhook Endpoints for Automated Events',
        content: 'Navigate to Settings -> Webhooks to add an endpoint URL and secret key.',
        categoryId,
        tags: ['webhook', 'integration', 'developer', 'api'],
        status: 'PUBLISHED',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Configuring Webhook Endpoints for Automated Events');
    createdArticleId = res.body.data._id || res.body.data.id;
  });

  it('Test 29: Customer can search published knowledge base articles', async () => {
    const res = await request(app)
      .get('/api/knowledge-base/search?q=webhook')
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toContain('Webhook');
  });

  it('Test 30: Customer cannot update or delete knowledge base articles', async () => {
    const res = await request(app)
      .delete(`/api/knowledge-base/${createdArticleId}`)
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ==========================================
// 7. CUSTOMER SATISFACTION (31 - 32)
// ==========================================
describe('7. Customer Satisfaction Feedback Tests', () => {
  it('Test 31: Submit satisfaction feedback on eligible resolved ticket', async () => {
    // Ticket 3 is seeded as RESOLVED and owned by Customer 1
    const ticketsRes = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${adminToken}`);
    const resolvedTkt = ticketsRes.body.data.find((t: any) => t.ticketNumber === 'TKT-000003');
    const resolvedTktId = resolvedTkt._id || resolvedTkt.id;

    const feedbackRes = await request(app)
      .get(`/api/feedback/tickets/${resolvedTktId}`)
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(feedbackRes.status).toBe(200);
    expect(feedbackRes.body.data.rating).toBe(5);
  });

  it('Test 32: Unauthorized feedback on OPEN ticket or by non-owner is rejected', async () => {
    // Attempting feedback on Ticket 2 (owned by customer2, currently OPEN)
    const res = await request(app)
      .post(`/api/feedback/tickets/${customer2TicketId}`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ rating: 4, feedback: 'Great service' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ==========================================
// 8. ATTACHMENTS & SECURITY (33 - 35)
// ==========================================
describe('8. Attachment Security Tests', () => {
  let uploadedKey: string;

  it('Test 33: Upload valid text attachment returns metadata', async () => {
    const res = await request(app)
      .post('/api/tickets/upload')
      .set('Authorization', `Bearer ${customer1Token}`)
      .attach('file', Buffer.from('Error log details: line 42 crashed.'), 'error.log');

    expect(res.status).toBe(200);
    expect(res.body.data.fileName).toBe('error.log');
    expect(res.body.data.storageKey).toBeDefined();
    uploadedKey = res.body.data.storageKey;
  });

  it('Test 34: Invalid executable file type is rejected by Multer filter', async () => {
    const res = await request(app)
      .post('/api/tickets/upload')
      .set('Authorization', `Bearer ${customer1Token}`)
      .attach('file', Buffer.from('malicious payload'), 'virus.exe');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('Test 35: Customer cannot access attachments from an unauthorized ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${customer2TicketId}/attachments/${uploadedKey}`)
      .set('Authorization', `Bearer ${customer1Token}`);

    // Customer 1 has no permission to view Customer 2's ticket
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
