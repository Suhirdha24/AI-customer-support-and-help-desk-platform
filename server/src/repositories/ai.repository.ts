import { AIAnalysis, IAIAnalysis } from '../models/AIAnalysis.js';
import { AIUsageLog, IAIUsageLog } from '../models/AIUsageLog.js';

export class AIRepository {
  async createAnalysis(data: Partial<IAIAnalysis>): Promise<IAIAnalysis> {
    const analysis = new AIAnalysis(data);
    return analysis.save();
  }

  async findAnalysisByTicketId(ticketId: string): Promise<IAIAnalysis | null> {
    return AIAnalysis.findOne({ ticketId }).sort({ createdAt: -1 }).exec();
  }

  async logUsage(data: Partial<IAIUsageLog>): Promise<IAIUsageLog> {
    const log = new AIUsageLog(data);
    return log.save();
  }

  async getUsageStats(): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    failureRate: number;
    averageLatencyMs: number;
  }> {
    const res = await AIUsageLog.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] },
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$status', 'FAILURE'] }, 1, 0] },
          },
          avgLatency: { $avg: '$latencyMs' },
        },
      },
    ]);

    if (!res || res.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        failureRate: 0,
        averageLatencyMs: 0,
      };
    }

    const row = res[0];
    const total = row.total || 0;
    const failures = row.failureCount || 0;
    const failureRate = total > 0 ? Math.round((failures / total) * 10000) / 100 : 0;

    return {
      totalRequests: total,
      successfulRequests: row.successCount || 0,
      failedRequests: failures,
      failureRate,
      averageLatencyMs: Math.round(row.avgLatency || 0),
    };
  }

  async listRecentLogs(limit = 50): Promise<IAIUsageLog[]> {
    return AIUsageLog.find()
      .populate('ticketId', 'ticketNumber subject')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}

export const aiRepository = new AIRepository();
