import { Ticket, ITicket } from '../models/Ticket.js';
import { generateTicketNumber } from '../models/Counter.js';

export interface TicketListOptions {
  filter: Record<string, any>;
  sort?: Record<string, any>;
  skip?: number;
  limit?: number;
}

export class TicketRepository {
  async create(data: Partial<ITicket>): Promise<ITicket> {
    if (!data.ticketNumber) {
      data.ticketNumber = await generateTicketNumber();
    }
    const ticket = new Ticket(data);
    return ticket.save();
  }

  async findById(id: string): Promise<ITicket | null> {
    return Ticket.findById(id)
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .populate('categoryId', 'name')
      .populate('teamId', 'name')
      .populate('aiAnalysisId')
      .exec();
  }

  async findByNumber(ticketNumber: string): Promise<ITicket | null> {
    return Ticket.findOne({ ticketNumber: ticketNumber.toUpperCase().trim() })
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .populate('categoryId', 'name')
      .populate('teamId', 'name')
      .populate('aiAnalysisId')
      .exec();
  }

  async update(id: string, updateData: Partial<ITicket>): Promise<ITicket | null> {
    return Ticket.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .populate('categoryId', 'name')
      .populate('teamId', 'name')
      .populate('aiAnalysisId')
      .exec();
  }

  async list(options: TicketListOptions): Promise<ITicket[]> {
    const { filter, sort = { createdAt: -1 }, skip = 0, limit = 20 } = options;

    return Ticket.find(filter)
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .populate('categoryId', 'name')
      .populate('teamId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: Record<string, any>): Promise<number> {
    return Ticket.countDocuments(filter).exec();
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return Ticket.aggregate(pipeline).exec();
  }
}

export const ticketRepository = new TicketRepository();
