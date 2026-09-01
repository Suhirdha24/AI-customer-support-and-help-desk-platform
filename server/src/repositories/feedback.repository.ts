import { TicketFeedback, ITicketFeedback } from '../models/TicketFeedback.js';

export class FeedbackRepository {
  async create(data: Partial<ITicketFeedback>): Promise<ITicketFeedback> {
    const feedback = new TicketFeedback(data);
    return feedback.save();
  }

  async findByTicketId(ticketId: string): Promise<ITicketFeedback | null> {
    return TicketFeedback.findOne({ ticketId }).populate('customerId', 'name email').exec();
  }

  async getAverageRating(): Promise<{ averageRating: number; totalFeedback: number }> {
    const res = await TicketFeedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 },
        },
      },
    ]);

    if (!res || res.length === 0) {
      return { averageRating: 0, totalFeedback: 0 };
    }

    return {
      averageRating: Math.round(res[0].averageRating * 10) / 10,
      totalFeedback: res[0].totalFeedback,
    };
  }

  async getRatingDistribution(): Promise<Record<number, number>> {
    const res = await TicketFeedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    res.forEach((r) => {
      dist[r._id] = r.count;
    });

    return dist;
  }
}

export const feedbackRepository = new FeedbackRepository();
