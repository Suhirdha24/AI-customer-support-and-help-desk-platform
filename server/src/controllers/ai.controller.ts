import { Request, Response, NextFunction } from 'express';
import { aiService } from '../ai/ai.service.js';

export class AIController {
  async classifyTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.classifyTicket(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async summarizeTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.summarizeTicket(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async suggestReply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.suggestReply(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
