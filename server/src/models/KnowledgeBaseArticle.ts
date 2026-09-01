import mongoose, { Document, Schema } from 'mongoose';
import { KBStatus, KBStatusType } from '../constants/ticket.constants.js';

export interface IKnowledgeBaseArticle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  categoryId: mongoose.Types.ObjectId;
  tags: string[];
  status: KBStatusType;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const kbArticleSchema = new Schema<IKnowledgeBaseArticle>(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: Object.values(KBStatus),
      default: KBStatus.DRAFT,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

kbArticleSchema.index({ status: 1, categoryId: 1 });
kbArticleSchema.index(
  { title: 'text', content: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, content: 1 } }
);

export const KnowledgeBaseArticle = mongoose.model<IKnowledgeBaseArticle>(
  'KnowledgeBaseArticle',
  kbArticleSchema
);
