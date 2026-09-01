import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  leadId?: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

export const Team = mongoose.model<ITeam>('Team', teamSchema);
