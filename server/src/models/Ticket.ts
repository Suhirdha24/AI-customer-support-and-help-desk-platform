import mongoose, { Schema } from 'mongoose';
import {
  TicketPriority,
  TicketPriorityType,
  TicketStatus,
  TicketStatusType,
  PrioritySource,
  PrioritySourceType,
} from '../constants/ticket.constants.js';

export interface ITicket {
  _id: mongoose.Types.ObjectId;
  id?: string;
  ticketNumber: string;
  customerId: mongoose.Types.ObjectId | any;
  subject: string;
  description: string;
  categoryId: mongoose.Types.ObjectId | any;
  priority: TicketPriorityType;
  prioritySource: PrioritySourceType;
  status: TicketStatusType;
  assignedAgentId?: mongoose.Types.ObjectId | any;
  teamId?: mongoose.Types.ObjectId | any;
  aiAnalysisId?: mongoose.Types.ObjectId | any;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  reopenedAt?: Date;
  lastCustomerMessageAt?: Date;
  lastAgentMessageAt?: Date;
  metadata?: Record<string, any>;
}

const ticketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.MEDIUM,
      index: true,
    },
    prioritySource: {
      type: String,
      enum: Object.values(PrioritySource),
      default: PrioritySource.HUMAN,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
      index: true,
    },
    assignedAgentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    aiAnalysisId: {
      type: Schema.Types.ObjectId,
      ref: 'AIAnalysis',
    },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    reopenedAt: { type: Date },
    lastCustomerMessageAt: { type: Date },
    lastAgentMessageAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for optimized querying & filtering
ticketSchema.index({ customerId: 1, createdAt: -1 });
ticketSchema.index({ assignedAgentId: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });
ticketSchema.index({ categoryId: 1, status: 1 });

// Full-text search index across ticketNumber, subject, and description
ticketSchema.index(
  { ticketNumber: 'text', subject: 'text', description: 'text' },
  { weights: { ticketNumber: 10, subject: 5, description: 1 } }
);

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
