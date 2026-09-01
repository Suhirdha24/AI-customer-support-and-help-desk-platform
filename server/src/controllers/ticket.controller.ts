import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket.service.js';

export class TicketController {
  async createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.createTicket(req.user!, req.body);
      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTicketById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.getTicketById(req.user!, req.params.id);
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async listTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ticketService.listTickets(req.user!, req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.updateTicketStatus(
        req.user!,
        req.params.id,
        req.body.status
      );
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePriority(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.updateTicketPriority(
        req.user!,
        req.params.id,
        req.body.priority
      );
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.assignTicket(
        req.user!,
        req.params.id,
        req.body.agentId
      );
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async claimTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.claimTicket(req.user!, req.params.id);
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ticketController = new TicketController();
