import mongoose, { Schema } from 'mongoose';

export interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>('Counter', counterSchema);

export const getNextSequenceValue = async (sequenceName: string): Promise<number> => {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument ? sequenceDocument.seq : 1;
};

export const generateTicketNumber = async (): Promise<string> => {
  const seq = await getNextSequenceValue('ticketNumber');
  return `TKT-${String(seq).padStart(6, '0')}`;
};
