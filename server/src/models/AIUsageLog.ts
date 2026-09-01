import mongoose, { Document, Schema } from 'mongoose';

export interface IAIUsageLog extends Document {
  _id: mongoose.Types.ObjectId;
  operation: string;
  provider: string;
  model: string;
  ticketId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  status: 'SUCCESS' | 'FAILURE';
  latencyMs: number;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  errorType?: string;
  createdAt: Date;
}

const aiUsageLogSchema = new Schema<IAIUsageLog>(
  {
    operation: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      required: true,
      index: true,
    },
    latencyMs: {
      type: Number,
      required: true,
    },
    tokenUsage: {
      promptTokens: { type: Number },
      completionTokens: { type: Number },
      totalTokens: { type: Number },
    },
    errorType: {
      type: String,
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
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

aiUsageLogSchema.index({ status: 1, createdAt: -1 });

export const AIUsageLog = mongoose.model<IAIUsageLog>('AIUsageLog', aiUsageLogSchema);
