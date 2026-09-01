import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/user.repository.js';
import { teamRepository } from '../repositories/team.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { aiRepository } from '../repositories/ai.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { ticketRepository } from '../repositories/ticket.repository.js';
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError.js';
import { UserRole } from '../constants/roles.js';

export class AdminController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        userRepository.list(filter, skip, limit),
        userRepository.count(filter),
      ]);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userRepository.findById(req.params.id);
      if (!user) {
        throw new NotFoundError('User not found.');
      }

      // Safety Rule: Never allow an admin to deactivate the last active administrator
      if (user.role === UserRole.ADMIN && user.isActive) {
        const activeAdminsCount = await userRepository.count({
          role: UserRole.ADMIN,
          isActive: true,
        });
        if (activeAdminsCount <= 1) {
          throw new ConflictError('Cannot deactivate the last active administrator in the platform.');
        }
      }

      const updated = await userRepository.update(req.params.id, {
        isActive: !user.isActive,
      });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body;
      if (!Object.values(UserRole).includes(role)) {
        throw new ValidationError('Invalid user role specified.');
      }

      const user = await userRepository.findById(req.params.id);
      if (!user) {
        throw new NotFoundError('User not found.');
      }

      if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
        const activeAdminsCount = await userRepository.count({
          role: UserRole.ADMIN,
          isActive: true,
        });
        if (activeAdminsCount <= 1) {
          throw new ConflictError('Cannot demote the last active administrator.');
        }
      }

      const updated = await userRepository.update(req.params.id, { role });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async listAgents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agents = await userRepository.findAgents();
      // Calculate workload for each agent
      const workloads = await ticketRepository.aggregate([
        { $match: { assignedAgentId: { $in: agents.map((a) => a._id) } } },
        {
          $group: {
            _id: '$assignedAgentId',
            openCount: {
              $sum: { $cond: [{ $nin: ['$status', ['RESOLVED', 'CLOSED']] }, 1, 0] },
            },
          },
        },
      ]);

      const workloadMap = new Map<string, number>();
      workloads.forEach((w) => workloadMap.set(w._id.toString(), w.openCount));

      const agentList = agents.map((agent) => ({
        ...agent.toJSON(),
        activeTickets: workloadMap.get(agent._id.toString()) || 0,
      }));

      res.status(200).json({
        success: true,
        data: agentList,
      });
    } catch (error) {
      next(error);
    }
  }

  async listTeams(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teams = await teamRepository.list(false);
      res.status(200).json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  }

  async createTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const team = await teamRepository.create(req.body);
      res.status(201).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  async updateTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const team = await teamRepository.update(req.params.id, req.body);
      if (!team) throw new NotFoundError('Team not found.');
      res.status(200).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  async listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryRepository.list(false);
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryRepository.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryRepository.update(req.params.id, req.body);
      if (!category) throw new NotFoundError('Category not found.');
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async getAIUsageLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
      const logs = await aiRepository.listRecentLogs(limit);
      const stats = await aiRepository.getUsageStats();

      res.status(200).json({
        success: true,
        data: {
          stats,
          logs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
      const logs = await auditRepository.listRecent(limit);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
