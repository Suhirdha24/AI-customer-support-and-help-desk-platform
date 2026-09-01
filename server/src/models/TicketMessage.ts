import mongoose, { Document, Schema } from 'mongoose';
import { MessageType, MessageTypeType } from '../constants/ticket.constants.js';
import { UserRoleType } from '../constants/roles.js';

export interface IAttachment {
  _id?: mongoose.Types.ObjectId;
  fileName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ITicketMessage extends Document {
  _id: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorRole: UserRoleType;
  type: MessageTypeType;
  message: string;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    fileName: { type: String, required: true },
    storageKey: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket ID is required'],
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
    },
    authorRole: {
      type: String,
      required: [true, 'Author role is required'],
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      required: [true, 'Message type is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    attachments: [attachmentSchema],
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

// Compound index to fetch messages chronologically for a ticket
ticketMessageSchema.index({ ticketId: 1, createdAt: 1 });

export const TicketMessage = mongoose.model<ITicketMessage>('TicketMessage', ticketMessageSchema);
