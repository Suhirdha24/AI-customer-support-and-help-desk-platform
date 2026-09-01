import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service.js';

export class MessageController {
  async createMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await messageService.createMessage(
        req.user!,
        req.params.id,
        req.body
      );
      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async listMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await messageService.listMessages(req.user!, req.params.id);
      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
