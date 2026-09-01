import { AuditLog, IAuditLog } from '../models/AuditLog.js';

export class AuditRepository {
  async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
    const log = new AuditLog(data);
    return log.save();
  }

  async findByTicketId(ticketId: string, limit = 50): Promise<IAuditLog[]> {
    return AuditLog.find({ ticketId })
      .populate('actorId', 'name email role avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async listRecent(limit = 100): Promise<IAuditLog[]> {
    return AuditLog.find()
      .populate('actorId', 'name email role')
      .populate('ticketId', 'ticketNumber subject')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}

export const auditRepository = new AuditRepository();
