import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../logger/logger.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Team } from '../models/Team.js';
import { Ticket } from '../models/Ticket.js';
import { TicketMessage } from '../models/TicketMessage.js';
import { KnowledgeBaseArticle } from '../models/KnowledgeBaseArticle.js';
import { TicketFeedback } from '../models/TicketFeedback.js';
import { AuditLog } from '../models/AuditLog.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { Notification } from '../models/Notification.js';
import { Counter } from '../models/Counter.js';
import { UserRole } from '../constants/roles.js';
import {
  TicketStatus,
  TicketPriority,
  PrioritySource,
  MessageType,
  KBStatus,
  Sentiment,
} from '../constants/ticket.constants.js';
import { AuditEventType, NotificationType } from '../constants/events.js';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Connecting to MongoDB and starting seed...');
    await connectDB();
    console.log('🌱 Seeding database...');


    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Team.deleteMany({}),
      Ticket.deleteMany({}),
      TicketMessage.deleteMany({}),
      KnowledgeBaseArticle.deleteMany({}),
      TicketFeedback.deleteMany({}),
      AuditLog.deleteMany({}),
      AIAnalysis.deleteMany({}),
      Notification.deleteMany({}),
      Counter.deleteMany({}),
    ]);

    // 1. Password Hash (Default demo password: Password123!)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // 2. Seed Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    });

    const agent1 = await User.create({
      name: 'Sarah Connor (Senior Agent)',
      email: 'agent1@example.com',
      passwordHash,
      role: UserRole.AGENT,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    });

    const agent2 = await User.create({
      name: 'John Miller (Support Specialist)',
      email: 'agent2@example.com',
      passwordHash,
      role: UserRole.AGENT,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    });

    const customer1 = await User.create({
      name: 'Alice Johnson',
      email: 'customer1@example.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    });

    const customer2 = await User.create({
      name: 'Bob Smith',
      email: 'customer2@example.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    });

    logger.info('✅ Users seeded successfully.');

    // 3. Seed Teams
    const teamBilling = await Team.create({
      name: 'Billing & Finance',
      description: 'Resolves disputes, invoices, payment queries, and refunds.',
      leadId: agent1._id,
      memberIds: [agent1._id],
      isActive: true,
    });

    const teamTech = await Team.create({
      name: 'Technical Support (Tier 2)',
      description: 'Handles server errors, API defects, and complex platform bugs.',
      leadId: agent2._id,
      memberIds: [agent1._id, agent2._id],
      isActive: true,
    });

    // Update agent team associations
    await User.findByIdAndUpdate(agent1._id, { teamIds: [teamBilling._id, teamTech._id] });
    await User.findByIdAndUpdate(agent2._id, { teamIds: [teamTech._id] });

    logger.info('✅ Teams seeded.');

    // 4. Seed Categories
    const categoryNames = [
      { name: 'Billing', description: 'Invoices, charges, payment gateways, and refunds.' },
      { name: 'Technical Support', description: 'Errors, application crashes, bugs, and API issues.' },
      { name: 'Account', description: 'Profile management, logins, 2FA, and authentication.' },
      { name: 'Orders', description: 'Order placement, status, history, and modifications.' },
      { name: 'Payments', description: 'Credit cards, bank transfers, and payment processing.' },
      { name: 'Shipping', description: 'Delivery tracking, transit delays, and address corrections.' },
      { name: 'General', description: 'General questions and miscellaneous feedback.' },
    ];

    const categories = await Category.insertMany(categoryNames);
    const catBilling = categories.find((c) => c.name === 'Billing')!;
    const catTech = categories.find((c) => c.name === 'Technical Support')!;
    const catAccount = categories.find((c) => c.name === 'Account')!;

    logger.info('✅ Categories seeded.');

    // 5. Seed Knowledge Base Articles
    await KnowledgeBaseArticle.insertMany([
      {
        title: 'Refund and Cancellation Policy Guidelines',
        content: `Customers are entitled to a full refund within 30 days of purchase if they experience billing discrepancies or duplicate charges.
Refunds are processed to the original payment method within 3 to 5 business days after agent verification.
For duplicate charges, the support agent verifies the Stripe/payment transaction ID before issuing the credit.`,
        categoryId: catBilling._id,
        tags: ['refund', 'billing', 'dispute', 'cancellation', 'invoice'],
        status: KBStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
      {
        title: 'Troubleshooting Login & Password Reset Issues',
        content: `If you are unable to login to your account, follow these steps:
1. Click "Forgot Password" on the login screen.
2. Enter your registered email address to receive a secure 6-digit verification code.
3. Check your spam folder if the email does not arrive within 2 minutes.
4. If your account is locked due to consecutive failed attempts, wait 15 minutes or contact our support team.`,
        categoryId: catAccount._id,
        tags: ['login', 'password', 'reset', 'authentication', '2fa'],
        status: KBStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
      {
        title: 'Resolving API 500 Internal Server Errors',
        content: `An HTTP 500 error signifies an unexpected server-side exception.
1. Check our public Status Page at status.company.com for active maintenance or incidents.
2. Verify that your API request payload contains valid JSON and complies with the OpenAPI specification.
3. Ensure your authentication header is formatted as: 'Authorization: Bearer <token>'.
4. If the error persists, open a Technical Support ticket including your 'X-Request-ID' header.`,
        categoryId: catTech._id,
        tags: ['api', '500', 'server', 'error', 'bug'],
        status: KBStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
    ]);

    logger.info('✅ Knowledge base articles seeded.');

    // 6. Seed Tickets, AI Analysis, Messages & Audit Logs
    // Ticket 1: Double charged (Billing)
    const tkt1 = await Ticket.create({
      ticketNumber: 'TKT-000001',
      customerId: customer1._id,
      subject: 'Double charged on invoice #INV-9821',
      description: 'I was charged twice on my credit card for invoice #INV-9821 yesterday. Please issue a refund for the duplicate charge.',
      categoryId: catBilling._id,
      priority: TicketPriority.HIGH,
      prioritySource: PrioritySource.HUMAN,
      status: TicketStatus.IN_PROGRESS,
      assignedAgentId: agent1._id,
      teamId: teamBilling._id,
      lastCustomerMessageAt: new Date(Date.now() - 3600000 * 4),
      lastAgentMessageAt: new Date(Date.now() - 3600000 * 2),
    });

    const aiAnalysis1 = await AIAnalysis.create({
      ticketId: tkt1._id,
      category: 'Billing',
      priority: TicketPriority.HIGH,
      sentiment: Sentiment.NEGATIVE,
      confidence: 0.94,
      reason: 'Customer reported a duplicate credit card charge and requested a refund.',
      model: 'gpt-4o-mini',
    });

    await Ticket.findByIdAndUpdate(tkt1._id, { aiAnalysisId: aiAnalysis1._id });

    // Ticket 1 Messages
    await TicketMessage.create([
      {
        ticketId: tkt1._id,
        authorId: customer1._id,
        authorRole: UserRole.CUSTOMER,
        type: MessageType.CUSTOMER_MESSAGE,
        message: 'I was charged twice on my credit card for invoice #INV-9821 yesterday. Please issue a refund for the duplicate charge.',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        ticketId: tkt1._id,
        authorId: agent1._id,
        authorRole: UserRole.AGENT,
        type: MessageType.INTERNAL_NOTE,
        message: 'INTERNAL NOTE: Verified payment processor records. Transaction tx_8829910 was indeed duplicated due to network retry. Preparing refund approval.',
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        ticketId: tkt1._id,
        authorId: agent1._id,
        authorRole: UserRole.AGENT,
        type: MessageType.AGENT_MESSAGE,
        message: 'Hello Alice, thank you for bringing this to our attention. We have identified the duplicate transaction and have forwarded it to our finance department for an immediate reversal.',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ]);

    await AuditLog.create([
      {
        actorId: customer1._id,
        actorRole: UserRole.CUSTOMER,
        eventType: AuditEventType.TICKET_CREATED,
        ticketId: tkt1._id,
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        actorId: agent1._id,
        actorRole: UserRole.AGENT,
        eventType: AuditEventType.TICKET_CLAIMED,
        ticketId: tkt1._id,
        createdAt: new Date(Date.now() - 3600000 * 3.5),
      },
      {
        actorId: agent1._id,
        actorRole: UserRole.AGENT,
        eventType: AuditEventType.INTERNAL_NOTE_ADDED,
        ticketId: tkt1._id,
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
    ]);

    // Ticket 2: Urgent Outage (Tech Support)
    const tkt2 = await Ticket.create({
      ticketNumber: 'TKT-000002',
      customerId: customer2._id,
      subject: 'Critical production 500 error blocking checkout',
      description: 'Our customers are unable to complete purchases. The checkout API endpoint is throwing 500 Internal Server Errors continuously. Urgent fix needed!',
      categoryId: catTech._id,
      priority: TicketPriority.URGENT,
      prioritySource: PrioritySource.AI,
      status: TicketStatus.OPEN,
      lastCustomerMessageAt: new Date(Date.now() - 3600000 * 1),
    });

    const aiAnalysis2 = await AIAnalysis.create({
      ticketId: tkt2._id,
      category: 'Technical Support',
      priority: TicketPriority.URGENT,
      sentiment: Sentiment.NEGATIVE,
      confidence: 0.98,
      reason: 'Production outage blocking business transactions reported by customer.',
      model: 'gpt-4o-mini',
    });

    await Ticket.findByIdAndUpdate(tkt2._id, { aiAnalysisId: aiAnalysis2._id });

    await TicketMessage.create({
      ticketId: tkt2._id,
      authorId: customer2._id,
      authorRole: UserRole.CUSTOMER,
      type: MessageType.CUSTOMER_MESSAGE,
      message: 'Our customers are unable to complete purchases. The checkout API endpoint is throwing 500 Internal Server Errors continuously. Urgent fix needed!',
      createdAt: new Date(Date.now() - 3600000 * 1),
    });

    // Ticket 3: Resolved Ticket with Customer Feedback
    const tkt3 = await Ticket.create({
      ticketNumber: 'TKT-000003',
      customerId: customer1._id,
      subject: 'Need to update billing contact email',
      description: 'Hello, our accounting department has a new email address. Please update our records.',
      categoryId: catAccount._id,
      priority: TicketPriority.LOW,
      prioritySource: PrioritySource.HUMAN,
      status: TicketStatus.RESOLVED,
      assignedAgentId: agent2._id,
      teamId: teamTech._id,
      resolvedAt: new Date(Date.now() - 3600000 * 12),
      createdAt: new Date(Date.now() - 3600000 * 24),
    });

    await TicketMessage.create([
      {
        ticketId: tkt3._id,
        authorId: customer1._id,
        authorRole: UserRole.CUSTOMER,
        type: MessageType.CUSTOMER_MESSAGE,
        message: 'Hello, our accounting department has a new email address. Please update our records.',
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        ticketId: tkt3._id,
        authorId: agent2._id,
        authorRole: UserRole.AGENT,
        type: MessageType.AGENT_MESSAGE,
        message: 'Hello Alice, your billing contact email has been successfully updated in our system. Have a great day!',
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
    ]);

    await TicketFeedback.create({
      ticketId: tkt3._id,
      customerId: customer1._id,
      rating: 5,
      feedback: 'Very swift response and handled my request immediately. Outstanding service!',
      createdAt: new Date(Date.now() - 3600000 * 10),
    });

    // Initialize sequence counter to 3
    await Counter.create({ _id: 'ticketNumber', seq: 3 });

    logger.info('✅ Tickets, messages, feedback, and audit logs seeded.');
    logger.info('🎉 SEEDING COMPLETE!');
    logger.info('----------------------------------------------------');
    logger.info('Demo Credentials:');
    logger.info('Admin:    admin@example.com     / Password123!');
    logger.info('Agent 1:  agent1@example.com    / Password123!');
    logger.info('Agent 2:  agent2@example.com    / Password123!');
    logger.info('Customer: customer1@example.com / Password123!');
    logger.info('Customer: customer2@example.com / Password123!');
    logger.info('----------------------------------------------------');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

const isMainModule = () => {
  try {
    if (!process.argv[1]) return false;
    const arg = process.argv[1].toLowerCase();
    return arg.includes('seed.ts') || arg.includes('seed.js');
  } catch {
    return false;
  }
};

if (isMainModule()) {
  seedDatabase()
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      disconnectDB().finally(() => process.exit(1));
    });
}


