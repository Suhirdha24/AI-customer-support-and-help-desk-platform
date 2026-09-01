import mongoose from 'mongoose';
import { ticketRepository } from '../repositories/ticket.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { feedbackRepository } from '../repositories/feedback.repository.js';
import { aiRepository } from '../repositories/ai.repository.js';
import { TicketStatus, TicketPriority } from '../constants/ticket.constants.js';
import { UserRole } from '../constants/roles.js';

export class DashboardService {
  async getCustomerDashboard(userId: string) {
    const customerObjectId = new mongoose.Types.ObjectId(userId);

    const [statusCounts, recentTickets] = await Promise.all([
      ticketRepository.aggregate([
        { $match: { customerId: customerObjectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      ticketRepository.list({
        filter: { customerId: customerObjectId },
        sort: { createdAt: -1 },
        skip: 0,
        limit: 5,
      }),
    ]);

    const counts: Record<string, number> = {
      total: 0,
      open: 0,
      inProgress: 0,
      waiting: 0,
      resolved: 0,
      closed: 0,
    };

    statusCounts.forEach((item) => {
      counts.total += item.count;
      if (item._id === TicketStatus.OPEN) counts.open += item.count;
      else if (item._id === TicketStatus.IN_PROGRESS || item._id === TicketStatus.ASSIGNED) counts.inProgress += item.count;
      else if (item._id === TicketStatus.WAITING_FOR_CUSTOMER) counts.waiting += item.count;
      else if (item._id === TicketStatus.RESOLVED) counts.resolved += item.count;
      else if (item._id === TicketStatus.CLOSED) counts.closed += item.count;
    });

    return {
      metrics: counts,
      totalTickets: counts.total,
      openTickets: counts.open,
      inProgressTickets: counts.inProgress,
      waitingTickets: counts.waiting,
      resolvedTickets: counts.resolved,
      closedTickets: counts.closed,
      recentTickets,
    };
  }

  async getAgentDashboard(agentId: string) {
    const agentObjectId = new mongoose.Types.ObjectId(agentId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [myTicketsCount, openUnassignedCount, urgentCount, waitingCount, resolvedTodayCount, myRecentTickets] =
      await Promise.all([
        ticketRepository.count({
          assignedAgentId: agentObjectId,
          status: { $nin: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
        }),
        ticketRepository.count({
          assignedAgentId: { $exists: false },
          status: TicketStatus.OPEN,
        }),
        ticketRepository.count({
          priority: TicketPriority.URGENT,
          status: { $nin: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
        }),
        ticketRepository.count({
          status: TicketStatus.WAITING_FOR_CUSTOMER,
        }),
        ticketRepository.count({
          assignedAgentId: agentObjectId,
          status: TicketStatus.RESOLVED,
          resolvedAt: { $gte: startOfToday },
        }),
        ticketRepository.list({
          filter: { assignedAgentId: agentObjectId },
          sort: { updatedAt: -1 },
          skip: 0,
          limit: 10,
        }),
      ]);

    return {
      metrics: {
        myTickets: myTicketsCount,
        openUnassigned: openUnassignedCount,
        urgentTickets: urgentCount,
        waitingForCustomer: waitingCount,
        resolvedToday: resolvedTodayCount,
      },
      myAssignedTickets: myTicketsCount,
      unassignedTickets: openUnassignedCount,
      urgentTickets: urgentCount,
      waitingCustomerTickets: waitingCount,
      resolvedToday: resolvedTodayCount,
      myRecentTickets,
      recentTickets: myRecentTickets,
    };
  }

  async getAdminDashboard() {
    const [
      totalCustomers,
      totalAgents,
      totalTickets,
      statusBreakdown,
      priorityBreakdown,
      categoryBreakdown,
      agentWorkload,
      avgResolutionData,
      csatStats,
      aiStats,
    ] = await Promise.all([
      userRepository.count({ role: UserRole.CUSTOMER }),
      userRepository.count({ role: UserRole.AGENT }),
      ticketRepository.count({}),
      ticketRepository.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      ticketRepository.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      ticketRepository.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$category.name',
            count: { $sum: 1 },
          },
        },
      ]),
      ticketRepository.aggregate([
        { $match: { assignedAgentId: { $exists: true } } },
        {
          $lookup: {
            from: 'users',
            localField: 'assignedAgentId',
            foreignField: '_id',
            as: 'agent',
          },
        },
        { $unwind: '$agent' },
        {
          $group: {
            _id: '$agent.name',
            count: { $sum: 1 },
          },
        },
      ]),
      ticketRepository.aggregate([
        {
          $match: {
            resolvedAt: { $exists: true },
            createdAt: { $exists: true },
          },
        },
        {
          $project: {
            durationHours: {
              $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageHours: { $avg: '$durationHours' },
          },
        },
      ]),
      feedbackRepository.getAverageRating(),
      aiRepository.getUsageStats(),
    ]);

    const avgResolutionHours =
      avgResolutionData.length > 0
        ? Math.round(avgResolutionData[0].averageHours * 10) / 10
        : 0;

    const openTicketsCount = statusBreakdown.find((s) => s._id === 'OPEN')?.count || 0;
    const resolvedTicketsCount = statusBreakdown.find((s) => s._id === 'RESOLVED')?.count || 0;

    return {
      overview: {
        totalCustomers,
        totalAgents,
        totalTickets,
        averageResolutionHours: avgResolutionHours,
      },
      totalTickets,
      openTickets: openTicketsCount,
      resolvedTickets: resolvedTicketsCount,
      csat: csatStats,
      aiUsage: aiStats,
      statusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
      priorityBreakdown: priorityBreakdown.map((p) => ({ priority: p._id, count: p.count })),
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c._id || 'Uncategorized',
        count: c.count,
      })),
      agentWorkload: agentWorkload.map((a) => ({ agent: a._id, activeTickets: a.count })),
      satisfaction: csatStats,
      aiMetrics: aiStats,
    };
  }
}

export const dashboardService = new DashboardService();
