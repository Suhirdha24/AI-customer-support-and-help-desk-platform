import mongoose, { Schema } from 'mongoose';
import { AuditEventType, AuditEventTypeType } from '../constants/events.js';
import { UserRoleType } from '../constants/roles.js';

export interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorRole: UserRoleType;
  eventType: AuditEventTypeType;
  ticketId: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: Object.values(AuditEventType),
      required: true,
      index: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

auditLogSchema.index({ ticketId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
