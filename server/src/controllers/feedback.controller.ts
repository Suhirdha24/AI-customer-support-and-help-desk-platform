import { Request, Response, NextFunction } from 'express';
import { feedbackService } from '../services/feedback.service.js';

export class FeedbackController {
  async submitFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feedback = await feedbackService.submitFeedback(
        req.user!,
        req.params.ticketId,
        req.body
      );
      res.status(201).json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedbackForTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feedback = await feedbackService.getFeedbackForTicket(req.user!, req.params.ticketId);
      res.status(200).json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSatisfactionMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await feedbackService.getSatisfactionMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const feedbackController = new FeedbackController();
