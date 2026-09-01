import { TicketMessage, ITicketMessage } from '../models/TicketMessage.js';
import { MessageType } from '../constants/ticket.constants.js';

export class MessageRepository {
  async create(data: Partial<ITicketMessage>): Promise<ITicketMessage> {
    const message = new TicketMessage(data);
    return message.save();
  }

  async findByTicketId(ticketId: string, includeInternalNotes = false): Promise<ITicketMessage[]> {
    const filter: Record<string, any> = { ticketId };
    
    // Crucial Security Boundary: strictly strip INTERNAL_NOTE from query when false
    if (!includeInternalNotes) {
      filter.type = { $ne: MessageType.INTERNAL_NOTE };
    }

    return TicketMessage.find(filter)
      .populate('authorId', 'name email role avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async countByTicketId(ticketId: string, includeInternalNotes = false): Promise<number> {
    const filter: Record<string, any> = { ticketId };
    if (!includeInternalNotes) {
      filter.type = { $ne: MessageType.INTERNAL_NOTE };
    }
    return TicketMessage.countDocuments(filter).exec();
  }
}

export const messageRepository = new MessageRepository();
