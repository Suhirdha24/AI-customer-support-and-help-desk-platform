import mongoose, { Document, Schema } from 'mongoose';
import { Sentiment, SentimentType } from '../constants/ticket.constants.js';

export interface IAIAnalysis extends Document {
  _id: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  category: string;
  priority: string;
  sentiment: SentimentType;
  confidence: number;
  reason: string;
  model: string;
  rawResponse?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String,
      enum: Object.values(Sentiment),
      default: Sentiment.NEUTRAL,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      default: 'gpt-4o-mini',
    },
    rawResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
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

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);
